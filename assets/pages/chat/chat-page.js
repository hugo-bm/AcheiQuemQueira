import { Session } from '../../js/core/session.js';
import { NavStorage } from '../../js/core/nav-storage.js';

import { ChatService } from '../../js/services/chat-service.js';
import { ProposalService } from '../../js/services/proposal-service.js';
import { NegotiationService } from '../../js/services/negotiation-service.js';
import { UserService } from '../../js/services/user-service.js';

import { ChatHeader } from '../../js/components/chat/chat-header.js';
import { NegotiationBanner } from '../../js/components/chat/negotiation-banner.js';
import { MessageList } from '../../js/components/chat/message-list.js';
import { ChatInput } from '../../js/components/chat/chat-input.js';

import { AlertRender } from '../../js/components/ui/alert-render.js';
import { Loading } from '../../js/components/ui/loading.js';

import { Events } from '../../js/core/events.js';
import { Helpers } from "../../js/core/helpers.js";
import { ItemService } from '../../js/services/item-service.js';

import "../../js/models/entities.js"
import { NEGOTIATION_STATUS, PROPOSAL_STATUS, ROUTES } from '../../js/core/constants.js';
import { Avatar } from '../../js/components/ui/avatar.js';

export class ChatPage {
    constructor() {
        this.currentUserID = null;

        this.chat = null;
        this.proposal = null;
        this.negotiation = null;
        this._item = null;

        this.messages = [];

        this.chatHeader = null;
        this.negotiationBanner = null;
        this.messageList = null;
        this.chatInput = null;

        this.loading = new Loading();
        
        this.listeners = [];
        
        this.headerContainer =
        document.getElementById('chat-header-container');
        
        this.bannerContainer =
        document.getElementById('chat-banner-container');
        
        this.messagesContainer =
        document.getElementById('chat-messages-container');
        
        this.inputContainer = document.getElementById('chat-input-container');

        this.alert = new AlertRender(document.getElementById('alert-container'));
        
        this.body = document.querySelector("body");
    }

    /**
     * Initializes the page.
     *
     * @returns {Promise<void>}
     */
    async init() {
        const context = NavStorage.get('chat-page');
        let receivedId = {chatId: context?.chatId, proposalId: null};
        if (!receivedId.chatId) {
            receivedId.proposalId = context?.proposalId;
        }

        if (!receivedId.proposalId && !receivedId.chatId) {
            this.alert.danger('Erro','Conversa não encontrada.');
            Helpers.debounce(()=>{window.location.href = history.back()}, 2000);
            return;
        }
        

        this.currentUserID = Session.getUserId();

        if (!this.currentUserID) {
            Helpers.debounce(()=>{window.location.href = ROUTES['login']},2000);

            return;
        }

        await this.loadData(receivedId);

        if (!this.chat) {
            this.alert.warning(
                'Conversa não encontrada',
                'Nenhuma conversa disponível para esta proposta.'
            );

            Helpers.debounce(()=>{window.location.href = ROUTES['dashboard']},2000);

            return;
        }

        this.render();

        this.registerEvents();

        this.messageList.scrollToBottom();
    }

    /**
     * Loads all required page data.
     * 
     * @typedef ReceivedId
     * @property {string|null} chatId
     * @property {string|null} proposalId
     *
     * @param {ReceivedId} receivedId
     *
     * @returns {Promise<void>}
     */
    async loadData(receivedId) {
        this.loading.show(this.body);

        const keys = Object.keys(receivedId);

        keys.forEach((key) => {
            if (key === 'proposalId' && receivedId[key] !== null)
            {
                this.proposal = ProposalService.getById(receivedId.proposalId);
                if (!this.proposal) {
                    return;
                }
                this.chat = ChatService.getByProposal(receivedId.proposalId);
                if (!this.chat) {
                    return;
                }
            } else 
            {
                this.chat = ChatService.getById(receivedId.chatId);
                if (!this.chat) {
                    return;
                }
                this.proposal = ProposalService.getById(this.chat.proposalId);
                if (!this.proposal) {
                    return;
                }
            }
        });

        try {
            this._item = ItemService.getById(this.proposal?.itemId);

            this.negotiation = NegotiationService.getProposalNegotiation(this.proposal.id);

            this.messages = ChatService.getMessages(this.chat.id) ?? [];

            ChatService.markChatAsRead(this.chat.id, this.currentUserID);
        }
        finally {
            this.loading.hide();
        }
    }

