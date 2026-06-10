import { BaseCardComponent } from '../base/base-card-component.js';
import { Events } from "../../core/events.js";

/**
 * Notification card component.
 *
 * Displays a single notification.
 */
export class NotificationCard extends BaseCardComponent {
  /**
   * Creates a notification card.
   *
   * @param {Object} options
   * @param {Object} options.notification
   * @param {Function|null} options.onClick
   */
  constructor({
    notification,
    onClick = null
  }) {
    super();

    this.notification = notification;
    this.onClick = onClick;

    this.refs = {};
  }

  /**
   * Renders component.
   *
   * @returns {string}
   */
  render() {
    return `
      <div class="card aq-notification-card border-0 aq-shadow-sm"
        role="button"
        tabindex="0">
        <div class="card-body py-3">
          <div class="d-flex align-items-start gap-3">
            <div
              data-ref="icon"
              class="flex-shrink-0 fs-4 aq-text-primary"
            ><i class="${this.getIconClass()}"></i></div>
            <div class="flex-grow-1 min-w-0">
              <div
                data-ref="title"
                class="fw-semibold text-primary text-truncate"
              >${this.notification.title}</div>
              <div
                data-ref="message"
                class="small text-muted aq-line-clamp-2"
              >${this.notification.message}</div>
            </div>
            <div
              class="d-flex flex-column align-items-end gap-2 flex-shrink-0"
            >
              <small
                data-ref="date"
                class="aq-text-light"
              >${this.formatDate()}</small>
              <span
                data-ref="unread"
                class="badge rounded-circle bg-primary" style="width: 10px; height: 15px;">&nbsp;</span>
            </div>
          </div>
        </div>
      </div>
    `.trim();
  }

  /**
   * Lifecycle hook.
   */
  afterMount() {
    this.refs.title =
      this.element.querySelector('[data-ref="title"]');

    this.refs.message =
      this.element.querySelector('[data-ref="message"]');

    this.refs.date =
      this.element.querySelector('[data-ref="date"]');

    this.refs.unread =
      this.element.querySelector('[data-ref="unread"]');

    this.refs.icon =
      this.element.querySelector('[data-ref="icon"]');

    this.refs.title.textContent = this.notification.title;
    this.refs.message.textContent = this.notification.message;
    this.refs.date.textContent = this.formatDate();

    this.applyReadState();

    this.addListener(
      this.element,
      'click',
      this.handleClick.bind(this)
    );

    this.addListener(
      this.element,
      'keydown',
      this.handleKeyDown.bind(this)
    );
  }

  /**
   * Handles card click.
   */
  handleClick() {
    if (typeof this.onClick === 'function') {
      this.onClick(this.notification);
    }
  }

  /**
   * Handles keyboard navigation.
   *
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      this.handleClick();
    }
  }

  /**
   * Marks notification as read.
   */
  markAsRead() {
    this.notification.readAt =
      new Date().toISOString();

    this.applyReadState();
  }

  /**
   * Updates notification content.
   *
   * @param {Object} notification
   */
  updateNotification(notification) {
    this.notification = notification;

    if (!this.element) {
      return;
    }

    this.refs.title.textContent =
      notification.title;

    this.refs.message.textContent =
      notification.message;

    this.refs.date.textContent =
      this.formatDate();

    const icon =
      this.refs.icon.querySelector('i');

    if (icon) {
      icon.className =
        this.getIconClass();
    }

    this.applyReadState();
  }

  /**
   * Applies visual read state.
   */
  applyReadState() {
    const read =
      Boolean(this.notification.readAt);

    if (!read) {
      this.element.classList.add("aq-notification-unread");
      this.refs.unread.classList.remove("d-none");

      this.refs.unread.setAttribute('aria-label', 'Notificação não visualizada');

      return;
    }

    this.element.classList.remove(
      'aq-notification-unread'
    );

    this.refs.unread.classList.add(
      'd-none'
    );

    this.refs.unread.setAttribute('aria-label', 'Notificação visualizada');
  }

  /**
   * Returns Bootstrap icon.
   *
   * @returns {string}
   */
  getIconClass() {
    switch (this.notification.type) {
      case 'item':
        return 'bi bi-box-seam';

      case 'proposal':
        return 'bi bi-chat-left-text';

      case 'negotiation':
        return 'bi bi-arrow-left-right';

      case 'chat':
        return 'bi bi-chat-dots';

      case 'system':
      default:
        return 'bi bi-info-circle';
    }
  }

  /**
   * Formats notification date.
   *
   * @returns {string}
   */
  formatDate() {
    const now = Date.now();

    const created =
      new Date(
        this.notification.createdAt
      ).getTime();

    const diff =
      Math.floor(
        (now - created) / 1000
      );

    if (diff < 60) {
      return 'Agora';
    }

    if (diff < 3600) {
      return `${Math.floor(diff / 60)} min`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)} h`;
    }

    if (diff < 172800) {
      return 'Ontem';
    }

    return `${Math.floor(diff / 86400)} dias`;
  }

  /**
   * Releases resources.
   */
  destroy() {
    this.onClick = null;
    this.notification = null;
    this.refs = {};

    super.destroy();
  }
}