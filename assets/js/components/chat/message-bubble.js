import { BaseComponent } from '../base/base-component.js';

/**
 * MessageBubble component.
 *
 * Represents a single chat message.
 */
export class MessageBubble extends BaseComponent {
    /**
     * Creates a new MessageBubble instance.
     *
     * @param {Object} options Component options.
     * @param {Object|null} [options.message=null] Message data.
     * @param {boolean} [options.isOwnMessage=false] Indicates whether the message belongs to the current user.
     */
    constructor({
        message = null,
        isOwnMessage = false
    } = {}) {
        super();

        this.message = message;
        this.isOwnMessage = isOwnMessage;

        this.refs = {};
    }

    /**
     * Updates the message.
     *
     * Performs granular DOM updates when possible.
     *
     * @param {Object} message Updated message.
     */
    setMessage(message) {
        this.message = message;

        if (!this.element) {
            return;
        }

        this.updateContent();
    }

    /**
     * Updates message ownership.
     *
     * @param {boolean} isOwnMessage Indicates whether the message belongs to the current user.
     */
    setOwnMessage(isOwnMessage) {
        this.isOwnMessage = isOwnMessage;

        if (!this.element) {
            return;
        }

        this.updateLayout();
    }

    /**
     * Returns formatted time.
     *
     * @returns {string}
     */
    getFormattedTime() {
        if (!this.message?.createdAt) {
            return '';
        }

        return new Date(this.message.createdAt).toLocaleTimeString(
            [],
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );
    }

    /**
     * Returns message status label.
     *
     * @returns {string}
     */
    getReadStatusLabel() {
        if (!this.isOwnMessage) {
            return '';
        }

        return this.message?.read
            ? 'Lido'
            : 'Enviado';
    }

    /**
     * Converts URLs into clickable links.
     *
     * Executed only during initial rendering.
     *
     * @param {string} text Message content.
     *
     * @returns {string}
     */
    formatText(text = '') {
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        return text.replace(
            urlRegex,
            url => `<a
                    href="${url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-primary"
                >
                    ${url}
                </a>`.trim()
        );
    }

 /**
     * Registers internal references.
     */
    registerRefs() {
        this.refs.content = this.element.querySelector('[data-ref="content"]');
        this.refs.time = this.element.querySelector('[data-ref="time"]');
        this.refs.wrapper = this.element.querySelector('[data-ref="wrapper"]');
        this.refs.bubble = this.element.querySelector('[data-ref="bubble"]');
        // Metadata container reference (time and status)
        this.refs.metaContainer = this.element.querySelector('[data-ref="meta-container"]');
    }

     /**
     * Updates message content without rebuilding the component.
     */
    updateContent() {
        if (this.refs.content) {
            // To update granularly while maintaining the links if the text changes.
            this.refs.content.innerHTML = this.formatText(this.message?.content ?? '');
        }

        if (this.refs.metaContainer) {
            this.refs.metaContainer.innerHTML = `
                <span data-ref="time">${this.getFormattedTime()}</span>${
                    this.isOwnMessage
                        ? `<span data-ref="status">${this.getReadStatusLabel()}</span>`
                        : ''
                }
            `.trim();
            
            // Update the internal references for the children who have changed.
            this.refs.time = this.element.querySelector('[data-ref="time"]');
        }
    }


    /**
     * Updates visual alignment without re-rendering.
     */
    updateLayout() {
        if (!this.refs.wrapper || !this.refs.bubble) {
            return;
        }
        this.refs.wrapper.classList.remove(
            'justify-content-start',
            'justify-content-end'
        );

        this.refs.bubble.classList.remove(
            'bg-primary',
            'text-white',
            'aq-card-surface'
        );

        if (this.isOwnMessage) {
            this.refs.wrapper.classList.add(
                'justify-content-end'
            );

            this.refs.bubble.classList.add(
                'bg-primary',
                'text-white'
            );
        } else {
            this.refs.wrapper.classList.add(
                'justify-content-start'
            );

            this.refs.bubble.classList.add(
                'aq-card-surface'
            );
        }
    }

     /**
     * Renders component markup.
     *
     * @returns {string}
     */
    render() {
        const wrapperClass = this.isOwnMessage
            ? 'justify-content-end'
            : 'justify-content-start';

        const bubbleClass = this.isOwnMessage
            ? 'bg-primary text-white'
            : 'aq-card-surface';

        return `
            <div class="d-flex ${wrapperClass} mb-2 aq-fade-in mx-2" data-ref="wrapper">
                <div class="rounded-3 ${bubbleClass} px-3 py-2 aq-shadow-sm" data-ref="bubble" style="max-width: 85%; word-break: break-word; white-space: pre-wrap;">
                    <div data-ref="content">${this.formatText(this.message?.content ?? '')}</div>
                    <div class="d-flex justify-content-end align-items-center gap-2 mt-1 small opacity-75" data-ref="meta-container"><span data-ref="time">${this.getFormattedTime()}</span>${
                            this.isOwnMessage
                                ? `<span data-ref="status">${this.getReadStatusLabel()}</span>`
                                : ''
                        }</div>
                </div>
            </div>
        `.trim();
    }

    /**
     * Called after component mount.
     */
    afterMount() {
        this.registerRefs();
    }

    /**
     * Releases component resources.
     */
    destroy() {
        this.refs = {};

        super.destroy();
    }
}