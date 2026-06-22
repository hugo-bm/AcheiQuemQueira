import { BaseComponent } from "../base/base-component.js";
import { Events } from "../../core/events.js";
import { NEGOTIATION_STATUS, PROPOSAL_STATUS } from "../../core/constants.js";
import "../../models/entities.js";

/**
 * NegotiationBanner component.
 *
 * Displays the current negotiation state and renders the
 * available actions according to the user's role.
 */
export class NegotiationBanner extends BaseComponent {
  /**
   * Creates a new NegotiationBanner instance.
   *
   * @param {Object} options Component options.
   * @param {Negotiation|null} [options.negotiation=null] Negotiation data.
   * @param {Proposal|null} [options.proposal=null] Negotiation data.
   * @param {string|null} [options.currentUserId=null] Current authenticated user id.
   * @param {string|null} [options.adOwnerId=null] Ad owner user id.
   */
  constructor({
    negotiation = null,
    proposal = null,
    currentUserId = null,
    adOwnerId=null
  } = {}) {
    super();
    this.proposal = proposal;
    this.negotiation = negotiation;
    this.currentUserId = currentUserId;
    this.adOwnerId= adOwnerId;
    this.refs = {};
  }

  /**
   * Updates negotiation data.
   *
   * @param {Negotiation|null} negotiation Negotiation data.
   */
  setNegotiation(negotiation) {
    this.negotiation = negotiation;
    this.refresh();
  }

  /**
   * Updates negotiation data.
   *
   * @param {Proposal|null} proposal Negotiation data.
   */
  setProposal(proposal) {
    this.proposal = proposal;
    this.refresh();
  }
  
  /**
   * Updates current user identifier.
   *
   * @param {string|null} userId User identifier.
   */
  setCurrentUser(userId) {
    this.currentUserId = userId;
    this.refresh();
  }

  /**
   * Returns whether current user is the owner.
   *
   * @returns {boolean}
   */
  isOwner() {
    return this.adOwnerId === this.currentUserId;
  }

  /**
   * Returns whether current user is the interested user.
   *
   * @returns {boolean}
   */
  isInterested() {
    if (!this.negotiation)
    {
        return this.proposal.proposerId === this.currentUserId;
    }
    return this.negotiation?.interestedUserId === this.currentUserId;
  }

  /**
   * Returns current negotiation status.
   *
   * @returns {string|null}
   */
  getStatus() {
    if(!this.negotiation){
        return this.proposal.status || null;
    }
    return this.negotiation?.status || null;
  }

  updateStatus() {
    this.refs.badge.textContent = this.getStatusLabel();

    this.refs.badge.className = this.getStatusBadgeClass();
  }
  /**
   * Returns Bootstrap badge class for the status.
   *
   * @returns {string}
   */
  getStatusBadgeClass() {
    switch (this.getStatus()) {
      case PROPOSAL_STATUS.PENDING:
        return "bg-secondary";

      case NEGOTIATION_STATUS.OPEN:
      case PROPOSAL_STATUS.ACCEPTED:
        return "bg-primary";
        
        case NEGOTIATION_STATUS.LEAVING:
          case NEGOTIATION_STATUS.ARRIVED:
            return "bg-warning text-dark";
            
            case NEGOTIATION_STATUS.COMPLETED:
              return "bg-success";
              
      case PROPOSAL_STATUS.REJECTED:
      case NEGOTIATION_STATUS.CANCELLED:
        return "bg-danger";

      default:
        return "bg-secondary";
    }
  }

  /**
   * Returns a human readable status label.
   *
   * @returns {string}
   */
  getStatusLabel() {
    switch (this.getStatus()) {
      case PROPOSAL_STATUS.PENDING:
        return "Proposta Pedente";

      case PROPOSAL_STATUS.ACCEPTED:
      case NEGOTIATION_STATUS.OPEN:
        return "Proposta Aceita";

      case NEGOTIATION_STATUS.LEAVING:
        return "Em Retirada";

      case NEGOTIATION_STATUS.ARRIVED:
        return "Chegou ao local";

      case NEGOTIATION_STATUS.COMPLETED:
        return "Negociação Finalizada";

      case NEGOTIATION_STATUS.CANCELLED:
        return "Negociação Cancelada";
      case PROPOSAL_STATUS.REJECTED:
        return '<i class="bi bi-x-circle fs-3"></i>';

      default:
        return "Desconhecido";
    }
  }

  /**
   * Creates an action button.
   *
   * @param {string} label Button label.
   * @param {string} variant Bootstrap variant.
   * @param {string} action Action identifier.
   *
   * @returns {string}
   */
  createButton(label, variant, action) {
    return `    
      <button type="button" class="btn aq-btn-${variant}" data-action="${action}">${label}</button>
    `.trim();
  }

