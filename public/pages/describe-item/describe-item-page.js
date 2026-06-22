import AuthService from '../../js/services/auth-service.js';
import { NavStorage } from '../../js/core/nav-storage.js';
import { ROUTES } from '../../js/core/constants.js';

import { ItemService } from '../../js/services/item-service.js';
import { UserService } from '../../js/services/user-service.js';
import { ProposalService } from '../../js/services/proposal-service.js';
import { ReviewService } from '../../js/services/review-service.js';
import { CatalogService } from '../../js/services/catalog-service.js';

import { AlertRender } from '../../js/components/ui/alert-render.js';

import { Carousel } from '../../js/components/ui/carousel.js';
import { QualityBadge } from '../../js/components/ui/quality-badge.js';
import { Avatar } from '../../js/components/ui/avatar.js';
import { ChatCard } from '../../js/components/list-pages/chat-card.js';
import { Rating } from '../../js/components/ui/rating.js';
import { EmptyState } from '../../js/components/ui/empty-state.js';
import { Events } from '../../js/core/events.js';

export class DescribeItemPage {
    constructor() {
        this.alertRender = new AlertRender('#alert-container');

        this.item = null;
        this.owner = null;
        this.currentUser = null;

        this.category = null;
        this.subcategory = null;

        this.proposals = []
        this.hasUserProposal = null;

        this.isOwner = false;

        this.carousel = null;
        this.qualityBadge = null;
        this.ownerAvatar = null;
        this.ownerRating = null;

        this.proposalCards = [];
        this.components = [];

        this.proposalModal = null;
        this.deleteModal = null;

        this.listeners = [];

        this.refs = {};
        this.initialize();
    }

    /**
    * Orchestrates the lifecycle initialization sequence of the page.
    *
    * @returns {void} 
    */
    initialize() {

        this.registerRefs();
        if (!this.loadItem()) {
            return;
        }

        this.renderPage();

        this.bindEvents();
    }

    /**
     * Loads the target item, owner, and catalog context from services based on storage state.
     *
     * @returns {boolean} True if the complete item dataset loaded successfully, false otherwise.
     * @private
     */
    loadItem() {
        const navigationData = NavStorage.get('describe-item-page');
        const itemId = navigationData?.itemId;


        if (!itemId) {
            window.location.href = ROUTES['dashboard'];
            return false;
        }

        this.item = ItemService.getById(itemId);

        if (!this.item) {
            this.destroy();
            window.location.href = ROUTES['dashboard'];
            return false;
        }

        this.owner = UserService.getById(this.item.ownerId);

        if (!this.owner) {
            this.destroy();
            window.location.href = ROUTES['dashboard'];
            return false;
        }

        this.currentUser = AuthService.getCurrentUser();

        this.isOwner = this.currentUser?.id === this.item.ownerId;

        const catalogResult = CatalogService.getCategoryWithSubcategories(this.item.categoryId);

        const categoryData = catalogResult?.data;

        if (categoryData) {
            this.category = categoryData.category;
            this.subcategory = categoryData.subcategories.find(subcategory => subcategory.id === this.item.subcategoryId) || null;
        }

        this.proposals = ProposalService.getByItem(this.item.id);
        if (!this.isOwner) {
            this.hasUserProposal = ProposalService.hasUserProposal(this.item.id, this.currentUser.id);
        }
        return true;
    }

    /**
     * Caches and registers essential component DOM references.
     *
     * @returns {void}
     */
    registerRefs() {
        this.refs.title = document.querySelector('[data-field="title"]');
        this.refs.price = document.querySelector('[data-field="price"]');
        this.refs.carouselContainer = document.querySelector('[data-container="carousel"]');
        this.refs.badgeContainer = document.querySelector('[data-container="quality-badge"]');
        this.refs.itemInfoContainer = document.querySelector('[data-container="item-info"]');
        this.refs.ownerSection = document.querySelector('[data-container="owner-section"]');
        this.refs.actionsContainer = document.querySelector('[data-container="actions"]');
        this.refs.proposalsSection = document.querySelector('[data-container="proposals-section"]');
        this.refs.proposalMessage = document.querySelector('#proposal-message');
    }

