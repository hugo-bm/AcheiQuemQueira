import { BaseComponent } from "../base/base-component.js";
import { MessageBubble } from "./message-bubble.js";
import { EmptyState } from "../ui/empty-state.js";

 /**
   * Chat message.
   *
   * @typedef {Object} Message
   *
   * @property {string} id
   *
   * @property {string} chatId
   * @property {string} senderId
   *
   * @property {string} content
   *
   * @property {boolean} read
   *
   * @property {string} createdAt
   */

/**
 * MessageList component.
 *
 * Responsible for rendering and managing a conversation message list.
 */
export class MessageList extends BaseComponent {
 
  /**
   * Creates a new MessageList instance.
   *
   * @param {Object} options Component options.
   * @param {Array<Message>} [options.messages=[]] Message collection.
   * @param {string|null} [options.currentUserId=null] Current user identifier.
   */
  constructor({ messages = [], currentUserId = null } = {}) {
    super();

    this.messages = messages;
    this.currentUserId = currentUserId;

    this.refs = {};

    /**
     * @type {Map<string, MessageBubble>}
     */
    this.messageComponents = new Map();

    /**
     * @type {EmptyState|null}
     */
    this.emptyState = null;

    /**
     * Maximum distance from the bottom
     * to allow automatic scrolling.
     *
     * @type {number}
     */
    this.autoScrollThreshold = 120;
  }

  /**
   * Updates the entire message collection.
   *
   * This operation rebuilds the visual list only when
   * a full replacement is explicitly requested.
   *
   * @param {Array<Message>} messages Message collection.
   */
  setMessages(messages) {
    this.messages = Array.isArray(messages) ? messages : [];

    this.renderMessages();
  }

  /**
   * Adds a single message to the list.
   *
   * Does not rebuild existing messages.
   *
   * @param {Message} message Message data.
   */
  addMessage(message) {
    if (!message || !this.refs.list) {
      return;
    }

    const shouldAutoScroll = this.isNearBottom();

    this.messages.push(message);

    this.removeEmptyState();

    const bubble = this.createMessageBubble(message);

    this.messageComponents.set(message.id, bubble);

    const wrapper = document.createElement("div");

    bubble.mount(wrapper);

    if (wrapper.firstElementChild) {
      this.refs.list.appendChild(wrapper.firstElementChild);
    }

    if (shouldAutoScroll) {
      this.scrollToBottom();
    }
  }

  /**
   * Scrolls to the bottom of the message list.
   */
  scrollToBottom() {
    if (!this.refs.list) {
      return;
    }

    this.refs.list.scrollTop = this.refs.list.scrollHeight;
  }

  /**
   * Determines whether the user is near the bottom.
   *
   * @returns {boolean}
   */
  isNearBottom() {
    if (!this.refs.list) {
      return true;
    }

    const distance =
      this.refs.list.scrollHeight -
      this.refs.list.scrollTop -
      this.refs.list.clientHeight;

    return distance <= this.autoScrollThreshold;
  }

  /**
   * Creates a MessageBubble instance.
   *
   * @param {Message} message Message data.
   *
   * @returns {MessageBubble}
   */
  createMessageBubble(message) {
    return new MessageBubble({
      message,
      isOwnMessage: message.senderId === this.currentUserId,
    });
  }

  /**
   * Creates the empty state component.
   */
  createEmptyState() {
    this.emptyState = new EmptyState({
      icon: "bi-chat-dots",
      title: "Nenhuma mensagem ainda.",
      description: "Inicie a conversa.",
    });
    const wrapper = document.createElement("div");

    wrapper.append(this.emptyState.render());

    if (wrapper.firstElementChild) {
      this.refs.list.appendChild(wrapper.firstElementChild);
    }
  }

  /**
   * Removes the current empty state.
   */
  removeEmptyState() {
    if (!this.emptyState) {
      return;
    }

    this.emptyState.destroy();
    this.emptyState = null;
  }

  /**
   * Clears all rendered message components.
   */
  clearMessages() {
    this.messageComponents.forEach((component) => {
      component.destroy();
    });

    this.messageComponents.clear();

    if (this.refs.list) {
      this.refs.list.replaceChildren();
    }
  }

  /**
   * Renders all messages.
   */
  renderMessages() {
    if (!this.refs.list) {
      return;
    }

    this.clearMessages();
   
    if (!this.messages.length) {
      this.createEmptyState();
      return;
    }

    const fragment = document.createDocumentFragment();

    this.messages.forEach((message) => {
      const bubble = this.createMessageBubble(message);
      this.messageComponents.set(message.id, bubble);

      const wrapper = document.createElement("div");

      bubble.mount(wrapper);

      if (wrapper.firstElementChild) {
        fragment.appendChild(wrapper.firstElementChild);
      }
    });

    this.refs.list.appendChild(fragment);

    this.scrollToBottom();
  }

  /**
   * Registers internal DOM references.
   */
  registerRefs() {
    // this.refs.list = this.element.querySelector('[data-ref="message-list"]');
    this.refs.list = this.element;
}

  /**
   * Renders component markup.
   *
   * @returns {string}
   */
  render() {
    return `<div
                class="h-100 overflow-auto mt-2"
                data-ref="message-list"
            ></div>`.trim();
  }

  /**
   * Lifecycle hook executed after mount.
   */
  afterMount() {
    this.registerRefs();
    this.renderMessages();
  }

  /**
   * Releases component resources.
   */
  destroy() {
    this.clearMessages();

    if (this.emptyState) {
      this.emptyState.destroy();
      this.emptyState = null;
    }

    this.refs = {};

    super.destroy();
  }
}