    /**
     * Renders page components.
     */
    render() {
        const otherUser =
            this.getOtherUser();

        if (!otherUser) {
            this.alert.danger("Usuário não encontrado!")
            window.location.href = ROUTES['dashboard']
        }
        let status = "open";
        if (this.negotiation) {
            status = this.negotiation.status !== NEGOTIATION_STATUS.OPEN
                ? this.negotiation.status
                : this.proposal.status;
        }

        this.chatHeader =
            new ChatHeader({
                user: otherUser,
                status: status,
                avatarComponent: new Avatar({ imageUrl: otherUser.avatar, name: otherUser?.name ?? "desconhecido", size: 'md' }),
            });

        this.chatHeader.mount(
            this.headerContainer
        );

        this.negotiationBanner = new NegotiationBanner({
            negotiation: this.negotiation,
            proposal: this.proposal,
            currentUserId: this.currentUserID,
            adOwnerId: this._item?.ownerId
        });

        this.negotiationBanner.mount(
            this.bannerContainer
        );

        this.messageList =
            new MessageList({
                messages: this.messages,
                currentUserId: this.currentUserID
            });
        
        this.messageList.mount(
            this.messagesContainer
        );

        this.chatInput =
            new ChatInput();

        this.chatInput.mount(
            this.inputContainer
        );
    }

    /**
     * Registers page event listeners.
     */
    registerEvents() {
        this.addChatEventListener(
            'chat:send-message',
            this.handleSendMessage.bind(this)
        );

        this.addChatEventListener(
            'chat:back',
            this.handleBack.bind(this)
        );

        this.addChatEventListener(
            'chat:user-profile',
            this.handleUserProfile.bind(this)
        );

        this.addChatEventListener(
            'negotiation:accept',
            this.handleAccept.bind(this)
        );

        this.addChatEventListener(
            'negotiation:reject',
            this.handleReject.bind(this)
        );

        this.addChatEventListener(
            'negotiation:leaving',
            this.handleLeaving.bind(this)
        );

        this.addChatEventListener(
            'negotiation:arrived',
            this.handleArrived.bind(this)
        );

        this.addChatEventListener(
            'negotiation:complete',
            this.handleComplete.bind(this)
        );

        this.addChatEventListener(
            'negotiation:cancel',
            this.handleCancel.bind(this)
        );
    }

    /**
     * Handles message sending.
     *
     * @param {Object} payload
     */
    async handleSendMessage(payload) {
        payload.cancelBubble = true;
        if (this.chat.status !== "active") {
          this.alert.danger(
            "Erro",
            "Não foi possível enviar a mensagem. O Chat está encerrado!",
          );

          return;
        }
        const result =
            ChatService.sendMessage({
                chatId: this.chat.id,
                senderId: this.currentUserID,
                content: payload.detail.content
            });

        if (!result.success) {
            this.alert.danger(
                'Erro',
                result.error ??
                'Não foi possível enviar a mensagem.'
            );

            return;
        }

        this.messageList.addMessage(
            result.message
        );

        this.messageList.scrollToBottom();
    }

    /**
     * Handles proposal acceptance.
     */
    async handleAccept() {
        const accepted =
            ProposalService.acceptProposal(
                this.proposal.id
            );

        if (!accepted) {
            this.alert.danger(
                'Erro',
                'Não foi possível aceitar a proposta.'
            );

            return;
        }

        const newNegotiation = NegotiationService.createNegotiation(this.proposal.id);
        
        this.negotiation = newNegotiation;
        this.negotiationBanner.setNegotiation(newNegotiation);
        this.chatHeader.setStatus(newNegotiation.status);

        this.alert.success(
            'Sucesso',
            'Proposta aceita com sucesso.'
        );
    }