    /**
    * Coordinates the execution sequence of all visual blocks on the page.
    *
    * @returns {void}
    */
    renderPage() {
        this.renderCarousel();
        this.renderQualityBadge();
        this.renderItemInfo();
        this.renderActions();
        if (this.isOwner) {
            this.renderProposals();
        } else {
            this.renderOwnerSection();
        }
    }

    /**
     * Instantiates and mounts the dynamic image carousel into its placeholder.
     *
     * @returns {void}
     */
    renderCarousel() {

        if (!this.refs.carouselContainer) {
            return;
        }

        this.carousel =
            new Carousel({
                images:
                    this.item.images ?? []
            });

        this.carousel.mount(
            this.refs.carouselContainer
        );

        this.components.push(
            this.carousel
        );
    }

    /**
     * Instantiates and mounts the quality badge.
     *
     * @returns {void}
     */
    renderQualityBadge() {
        if (!this.refs.badgeContainer) {
            return;
        }

        this.qualityBadge = new QualityBadge({
            grade: Number(this.item.quality.slice(-1)),
            size: 'md'
        });

        this.refs.badgeContainer.appendChild(this.qualityBadge.render());
    }

    /**
     * Renders the technical specification and information block of the item.
     *
     * @returns {void}
     */
    renderItemInfo() {
        this.refs.title.textContent = this.item.title;
        const defaultProposalMessage = {
            free: 'Olá! Tenho interesse na doação e posso retirar no local. Como combinamos?',
            sale: 'Olá! Tenho interesse no item para compra e posso retirar no local. Como combinamos?',
            disposal: 'Olá! Faço a retirada e o descarte do item no local. Qual o seu orçamento?',
        }
        this.refs.proposalMessage.placeholder = defaultProposalMessage[this.item.type];

        if (this.refs.itemInfoContainer) {
            this.refs.itemInfoContainer.textContent = '';
        }

        const formattedPrice = typeof this.formatPrice === 'function'
            ? this.formatPrice(this.item.price)
            : `R$ ${Number(this.item.price || 0).toFixed(2).replace('.', ',')}`;

        this.refs.price.textContent = formattedPrice;

        const gridContainer = document.createElement('div');
        gridContainer.className = 'row row-cols-1 row-cols-md-2 g-3 m-0 w-100';

        const condicoesDoAnunciante = {
            free: "Item disponível para doação gratuita. Retirada exclusivamente no local por conta do interessado.",
            sale: "O produto está à venda e aceito propostas de compra. Informo que a retirada no local é por conta do comprador",
            disposal: "Estou à procura de profissionais para retirar e dar o destino correto ao item. Aceito propostas de valor para a realização dessa coleta no local.",
        }

        const fields = [
            ['Categoria', this.category?.name],
            ['Subcategoria', this.subcategory?.name],
            ['Publicado em', this.formatDate(this.item.createdAt)],
            ['Prazo restante', `${this.calculateRemainingDays(this.item.expiresAt)} dia(s)`],
        ];

        if (this.item.volumeDescription) {
            fields.push(['Volume', this.item.volumeDescription]);
        }
        if (this.item.volumeDescription) {
            fields.push(['Condições do anunciante', condicoesDoAnunciante[this.item.type]]);
        }

        fields.forEach(([label, value]) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'col d-flex flex-column mb-1';

            const title = document.createElement('strong');
            title.className = 'small text-secondary fw-semibold mb-1 fs-6';
            title.textContent = label;

            const content = document.createElement('span');
            content.className = 'fs-6 aq-text-light text-break';
            content.textContent = value ?? '-';

            wrapper.appendChild(title);
            wrapper.appendChild(content);
            gridContainer.appendChild(wrapper);
        });

