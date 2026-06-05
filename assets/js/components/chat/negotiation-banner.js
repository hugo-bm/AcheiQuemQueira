import { BaseComponent } from '../base/base-component.js';
import { emit } from '../../core/events.js';
import {
    NEGOTIATION_STATUS,
    PROPOSAL_STATUS
} from '../../core/constants.js';

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
     * @param {Object|null} [options.negotiation=null] Negotiation data.
     * @param {string|null} [options.currentUserId=null] Current authenticated user id.
     */
    constructor({
        negotiation = null,
        currentUserId = null
    } = {}) {
        super();

        this.negotiation = negotiation;
        this.currentUserId = currentUserId;
    }

    /**
     * Updates negotiation data.
     *
     * @param {Object|null} negotiation Negotiation data.
     */
    setNegotiation(negotiation) {
        this.negotiation = negotiation;
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
        return this.negotiation?.ownerId === this.currentUserId;
    }

    /**
     * Returns whether current user is the interested user.
     *
     * @returns {boolean}
     */
    isInterested() {
        return this.negotiation?.interestedUserId === this.currentUserId;
    }

    /**
     * Returns current negotiation status.
     *
     * @returns {string|null}
     */
    getStatus() {
        return this.negotiation?.status ?? null;
    }

    /**
     * Returns Bootstrap badge class for the status.
     *
     * @returns {string}
     */
    getStatusBadgeClass() {
        switch (this.getStatus()) {
            case NEGOTIATION_STATUS.OPEN:
                return 'bg-secondary';

            case PROPOSAL_STATUS.ACCEPTED:
            case NEGOTIATION_STATUS.LEAVING:
            case NEGOTIATION_STATUS.ARRIVED:
                return 'bg-warning text-dark';

            case NEGOTIATION_STATUS.COMPLETED:
                return 'bg-success';

            case NEGOTIATION_STATUS.CANCELLED:
                return 'bg-danger';

            default:
                return 'bg-secondary';
        }
    }

    /**
     * Returns a human readable status label.
     *
     * @returns {string}
     */
    getStatusLabel() {
        switch (this.getStatus()) {
            case NEGOTIATION_STATUS.OPEN:
                return 'Open';

            case PROPOSAL_STATUS.ACCEPTED:
                return 'Accepted';

            case NEGOTIATION_STATUS.LEAVING:
                return 'Leaving';

            case NEGOTIATION_STATUS.ARRIVED:
                return 'Arrived';

            case NEGOTIATION_STATUS.COMPLETED:
                return 'Completed';

            case NEGOTIATION_STATUS.CANCELLED:
                return 'Cancelled';

            default:
                return 'Unknown';
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
            <button
                type="button"
                class="btn btn-${variant}"
                data-action="${action}"
            >
                ${label}
            </button>
        `;
    }

    /**
     * Renders action buttons according to negotiation state.
     *
     * @returns {string}
     */
    renderActions() {
        const status = this.getStatus();

        if (!status) {
            return '';
        }

        const owner = this.isOwner();
        const interested = this.isInterested();

        switch (status) {
            case NEGOTIATION_STATUS.OPEN:
                if (owner) {
                    return `
                        ${this.createButton('Aceitar', 'success', 'accept')}
                        ${this.createButton('Recusar', 'danger', 'reject')}
                    `;
                }

                if (interested) {
                    return this.createButton(
                        'Cancelar proposta',
                        'outline-danger',
                        'cancel'
                    );
                }

                break;

            case PROPOSAL_STATUS.ACCEPTED:
                if (interested) {
                    return `
                        ${this.createButton('Estou saindo', 'primary', 'leaving')}
                        ${this.createButton('Cancelar negociação', 'outline-danger', 'cancel')}
                    `;
                }

                if (owner) {
                    return this.createButton(
                        'Cancelar negociação',
                        'outline-danger',
                        'cancel'
                    );
                }

                break;

            case NEGOTIATION_STATUS.LEAVING:
                if (interested) {
                    return `
                        ${this.createButton('Cheguei', 'success', 'arrived')}
                        ${this.createButton('Cancelar negociação', 'outline-danger', 'cancel')}
                    `;
                }

                if (owner) {
                    return this.createButton(
                        'Cancelar negociação',
                        'outline-danger',
                        'cancel'
                    );
                }

                break;

            case NEGOTIATION_STATUS.ARRIVED:
                if (owner) {
                    return `
                        ${this.createButton('Retirada concluída', 'success', 'complete')}
                        ${this.createButton('Cancelar negociação', 'outline-danger', 'cancel')}
                    `;
                }

                if (interested) {
                    return this.createButton(
                        'Cancelar negociação',
                        'outline-danger',
                        'cancel'
                    );
                }

                break;

            case NEGOTIATION_STATUS.COMPLETED:
                return `
                    <p class="mb-0 text-success fw-semibold">
                        Negociação concluída com sucesso.
                    </p>
                `;

            case NEGOTIATION_STATUS.CANCELLED:
                return `
                    <p class="mb-0 text-danger fw-semibold">
                        Negociação cancelada.
                    </p>
                `;
        }

        return '';
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
                    <div
                        class="d-flex flex-column flex-md-row
                               align-items-start align-items-md-center
                               justify-content-between gap-3"
                    >
                        <div>
                            <span class="badge ${this.getStatusBadgeClass()}">
                                ${this.getStatusLabel()}
                            </span>
                        </div>

                        <div
                            class="d-flex flex-wrap gap-2"
                            data-ref="actions"
                        >
                            ${this.renderActions()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Called after component mount.
     */
    afterMount() {
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

        const buttons = this.element.querySelectorAll('[data-action]');

        buttons.forEach(button => {
            const handler = () => {
                const action = button.dataset.action;

                switch (action) {
                    case 'accept':
                        emit('negotiation:accept');
                        break;

                    case 'reject':
                        emit('negotiation:reject');
                        break;

                    case 'leaving':
                        emit('negotiation:leaving');
                        break;

                    case 'arrived':
                        emit('negotiation:arrived');
                        break;

                    case 'complete':
                        emit('negotiation:complete');
                        break;

                    case 'cancel':
                        emit('negotiation:cancel');
                        break;
                }
            };

            this.addListener(button, 'click', handler);
        });
    }

    /**
     * Destroys component resources.
     */
    destroy() {
        super.destroy();
    }
}