  /**
   * Renders action buttons according to negotiation state.
   *
   * @returns {string}
   */
  renderActions() {
      const status = this.getStatus();
      if (!status) {
          return "";
        }
        
        const owner = this.isOwner();
        const interested = this.isInterested();

        switch (status) {
            case PROPOSAL_STATUS.PENDING:
                if (owner) {
                    return `
                    ${this.createButton("Aceitar", "success", "accept")}
                    ${this.createButton("Recusar", "danger", "reject")}
                    `.trim();
                }
                
                if (interested) {
            return this.createButton(
                "Cancelar proposta",
            "outline-danger",
            "cancel",
          );
        }

        break;

      case PROPOSAL_STATUS.ACCEPTED:
      case NEGOTIATION_STATUS.OPEN:
        if (interested) {
          return `
                        ${this.createButton("Estou saindo", "primary", "leaving")}
                        ${this.createButton("Cancelar negociação", "outline-danger", "cancel")}
                    `.trim();
        }

        if (owner) {
          return this.createButton(
            "Cancelar negociação",
            "outline-danger",
            "cancel",
          );
        }

        break;

      case NEGOTIATION_STATUS.LEAVING:
        if (interested) {
          return `
                        ${this.createButton("Cheguei", "success", "arrived")}
                        ${this.createButton("Cancelar negociação", "outline-danger", "cancel")}
                    `.trim();
        }

        if (owner) {
          return this.createButton(
            "Cancelar negociação",
            "outline-danger",
            "cancel",
          );
        }

        break;

      case NEGOTIATION_STATUS.ARRIVED:
        if (owner) {
          return `
                        ${this.createButton("Retirada concluída", "success", "complete")}
                        ${this.createButton("Cancelar negociação", "outline-danger", "cancel")}
                    `.trim();
        }

        if (interested) {
          return this.createButton(
            "Cancelar negociação",
            "outline-danger",
            "cancel",
          );
        }

        break;

      case NEGOTIATION_STATUS.COMPLETED:
        return `
                    <p class="mb-0 text-success fw-semibold">Negociação concluída com sucesso.</p>
                `.trim();

      case NEGOTIATION_STATUS.CANCELLED:
        return `
                    <p class="mb-0 text-danger fw-semibold">Negociação cancelada.</p>
                `.trim();
      case PROPOSAL_STATUS.REJECTED:
        return `
                    <p class="mb-0 text-danger fw-semibold">A proposta foi recusada</p>
                `.trim();
    }

    return "";
  }

  /**
   * Renders component markup.
   *
   * @returns {string}
   */
  render() {
    return `
            <div class="card aq-card-surface aq-shadow-sm aq-fade-in mt-2 mx-2">
                <div class="card-body">
                    <div class="d-flex flex-column flex-md-row  align-items-start align-items-md-center
                               justify-content-between gap-3">
                        <div>
                            <span class="badge ${this.getStatusBadgeClass()}">${this.getStatusLabel()}</span>
                        </div>
                        <div class="d-flex flex-wrap gap-2" data-ref="actions">${this.renderActions()}</div>
                    </div>
                </div>
            </div>`.trim();
  }


  afterMount() {
    this.refs.badge = this.element.querySelector('[data-ref="badge"]');

    this.refs.actions = this.element.querySelector('[data-ref="actions"]');
    this.registerActionListeners();
  }

  /**
   * Refreshes component content.
   */
  refresh() {
    if (!this.element) {
      return;
    }

    this.element.outerHTML = this.render();

    this.element = this.container.firstElementChild;

    this.registerActionListeners();
  }

  /**
   * Registers action button listeners.
   */
  registerActionListeners() {
    if (!this.element) {
      return;
    }

    const buttons = this.element.querySelectorAll("[data-action]");

    buttons.forEach((button) => {
      const handler = () => {
        const action = button.dataset.action;

        switch (action) {
          case "accept":
            Events.emit(this.container, "negotiation:accept",{},true);
            break;

          case "reject":
            Events.emit(this.container, "negotiation:reject", {}, true);
            break;

          case "leaving":
            Events.emit(this.container, "negotiation:leaving", {}, true);
            break;

          case "arrived":
            Events.emit(this.container,"negotiation:arrived",{}, true);
            break;

          case "complete":
            Events.emit(this.container,"negotiation:complete",{}, true);
            break;

          case "cancel":
            Events.emit(this.container, "negotiation:cancel",{}, true);
            break;
        }
      };

      Events.on(button, "click", handler);
    });
  }

  destroy() {
    super.destroy();
    this.refs = {};
  }
}
