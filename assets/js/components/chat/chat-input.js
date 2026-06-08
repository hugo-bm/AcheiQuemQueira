import { BaseComponent } from '../base/base-component.js';
import {Events} from '../../core/events.js';

export class ChatInput extends BaseComponent {
    /**
     * Creates a new ChatInput instance.
     *
     * @param {Object} [options={}] Component configuration.
     * @param {number} [options.maxLength=1000] Maximum message length.
     * @param {string} [options.placeholder='Digite sua mensagem...'] Textarea placeholder.
     */
    constructor(options = {}) {
        super();

        this.maxLength = options.maxLength || 1000;
        this.placeholder = options.placeholder || 'Digite sua mensagem...';

        this.textarea = null;
        this.sendButton = null;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleSendClick = this.handleSendClick.bind(this);
    }

    /**
     * Returns component HTML.
     *
     * @returns {string}
     */
    render() {
        return `<form class="chat-input-form chat-input-wrapper border-top border-2 aq-shadow-sm bg-body p-2">
                <div class="d-flex align-items-center gap-2">
                    <textarea
                        class="form-control chat-input-textarea"
                        rows="1"
                        maxlength="${this.maxLength}"
                        placeholder="${this.placeholder}"
                        enterkeyhint="send"
                    ></textarea>
                    <button
                        type="submit"
                        class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center chat-send-btn d-md-none"
                        aria-label="Enviar mensagem"
                        style="width:48px;height:48px;"
                    >
                        <i class="bi bi-send-fill" aria-hidden="true"></i>
                    </button>
                    <button
                        type="submit"
                        class="btn aq-btn-primary d-none d-md-inline-flex align-items-center gap-2 chat-send-btn"
                        aria-label="Enviar mensagem"
                    >
                        <i class="bi bi-send-fill" aria-hidden="true"></i>
                        <span>Enviar</span>
                    </button>
                </div>
            </form>`.trim();
    }

    /**
     * Mounts the component into a container.
     *
     * @param {HTMLElement} container Target container.
     * @returns {ChatInput}
     */
    mount(container) {
        super.mount(container);

        this.textarea = this.element.querySelector('.chat-input-textarea');

         // Centralizes the submission on the form submission page (Works for both click and mobile keyboard)
        this.addListener(
            this.element,
            'submit',
            (e) => {
                e.preventDefault();
                this.sendMessage();
            }
        );

        this.addListener(
            this.textarea,
            'keydown',
            this.handleKeyDown
        );

        this.addListener(
            this.textarea,
            'input',
            this.handleInput
        );

        return this;
    }

    /**
     * Handles textarea input.
     *
     * @private
     */
    handleInput() {
        this.autoResize();
    }

    /**
     * Handles keyboard events.
     *
     * Enter = send
     * Shift+Enter = newline
     *
     * @param {KeyboardEvent} event Keyboard event.
     * @private
     */
    handleKeyDown(event) {
        if (event.key !== 'Enter') {
            return;
        }

        // If you are using a mobile device, pressing Enter ALWAYS only breaks a line
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            // Allows native line break behavior, ignoring sending via this channel.
            return;
        }

        // Desktop Rule (Enter sends, Shift+Enter skips to a new line)
        if (!event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    /**
     * Handles send button click.
     *
     * @private
     */
    handleSendClick() {
        this.sendMessage();
    }

    /**
     * Sends current message.
     *
     * @private
     */
    sendMessage() {
        const content = this.textarea.value.trim();

        if (!content) {
            return;
        }
        Events.emit(this.container,'chat:send-message', {
            content
        },true);

        this.clear();
        // Prevent the virtual keyboard from closing after each message.
        this.focus();
    }

    /**
     * Automatically adjusts textarea height.
     *
     * @private
     */
    autoResize() {
        if (!this.textarea) {
            return;
        }

        this.textarea.style.height = 'auto';
        this.textarea.style.height = `${this.textarea.scrollHeight}px`;
    }

    /**
     * Focuses the textarea.
     *
     * @public
     */
    focus() {
        this.textarea?.focus();
    }

    /**
     * Disables the input.
     *
     * @public
     */
    disable() {
        if (this.textarea) {
            this.textarea.disabled = true;
        }

        this.element
            ?.querySelectorAll('.chat-send-btn')
            .forEach((button) => {
                button.disabled = true;
            });
    }

    /**
     * Enables the input.
     *
     * @public
     */
    enable() {
        if (this.textarea) {
            this.textarea.disabled = false;
        }

        this.element
            ?.querySelectorAll('.chat-send-btn')
            .forEach((button) => {
                button.disabled = false;
            });
    }

    /**
     * Clears the textarea and resets height.
     *
     * @public
     */
    clear() {
        if (!this.textarea) {
            return;
        }

        this.textarea.value = '';
        this.textarea.style.height = '';
    }

    /**
     * Destroys component resources.
     *
     * @public
     */
    destroy() {
        this.textarea = null;
        this.sendButton = null;

        super.destroy();
    }
}