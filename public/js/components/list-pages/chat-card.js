import { BaseCardComponent } from '../base/base-card-component.js';
import { Avatar } from '../ui/avatar.js';
import { Events } from "../../core/events.js"

/**
 * Represents a Proposal item component or controller.
 * @extends {BaseCardComponent} 
 */
export class ChatCard extends BaseCardComponent {
    /**
     * Creates an instance.
     * 
     * @param {Object} [options={}] - The configuration object.
     * @param {string|number} options.proposalId - The unique identifier for the proposal.
     * @param {string|null} [options.avatarUrl=null] - The URL of the user's avatar image.
     * @param {string} [options.firstName=''] - The first name of the ohter user.
     * @param {string} [options.fullName=''] - The full name of the other user.
     * @param {string} [options.lastMessage=''] - The last message text.
     * @param {string} [options.proposalStatus='pending'] - The initial status of the proposal.
     * @param {string} [options.lastActivityDate=''] - The last active timestamp or date string.
     * @param {number|string} [options.unreadCount=0] - The initial number of unread messages.
     * @param {Function|null} [options.onClick=null] - Click event handler callback.
     * @param {"chat"|"proposal"} [options.variant="chat"] - Select the rendering layout between "chat" and "proposal"
     */
    constructor({
        proposalId,
        avatarUrl = null,
        firstName = '',
        fullName = '',
        lastMessage = '',
        proposalStatus = 'pending',
        lastActivityDate = '',
        unreadCount = 0,
        onClick = null,
        variant = 'chat'
    } = {}) {
        super();

        this.proposalId = proposalId;

        this.avatarUrl = avatarUrl;

        this.firstName = firstName;
        this.fullName = fullName;

        this.lastMessage = lastMessage?.trim() || 'Nenhuma mensagem enviada.';

        this.proposalStatus = proposalStatus;
        this.lastActivityDate = lastActivityDate;

        this.unreadCount = Number(unreadCount) || 0;

        this.onClick = onClick;

        this.avatar = null;

        this.variant = variant;

        this.handleClick = this.handleClick.bind(this);

        this.handleKeyboard = this.handleKeyboard.bind(this);
    }

    getTagName() {
        return 'article';
    }

    getAttributes() {
        return {
            role: 'button',
            tabindex: '0'
        };
    }

    getCardClasses() {
        return [
            'aq-clickable',
            'aq-card-surface',
            'aq-notification-card',
            'border',
            'aq-shadow-md',
            'aq-radius-md',
            'position-relative',
            'border-1'
        ].join(' ');
    }

    renderBody() {
        if (this.variant === 'proposal') {
            return this.renderProposalBody();
        }

        return this.renderChatBody();

    }

    renderChatBody() {
        return `
        <div class="d-flex align-items-center gap-3">
            <div data-ref="avatar"></div>
            <div class="flex-grow-1 min-w-0">
                <div class="d-flex justify-content-between align-items-start gap-2">
                    <div class="min-w-0 d-flex align-items-center justify-content-center">
                        <div class="fw-semibold fs-5 text-primary aq-mobile-only" data-ref="mobile-name">${this.firstName}</div>
                        <div class="fw-semibold fs-5 text-primary aq-tablet-up" data-ref="desktop-name">${this.fullName}</div>
                    </div>
                    <div class="text-center flex-shrink-0">
                        <span class="badge" data-ref="status">${this.getStatusLabel()}</span>
                        <div class="small aq-text-soft mt-1" data-ref="date">${this.lastActivityDate}</div>
                    </div>
                </div>
                <div class="small aq-text-soft aq-line-clamp-2 mt-1" data-ref="message">${this.lastMessage}</div>
            </div>
        </div>`.trim();
    }

    renderProposalBody() {
        return `
<div class="d-flex align-items-center gap-3">
    <div data-ref="avatar"></div>
    <div class="flex-grow-1 min-w-0">
        <div class="fw-semibold fs-5 text-primary" data-ref="desktop-name">${this.firstName} ${this.getLastName()}</div>
        <div class="d-flex justify-content-between gap-3 mt-1">
            <div class="flex-grow-1">
                <div class="small aq-text-soft aq-line-clamp-2" data-ref="message">${this.lastMessage}</div>
            </div>
            <div class="text-end flex-shrink-0">
                <span class="badge" data-ref="status">
                    ${this.getStatusLabel()}
                </span>
                <div class="small aq-text-soft mt-1" data-ref="date">${this.lastActivityDate}</div>
            </div>
        </div>
    </div>
</div>`.trim();
    }

    afterMount() {
        this.registerRefs();
        this.mountAvatar();
        if (this.variant === 'chat') {
            this.renderUnreadBadge();
        }
        this.bindEvents();
        this.updateStatus(this.proposalStatus);
    }

    /**
     * Caches and registers essential component DOM references.
     *
     * @returns {void}
     */
    registerRefs() {
        this.registerRef(
            'avatar',
            this.element.querySelector('[data-ref="avatar"]')
        );

        this.registerRef(
            'message',
            this.element.querySelector('[data-ref="message"]')
        );

        this.registerRef(
            'status',
            this.element.querySelector('[data-ref="status"]')
        );

        this.registerRef(
            'date',
            this.element.querySelector('[data-ref="date"]')
        );
    }