    /**
     * Handles proposal rejection.
     */
    async handleReject() {
        const rejected =
            ProposalService.rejectProposal(
                this.proposal.id
            );

        if (!rejected) {
            this.alert.danger(
                'Erro',
                'Não foi possível recusar a proposta.'
            );

            return;
        }

        ChatService.closeChat(this.chat.id);

        await this.refresh();

        this.alert.success(
            'Sucesso',
            'Proposta recusada.'
        );
    }

    /**
     * Handles leaving status.
     */
    async handleLeaving() {
        const result =
            NegotiationService.markAsLeaving(
                this.negotiation.id
            );

        if (!result.success) {
            this.alert.danger(
                'Erro',
                result.error
            );

            return;
        }

        await this.refresh();

        this.alert.success(
            'Sucesso',
            'Status atualizado.'
        );
    }

    /**
     * Handles arrived status.
     */
    async handleArrived() {
        const result =
            NegotiationService.markAsArrived(
                this.negotiation.id
            );

        if (!result.success) {
            this.alert.danger(
                'Erro',
                result.error
            );

            return;
        }

        await this.refresh();

        this.alert.success(
            'Sucesso',
            'Chegada confirmada.'
        );
    }

    /**
     * Handles completed negotiation.
     */
    async handleComplete() {
        const result =
            NegotiationService.completeNegotiation(
                this.negotiation.id
            );

        if (!result.success) {
            this.alert.danger(
                'Erro',
                result.error
            );

            return;
        }
        
        ChatService.closeChat(this.chat.id);

        await this.refresh();

        this.alert.success(
            'Sucesso',
            'Negociação concluída.'
        );
    }

    /**
     * Handles negotiation cancellation.
     */
    async handleCancel() {
        const result =
            NegotiationService.cancelNegotiation(
                this.negotiation.id
            );

        if (!result.success) {
            this.alert.danger(
                'Erro',
                result.error
            );

            return;
        }

        ChatService.closeChat(this.chat.id);

        await this.refresh();


        this.alert.success('Sucesso','Negociação cancelada.');
    }

    /**
     * Handles back navigation.
     */
    handleBack() {
      this.destroy();
      NavStorage.remove("chat-page");
      history.back();
    }

    /**
     * Handles profile click.
     *
     * @param {Object} payload
     */
    handleUserProfile(payload) {
        NavStorage.set(
            'profile-page',
            {
                userId: payload.detail.userId
            }
        );
        this.destroy();
       window.location.href = ROUTES['profile'];
    }

    /**
     * Reloads page data and updates components.
     *
     * @returns {Promise<void>}
     */
    async refresh() {
        await this.loadData(
            this.proposal.id
        );


        this.chatHeader.setStatus(
            this.negotiation?.status || 'open'
        );
        

        this.negotiationBanner.setNegotiation(
            this.negotiation
        );

        this.negotiationBanner.setProposal(this.proposal);

        this.negotiationBanner.refresh();

        this.messageList.setMessages(
            this.messages
        );

        this.messageList.scrollToBottom();
    }

    /**
     * Returns the conversation counterpart user.
     *
     * @returns {Object|null}
     */
    getOtherUser() {
        if (!this._item) {
            return null;
        }

        const userId =
            this.currentUserID ===
            this._item.ownerId
                ? this.proposal.proposerId
                : this._item.ownerId;

        return UserService.getById(
            userId
        );
    }

    /**
     * Registers a global event listener.
     *
     * @param {Object} element
     * @param {string} eventName
     * @param {Function} handler
     */
    addChatEventListener(eventName,handler) {
        Events.on(this.body, eventName, handler);

        this.listeners.push({
            eventName,
            handler
        });
    }

    /**
     * Releases page resources.
     */
    destroy() {
      const globalElement = this.body;
        this.listeners.forEach(listener => {
            Events.off(
                globalElement,
                listener.eventName,
                listener.handler
            );
        });

        this.listeners = [];

        this.chatHeader?.destroy();
        this.negotiationBanner?.destroy();
        this.messageList?.destroy();
        this.chatInput?.destroy();

        this.chatHeader = null;
        this.negotiationBanner = null;
        this.messageList = null;
        this.chatInput = null;
        this.body = null;
    }
}

document.addEventListener("DOMContentLoaded", async() => {
  const core = new ChatPage();
  await core.init();
});