import { BaseComponent } from '../base/base-component.js';
import { on, off, emit } from '../../core/events.js';

/**
 * Chat header component.
 *
 * Responsible for rendering the conversation header containing:
 * - Back button
 * - User avatar
 * - User name
 * - Negotiation status
 *
 * Emits:
 * - chat:user-profile
 * - chat:back
 */
export class ChatHeader extends BaseComponent {
  /**
   * Creates a new ChatHeader instance.
   *
   * @param {Object} [options={}] Component configuration.
   * @param {Object|null} [options.user=null] User data.
   * @param {string} [options.status='open'] Negotiation status.
   * @param {Object|null} [options.avatarComponent=null] Avatar component instance.
   */
  constructor(options = {}) {
    super();

    this.user = options.user ?? null;
    this.status = options.status ?? 'open';
    this.avatarComponent = options.avatarComponent ?? null;

    this.refs = {};
  }

  /**
   * Updates user information.
   *
   * @param {Object} user User data.
   */
  setUser(user) {
    this.user = user;

    if (!this.element) {
      return;
    }

    const nameElement = this.refs.name;

    if (nameElement) {
      nameElement.textContent = this.#getDisplayName();
      nameElement.title = this.#getFullName();
    }
  }

  /**
   * Updates negotiation status.
   *
   * @param {string} status Negotiation status.
   */
  setStatus(status) {
    this.status = status;

    if (!this.element) {
      return;
    }

    const badge = this.refs.status;

    if (!badge) {
      return;
    }

    badge.className = `badge ${this.#getStatusClass(status)}`;
    badge.textContent = this.#getStatusLabel(status);
  }

  /**
   * Renders component HTML.
   *
   * @returns {string}
   */
  render() {
    return `
      <header
        class="d-flex align-items-center gap-2 px-3 py-2 border-bottom bg-body"
      >
        <button
          type="button"
          class="btn btn-link text-decoration-none p-2 flex-shrink-0"
          data-role="back-button"
          aria-label="Back"
        >
          <i class="bi bi-arrow-left fs-5" aria-hidden="true"></i>
        </button>

        <div
          class="d-flex align-items-center gap-2 flex-grow-1 min-w-0"
        >
          <div
            class="flex-shrink-0"
            data-role="avatar"
          >
            ${this.avatarComponent?.render?.() ?? ''}
          </div>

          <button
            type="button"
            class="btn btn-link d-md-none d-sm text-decoration-none p-0 text-start text-body fw-semibold text-truncate"
            data-role="user-profile"
            style="min-height: 48px;"
          >
            ${this.#getDisplayName('mobile')}
          </button>
          <button
            type="button"
            class="btn btn-link d-none d-md-inline text-decoration-none p-0 text-start text-body fw-semibold text-truncate"
            data-role="user-profile"
            style="min-height: 48px;"
          >
            ${this.#getDisplayName('desktop')}
          </button>
        </div>

        <span
          class="badge ${this.#getStatusClass(this.status)} flex-shrink-0"
          data-role="status"
        >
          ${this.#getStatusLabel(this.status)}
        </span>
      </header>
    `;
  }

  /**
   * Lifecycle hook executed after component mount.
   */
  afterMount() {
    this.refs.avatar = this.element.querySelector('[data-role="avatar"]');
    this.refs.name = this.element.querySelector('[data-role="user-profile"]');
    this.refs.status = this.element.querySelector('[data-role="status"]');
    this.refs.back = this.element.querySelector('[data-role="back-button"]');

    this.#registerEvents();
  }

  /**
   * Releases component resources.
   */
  destroy() {
    super.destroy();

    this.refs = {};
    this.user = null;
    this.avatarComponent = null;
  }

  /**
   * Registers component events.
   *
   * @private
   */
  #registerEvents() {
    if (this.refs.back) {
      this.addListener(
        this.refs.back,
        'click',
        this.#handleBackClick.bind(this)
      );
    }

    if (this.refs.name) {
      this.addListener(
        this.refs.name,
        'click',
        this.#handleProfileClick.bind(this)
      );
    }

    if (this.refs.avatar) {
      this.addListener(
        this.refs.avatar,
        'click',
        this.#handleProfileClick.bind(this)
      );
    }
  }

  /**
   * Handles profile click.
   *
   * @private
   */
  #handleProfileClick() {
    if (!this.user?.id) {
      return;
    }

    emit('chat:user-profile', {
      userId: this.user.id
    });
  }

  /**
   * Handles back button click.
   *
   * @private
   */
  #handleBackClick() {
    emit('chat:back');
  }

  /**
   * Returns the display name according to screen size.
   *
   * @param {"mobile"|"desktop"} type
   * @returns {string}
   * @private
   */
  #getDisplayName(type) {
    if (!this.user) {
      return '';
    }

    const fullName = this.#getFullName();

    if (type === "desktop") {
      return fullName;
    }

    return fullName.split(' ')[0];
  }

  /**
   * Returns full user name.
   *
   * @returns {string}
   * @private
   */
  #getFullName() {
    return this.user?.name ?? '';
  }

  /**
   * Returns Bootstrap badge class for status.
   *
   * @param {string} status
   * @returns {string}
   * @private
   */
  #getStatusClass(status) {
    const classes = {
      open: 'bg-secondary',
      accepted: 'bg-primary',
      leaving: 'bg-warning text-dark',
      arrived: 'bg-info text-dark',
      completed: 'bg-success',
      cancelled: 'bg-danger'
    };

    return classes[status] ?? 'bg-secondary';
  }

  /**
   * Returns user-friendly status label.
   *
   * @param {string} status
   * @returns {string}
   * @private
   */
  #getStatusLabel(status) {
    const labels = {
      open: 'Open',
      accepted: 'Accepted',
      leaving: 'Leaving',
      arrived: 'Arrived',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    return labels[status] ?? 'Open';
  }
}