    /**
     * Instantiates and mounts the user Avatar child component into its placeholder.
     *
     * @returns {void}
     */
    mountAvatar() {
        const avatarContainer = this.getRef('avatar');

        if (!avatarContainer) {
            return;
        }

        this.avatar = new Avatar({
            imageUrl: this.avatarUrl,
            name: this.fullName,
            size: 'md'
        });

        this.avatar.mount(avatarContainer);

        if (this.avatar.element) {
            this.avatar.element.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Attaches interaction event listeners to the component's root element.
     *
     * @returns {void}
     */
    bindEvents() {
        Events.on(this.element, "click", this.handleClick);
        Events.on(this.element, 'keydown', this.handleKeyboard);
        this.listeners.push({
            element: this.element,
            eventName: "click",
            handler: this.handleClick
        });
        this.listeners.push({
            element: this.element,
            eventName: "keydown",
            handler: this.handleKeyboard
        });
    }

    handleClick() {
        if (typeof this.onClick === 'function') {
            this.onClick(this.proposalId);
        }
    }

    handleKeyboard(event) {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();

        this.handleClick();
    }

    updateUnreadCount(count) {
        if (this.variant !== 'chat') {
            return;
        }
        this.unreadCount = Number(count) || 0;

        const currentBadge = this.getRef('unread-badge');

        if (this.unreadCount <= 0) {
            if (currentBadge) {
                currentBadge.remove();
            }

            this.refs['unread-badge'] = null;

            return;
        }

        if (currentBadge) {
            currentBadge.textContent = this.unreadCount;

            return;
        }

        this.renderUnreadBadge();
    }

    renderUnreadBadge() {
        if (this.variant !== 'chat') {
            return;
        }
        if (this.unreadCount <= 0) {
            return;
        }

        const badge = document.createElement('span');

        badge.className = [
            'badge',
            'bg-danger',
            'position-absolute',
            'top-0',
            'end-0',
            'translate-middle',
            'rounded-circle'
        ].join(' ');

        badge.textContent = this.unreadCount;

        this.element.appendChild(badge);

        this.registerRef('unread-badge', badge);
    }

    /**
     * Updates the component's last message text.
     *
     * @param {string|null} message - The raw message content to apply.
     * @returns {void}
     */
    updateLastMessage(message) {
        const content = message?.trim() || 'Nenhuma mensagem enviada.';

        this.lastMessage = content;

        const messageElement = this.getRef('message');

        if (!messageElement) {
            return;
        }

        messageElement.textContent = content;
    }

    /**
     * Updates the internal proposal status value.
     *
     * @param {string} status - The new status string to apply.
     * @returns {void}
     */
    updateStatus(status) {
        this.proposalStatus = status;

        const statusElement = this.getRef('status');

        if (!statusElement) {
            return;
        }

        statusElement.className = `badge bg-${this.getStatusVariant()}`;

        statusElement.textContent = this.getStatusLabel();
    }

    /**
     * Retrieves the CSS class value for the current proposal status.
     *
     * @returns {string} The formatted status label, or 'Desconhecido' as a fallback.
     * @private
     */
    getStatusVariant() {
        const STATUS_STYLING = {
            pending: 'warning',
            accepted: 'success',
            rejected: 'danger',
            cancelled: 'secondary',
            completed: 'info'
        };
        return STATUS_STYLING[this.proposalStatus] || 'secondary';
    }

    /**
     * Retrieves the localized display label for the current proposal status.
     *
     * @returns {string} The formatted status label, or 'Desconhecido' as a fallback.
     */
    getStatusLabel() {
        const STATUS_LABELS = {
            pending: 'Pendente',
            accepted: 'Aceita',
            rejected: 'Recusada',
            cancelled: 'Cancelada',
            completed: 'Concluída'
        };

        return STATUS_LABELS[this.proposalStatus] ?? 'Desconhecido';
    }

    /**
     * Extracts the last name from the full name string.
     *
     * @returns {string} The last name token, or an empty string if it does not exist.
     */
    getLastName() {
        const parts = this.fullName.trim().split(/\s+/);

        return parts.length > 1 ? parts[parts.length - 1] : '';
    }

    /**
  * Updates the component's structural variant dynamically at runtime.
  * 
  * This method alters the card's theme or layout configuration (e.g., standard chat vs 
  * incoming item proposal view), triggering necessary internal updates to match the context.
  *
  * @param {('chat'|'proposal')} [variant='chat'] - The target visual variant layout identifier.
  * @returns {void}
  */
    setVariant(variant = 'chat') {
        this.variant =
            variant === 'proposal'
                ? 'proposal'
                : 'chat';
    }

    destroy() {
        this.avatar?.destroy();
        this.avatar = null;


        Object.keys(this.refs).forEach(key => {
            this.refs[key] = null;
        });

        super.destroy();
    }
}