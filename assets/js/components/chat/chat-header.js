import { BaseComponent } from "../base/base-component.js";
import { Events } from "../../core/events.js";
import "../../models/entities.js"

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
   * @param {User|null} [options.user=null] User data.
   * @param {string} [options.status='open'] Negotiation status.
   * @param {Object|null} [options.avatarComponent=null] Avatar component instance.
   */
  constructor(options = {}) {
    super();

    this.user = options.user || null;
    this.status = options.status || "open";
    this.avatarComponent = options.avatarComponent || null;
    this.avatarConteiner = null;

    this.refs = {};
  }

  /**
   * Updates user information.
   *
   * @param {User} user User data.
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
          class="btn aq-btn-secundary p-0 text-decoration-none d-flex align-items-center justify-content-center"
          data-role="back-button"
          aria-label="Back"
          style="min-width:48px; min-height:48px; z-index:2;"
        >
          <i class="bi bi-arrow-left fs-3" aria-hidden="true"></i>
        </button>
        <button id="profile-btn" type="button" class=" btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2  flex-grow-1 min-w-0"  data-role="user-profile">
         <div id="avatar-conteiner"></div>
          <span class="text-truncate aq-text-primary aq-text-shadow-glow">
              <span class="d-inline d-md-none">${this.#getDisplayName("mobile")}</span>
              <span class="d-none d-md-inline">${this.#getDisplayName("desktop")}</span>
          </span>
        </button>
        <span
          class="badge ${this.#getStatusClass(this.status)} flex-shrink-0"
          data-role="status"
        >${this.#getStatusLabel(this.status)}</span>
      </header>
    `.trim();
  }

  /**
   * Lifecycle hook executed after component mount.
   */
  afterMount() {
    
    this.refs.name = this.element.querySelector('[data-role="user-profile"]');
    this.refs.status = this.element.querySelector('[data-role="status"]');
    this.refs.back = this.element.querySelector('[data-role="back-button"]');
    this.avatarConteiner = this.element.querySelector('#avatar-conteiner');
    this.refs.profileBtn = this.element.querySelector("#profile-btn");
    this.avatarComponent.mount(this.avatarConteiner);
    
    this.#registerEvents();
  }

  /**
   * Releases component resources.
   */
  destroy() {
    super.destroy();

    this.refs = {};
    this.user = null;
    this.avatarConteiner = null;
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
        "click",
        this.#handleBackClick.bind(this),
      );
    }

    if (this.refs.profileBtn) {
      this.addListener(
        this.refs.profileBtn,
        "click",
        this.#handleProfileClick.bind(this),
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

    Events.emit(this.container,"chat:user-profile", {
      userId: this.user.id,
    },true);
  }

  /**
   * Handles back button click.
   *
   * @private
   */
  #handleBackClick() {
    Events.emit(this.container,"chat:back",{},true);
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
      return "";
    }

    const fullName = this.#getFullName();


    if (type === "desktop") {
      return fullName;
    }

    return fullName.split(" ")[0];
  }

  /**
   * Returns full user name.
   *
   * @returns {string}
   * @private
   */
  #getFullName() {
    return this.user?.name ?? "";
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
      open: "bg-secondary",
      accepted: "bg-primary",
      leaving: "bg-warning text-dark",
      arrived: "bg-info text-dark",
      completed: "bg-success",
      cancelled: "bg-danger",
    };

    return classes[status] ?? "bg-secondary";
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
      open: "Em Negociação",
      accepted: "Proposta Aceita",
      leaving: "Em Retirada",
      arrived: "Chegou!",
      completed: "Negociação Completa",
      cancelled: "Negociação Cancelada",
    };

    return labels[status] ?? "Open";
  }
}