        this.refs.itemInfoContainer.appendChild(gridContainer);
        if (this.item.description) {
            const descWrapper = document.createElement('div');
            descWrapper.className = 'col-12 d-flex flex-column mt-3 pt-3 border-top';

            const descTitle = document.createElement('strong');
            descTitle.className = 'small text-secondary fw-semibold mb-1 fs-6';
            descTitle.textContent = 'Descrição';

            const descContent = document.createElement('p');
            descContent.className = 'fs-6 aq-text-soft mb-0 aq-text-soft lh-base';
            descContent.textContent = this.item.description;

            descWrapper.appendChild(descTitle);
            descWrapper.appendChild(descContent);
            this.refs.itemInfoContainer.appendChild(descWrapper);
        }
    }

    /**
     * Renders the profile section displaying the item owner's information.
     *
     * @returns {void}
     */
    renderOwnerSection() {
        if (this.isOwner) {
            return;
        }

        if (!this.refs.ownerSection) {
            return;
        }

        const cardWrapper = document.createElement('div');

        cardWrapper.className = "d-flex flex-column border-top mt-1 pt-3 gap-2"
        const card = document.createElement('div');

        card.className = [
            'card',
            'aq-card-surface',
            'aq-shadow-sm'
        ].join(' ');

        const label = document.createElement('strong');

        label.className = 'small text-secondary fw-semibold fs-6';

        label.textContent = "Anunciante";

        const body = document.createElement('div');

        body.className = 'card-body mb-0';

        const wrapper = document.createElement('div');

        wrapper.className = [
            'd-flex',
            'align-items-center',
            'gap-3'
        ].join(' ');

        const avatarContainer = document.createElement('div');

        const content = document.createElement('div');

        content.className = 'flex-grow-1';

        const ownerName = document.createElement('a');

        ownerName.id = "profile-link";

        ownerName.className = 'h6 fw-bold text-secondary text-decoration-none aq-clickable aq-text-shadow-glow mb-2';

        ownerName.textContent = this.owner.name;

        const ratingContainer = document.createElement('div');

        wrapper.appendChild(avatarContainer);
        wrapper.appendChild(content);
        content.appendChild(ownerName);
        content.appendChild(ratingContainer);
        body.appendChild(wrapper);

        card.appendChild(body);
        cardWrapper.appendChild(label);
        cardWrapper.appendChild(card);

        this.refs.ownerSection.appendChild(cardWrapper);

        this.ownerAvatar = new Avatar({
            imageUrl: this.owner.avatar,
            name: this.owner.name,
            size: 'sm'
        });

        this.ownerAvatar.mount(avatarContainer);

        this.ownerRating = new Rating({ value: Math.min(5, this.owner.reputation.averageRating), readonly: true });

        ratingContainer.appendChild(this.ownerRating.render());

        this.components.push(this.ownerAvatar);

        this.components.push(this.ownerRating);
    }

    /**
     * Renders the action buttons layout block to allow item editing or deletion.
     *
     * @returns {void}
     */
    renderActions() {
        if (!this.refs.actionsContainer) {
            return;
        }

        const wrapper = document.createElement('div');

        wrapper.className = [
            'd-grid',
            'gap-2'
        ].join(' ');

        if (this.isOwner) {
            const editButton = document.createElement('button');

            editButton.type = 'button';

            editButton.className = 'btn aq-btn-primary';

            editButton.dataset.action = 'edit-item';

            editButton.textContent = 'Editar';

            const deleteButton = document.createElement('button');

            deleteButton.type = 'button';

            deleteButton.className = 'btn btn-danger';

            deleteButton.dataset.action = 'delete-item';

            deleteButton.textContent = 'Excluir';

            wrapper.appendChild(editButton);

            wrapper.appendChild(deleteButton);
        } else {

            if (this.proposals.length > 0) {
                const proposalCount = document.createElement('p');

                proposalCount.className = 'small text-muted mt-2 mb-0';
                proposalCount.textContent = `${this.proposals.length} proposta(s) recebida(s)`;

                wrapper.appendChild(proposalCount);
            }
            if (!this.hasUserProposal) {
                const button = document.createElement('button');

                button.type = 'button';

                button.className = 'btn aq-btn-primary';

                button.dataset.action = 'proposal';

                button.textContent = 'Proposta';

                wrapper.appendChild(button);
            } else {
                const proposal = this.proposals.find(
                    currentProposal =>
                        currentProposal.proposerId ===
                        this.currentUser.id
                );

                const button = document.createElement('button');

                button.type = 'button';
                button.className = 'btn aq-btn-primary';
                button.dataset.action = 'open-chat';
                button.dataset.proposalId = proposal?.id ?? '';
                button.textContent = 'Ver Chat';

                wrapper.appendChild(button);
            }
        }

        this.refs.actionsContainer.appendChild(wrapper);
    }

    /**
     * Renders the list of proposals related to the current item.
     *
     * @returns {void}
     */
    renderProposals() {
        if (!this.isOwner) {
            return;
        }

        const section = this.refs.proposalsSection;

        if (!section) {
            return;
        }

        const title = document.createElement('h2');

        title.className = 'aq-h3 fw-bold mb-3 mt-3 text-primary';

        title.textContent = 'Propostas recebidas';

        section.appendChild(title);

        if (this.proposals.length === 0) {
            const emptyState =
                new EmptyState({
                    icon: 'bi-chat-square-text',
                    title: 'Nenhuma proposta recebida.',
                    description: 'Ainda não existem interessados neste anúncio.'
                });

            section.appendChild(emptyState.render());
            return;
        }

        const fragment = document.createDocumentFragment();

        this.proposals.forEach(
            proposal => {
                const proposer = UserService.getById(proposal.proposerId);

                if (!proposer) { return; }

                const container = document.createElement('div');

                container.className = 'mb-3';

                const chatCard = new ChatCard({
                    proposalId: proposal.id,
                    avatarUrl: proposer.avatar,
                    firstName: proposer.name.split(' ')[0],
                    fullName: proposer.name,
                    message: proposal.message,
                    status: proposal.status,
                    date: this.formatDate(proposal.createdAt),
                    unreadCount: 0,
                    variant: 'proposal',
                    onClick: proposalId => this.handleOpenChat(proposalId)
                });

                chatCard.mount(container);

                fragment.appendChild(container);

                this.proposalCards.push(chatCard);
            }
        );

        section.appendChild(fragment);
    }

    /**
    * Attaches interaction event listeners to the component's root element.
    *
    * @returns {void}
    */
    bindEvents() {
        const proposalModalElement = document.getElementById('proposal-modal');

        const deleteModalElement = document.getElementById('delete-item-modal');

        if (proposalModalElement && window.bootstrap) {
            this.proposalModal = new bootstrap.Modal(proposalModalElement);
        }

        if (deleteModalElement && window.bootstrap) {
            this.deleteModal = new bootstrap.Modal(deleteModalElement);
        }

        const backBtn = document.querySelector('[data-action="back"]');

        Events.on(backBtn, "click", () => history.back());
        this.listeners.push({
            element: backBtn,
            eventName: "click",
            handler: () => history.back()
        });

        if (this.isOwner) {
            const editBtn = document.querySelector('[data-action="edit-item"]');
            Events.on(editBtn, "click", () => {
                this.alertRender.info('Funcionalidade ainda não implementada.');
            });
            this.listeners.push({
                element: editBtn,
                eventName: "click",
                handler: () => {
                    this.alertRender.info('Funcionalidade ainda não implementada.');
                }
            });

            const delItemBtn = document.querySelector('[data-action="delete-item"]');
            Events.on(delItemBtn, "click", () => { this.deleteModal?.show(); });
            this.listeners.push({
                element: delItemBtn,
                eventName: "click",
                handler: () => { this.deleteModal?.show(); }
            });

            const confirmDelete = document.querySelector('[data-action="confirm-delete"]');
            Events.on(confirmDelete, "click", () => this.handleDeleteItem());
            this.listeners.push({
                element: confirmDelete,
                eventName: "click",
                handler: () => this.handleDeleteItem()
            });
        } else {

            const sendProposalBtn = document.querySelector('[data-action="submit-proposal"]');
            Events.on(sendProposalBtn, "click", () => this.handleCreateProposal());
            this.listeners.push({
                element: sendProposalBtn,
                eventName: "click",
                handler: () => this.handleCreateProposal()
            })

            const ownerProfilelink = document.querySelector('#profile-link');
            Events.on(ownerProfilelink, "click", () => {
                this.handleOwnerProfile(this.owner.id)
            });
            this.listeners.push({
                element: ownerProfilelink,
                eventName: "click",
                handler: () => this.handleOwnerProfile(this.owner.id)
            })

            if (this.hasUserProposal) {
                const openChat = document.querySelector('[data-action="open-chat"]');
                Events.on(openChat, "click", (event) => {
                    const proposalId =
                        event.currentTarget.dataset.proposalId;
                    this.handleOpenChat(proposalId);
                });
                this.listeners.push({
                    element: openChat,
                    eventName: "click",
                    handler: (event) => {
                        const proposalId =
                            event.currentTarget.dataset.proposalId;
                        this.handleOpenChat(proposalId);
                    }
                });
            } else {
                const proposalBtn = document.querySelector('[data-action="proposal"]');
                Events.on(proposalBtn, "click", () => { this.proposalModal?.show(); });
                this.listeners.push({
                    element: proposalBtn,
                    eventName: "click",
                    handler: () => { this.proposalModal?.show(); }
                });
            }
        }
    }

    /**
     * Executes the proposal creation workflow by collecting the form message, 
     * invoking the service layer, persisting the target chat context, and diverting viewports.
     * 
     * Execution Steps:
     * 1. Captures the raw textarea message input, falling back to an empty string if omitted.
     * 2. Calls `ProposalService` to store the new entity linked to the current item and proposer.
     * 3. Displays error notifications on failure or stores the new `proposalId` into navigation cache on success.
     * 4. Enforces local lifecycle teardown (`destroy`) before triggering the window redirect to the chat module.
     *
     * @returns {void}
     */
    handleCreateProposal() {
        const message = this.refs.proposalMessage.value || '';

        const result = ProposalService.createProposal({ itemId: this.item.id, proposerId: this.currentUser.id, message: message });

        if (!result.success) {
            this.alertRender.danger('Não foi possível criar a proposta.');
            return;
        }

        NavStorage.set(
            'chat-page',
            {
                proposalId:
                    result.proposal.id
            }
        );
        this.destroy();
        window.location.href = ROUTES['chat'];
    }

    /**
     * Persists the proposal ID to navigation storage and diverts to the chat page view.
     *
     * @param {string|number} proposalId - The unique identifier of the target proposal.
     * @returns {void}
     */
    handleOpenChat(proposalId) {
        NavStorage.set('chat-page',
            {
                proposalId
            }
        );
        this.destroy();
        window.location.href = ROUTES['chat'];
    }

    /**
     * Persists the owner ID to navigation storage and diverts to the profile page view.
     *
     * @param {string|number} ownerId - The unique identifier of the target item owner.
     * @returns {void}
     */
    handleOwnerProfile(ownerId) {
        NavStorage.set('profile-page',
            {
                userId: ownerId
            }
        );
        this.destroy();
        window.location.href = ROUTES['profile'];
    }

    /**
     * Executes the ad item deletion workflow, showing feedback alerts on success or failure.
     *
     * @returns {void}
     */
    handleDeleteItem() {
        const success = ItemService.removeItem(this.item.id);

        if (!success) {
            this.alertRender.danger('Não foi possível excluir o anúncio.');
            return;
        }

        this.alertRender.success('Anúncio excluído com sucesso.');
        this.destroy();
        window.location.href = ROUTES['dashboard'];
    }

    /**
     * Formats a date string or object into a localized pt-BR date string.
     *
     * @param {string|Date|null} value - The raw date value to be formatted.
     * @returns {string} The formatted date string, or '-' as a fallback.
     */
    formatDate(value) {
        if (!value) {
            return '-';
        }

        return new Date(value).toLocaleDateString('pt-BR');
    }

    /**
     * Calculates the inclusive remaining days between the current date and the expiration date.
     *
     * @param {string|Date} expiresAt - The expiration date string or object.
     * @returns {number} The absolute number of remaining days, bounded to a minimum of 0.
     */
    calculateRemainingDays(expiresAt) {
        const currentDate = new Date();

        const expirationDate = new Date(expiresAt);

        const difference = expirationDate - currentDate;

        return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
    }

    /**
     * Releases page resources
     */
    destroy() {
        this.carousel?.destroy();

        this.ownerAvatar?.destroy();

        this.ownerRating?.destroy();

        this.proposalCards.forEach(
            component =>
                component.destroy()
        );

        this.proposalCards = [];

        this.components.forEach(
            component => {
                if (
                    component?.destroy
                ) {
                    component.destroy();
                }
            }
        );

        this.components = [];
        this.listeners.forEach(listener => {
            Events.off(
                listener.element,
                listener.eventName,
                listener.handler
            );
        });

        this.carousel = null;
        this.ownerAvatar = null;
        this.ownerRating = null;
        this.qualityBadge = null;

        this.refs = {};

        this.listeners = [];

        this.proposalModal = null;
        this.deleteModal = null;
    }
}

window.addEventListener('DOMContentLoaded', () => new DescribeItemPage());
// I implemented a lifecycle invalidation for the BFCache (Back-Forward Cache)
// feature of mobile browsers, ensuring data reactivity in history rollback events.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});