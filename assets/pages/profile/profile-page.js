import { Session } from '../../js/core/session.js';
import { UserService } from '../../js/services/user-service.js';
import { ReviewService } from '../../js/services/review-service.js';
import { NegotiationService } from '../../js/services/negotiation-service.js';

import { NavStorage } from '../../js/core/nav-storage.js';
import { ROUTES } from '../../js/core/constants.js';

import { Avatar } from '../../js/components/ui/avatar.js';
import { Rating } from '../../js/components/ui/rating.js';
import { EmptyState } from '../../js/components/ui/empty-state.js';
import { ProfileMetricCard } from '../../js/components/profile/profile-metric-card.js';

import { AlertRender } from '../../js/components/ui/alert-render.js';

class ProfilePage {
  constructor() {
    this.alertRender = new AlertRender("#alert-container");
    this.currentUserId = null;
    this.profileUser = null;
    this.isOwnProfile = false;
    this.avatarComponent = null;
    this.emptyState = null;
    this.metricComponents = [];
    this.ratingComponents = [];

    this.refs = {
      backButton: document.getElementById("back-button"),
      profileContainer: document.getElementById("profile-container"),
      metricsContainer: document.getElementById("metrics-container"),
      reviewsContainer: document.getElementById("reviews-container"),
    };

    this.initialize();
  }

  initialize() {
    this.currentUserId = Session.getUserId();
    if (!this.currentUserId) {
      window.location.href = ROUTES["login"];
      return;
    }

    const profileUser = this.loadProfile();
    if (!profileUser) {
      window.location.href = ROUTES["dashboard"];
      return;
    }

    this.profileUser = profileUser;
    this.isOwnProfile = this.currentUserId === this.profileUser.id;

    // 🌟 ORDEM CORRETA DE RENDERS E EVENTOS (Evita referências nulas)
    this.renderProfile();
    this.renderMetrics();
    this.renderReviews();
    this.bindEvents();
  }

  loadProfile() {
    const navigationData = NavStorage.get("profile");
    const profileUserId = navigationData?.userId;
    if (profileUserId) {
      return UserService.getById(profileUserId);
    }
    if (this.currentUserId) {
      return UserService.getById(this.currentUserId);
    }
    return null;
  }

  renderProfile() {
    const container = this.refs.profileContainer;
    if (!container) return;
    container.textContent = "";

    const card = document.createElement("div");
    card.className = "card aq-card-surface aq-shadow-sm aq-radius-md";

    const body = document.createElement("div");
    body.className = "card-body d-flex flex-column align-items-center gap-3";

    const avatarWrapper = document.createElement("div");
    this.avatarComponent = new Avatar({
      imageUrl: this.profileUser.avatar,
      name: this.profileUser.name,
      size: "lg",
    });
    this.avatarComponent.mount(avatarWrapper);

    const name = document.createElement("h1");
    name.className = "aq-h2 m-0 text-center";
    name.textContent = this.profileUser.name;

    body.appendChild(avatarWrapper);
    body.appendChild(name);

    if (this.isOwnProfile) {
      const editButton = document.createElement("button");
      editButton.id = "edit-profile-button";
      editButton.type = "button";
      editButton.className = "btn aq-btn-outline-primary";
      editButton.style.minWidth = "48px";
      editButton.style.minHeight = "48px";
      editButton.innerHTML = `
                <span class="d-md-none"><i class="bi bi-pencil"></i></span>
                <span class="d-none d-md-inline-flex align-items-center gap-2"><i class="bi bi-pencil"></i><span>Editar Perfil</span></span>
            `.trim();
      body.appendChild(editButton);
    }

    const publicData = this.buildPublicData();
    body.appendChild(publicData);
    card.appendChild(body);
    container.appendChild(card);
  }

  buildPublicData() {
    const wrapper = document.createElement("div");
    // 🌟 SOLUÇÃO DE GEOMETRIA: 'w-100 row g-3 text-start' anula o encolhimento herdado do nó pai
    wrapper.className = "w-100 row g-3 text-start m-0";

    const personalFields = [
      { label: "Nome", value: this.profileUser?.name },
      { label: "Email", value: this.profileUser?.email },
      { label: "Telefone", value: this.profileUser?.phone },
      { label: "Facebook", value: this.profileUser?.socialLinks?.facebook },
      { label: "Instagram", value: this.profileUser?.socialLinks?.instagram },
    ];

    const locationFields = [];
    if (this.isOwnProfile) {
      locationFields.push({
        label: "Endereço",
        value: this.profileUser?.address,
      });
    }
    locationFields.push(
      { label: "Bairro", value: this.profileUser?.neighborhood },
      { label: "Cidade", value: this.profileUser?.city },
      { label: "Estado", value: this.profileUser?.state },
    );

    const colPersonal = document.createElement("div");
    colPersonal.className = "col-12 p-0 mb-2";

    const colLocation = document.createElement("div");
    colLocation.className = "col-12 p-0";

    colPersonal.appendChild(
      this.createDataBlock("Informações Pessoais", personalFields),
    );
    colLocation.appendChild(
      this.createDataBlock("Localização", locationFields),
    );

    wrapper.appendChild(colPersonal);
    wrapper.appendChild(colLocation);

    return wrapper;
  }

  createDataBlock(titleText, fields) {
    const card = document.createElement("div");
    card.className = "card w-100 aq-card-surface border-0";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body p-0";

    const title = document.createElement("h3");
    title.className = "h5 text-primary fw-semibold mb-3 border-bottom pb-2";
    title.textContent = titleText;
    cardBody.appendChild(title);

    // 🌟 ALINHAMENTO GEOMÉTRICO FIEL: 'row row-cols-1 row-cols-md-2 g-3'
    // Garante empilhamento vertical puro (1 coluna) no mobile e duas colunas paralelas exatas no desktop
    const gridFields = document.createElement("div");
    gridFields.className = "row row-cols-1 row-cols-md-2 g-3 m-0 w-100";

    fields.forEach((field) => {
      const group = document.createElement("div");
      group.className = "col d-flex flex-column mb-1 p-0";

      const label = document.createElement("strong");
      label.className = "small text-muted fw-semibold mb-1 fs-6";
      label.textContent = field.label;

      const value = document.createElement("span");
      value.className = "fs-6 aq-text-soft text-truncate";
      value.textContent = field.value ?? "-";

      group.appendChild(label);
      group.appendChild(value);
      gridFields.appendChild(group);
    });

    cardBody.appendChild(gridFields);
    card.appendChild(cardBody);
    return card;
  }

  renderMetrics() {
    if (!this.refs.metricsContainer) return;
    this.refs.metricsContainer.textContent = "";

    const reviews = ReviewService.getReviewsReceived(this.profileUser.id);
    const averageRating = ReviewService.getAverageRating(this.profileUser.id);
    const negotiations = NegotiationService.getUserNegotiations(
      this.profileUser.id,
    );

    const metrics = [
      {
        icon: "bi-chat-square-text",
        value: reviews.length,
        label: "Avaliações",
      },
      {
        icon: "bi-star-fill",
        value: Number(averageRating ?? 0).toFixed(1),
        label: "Nota Média",
      },
      {
        icon: "bi-check-circle",
        value: negotiations.length,
        label: "Negociações",
      },
    ];

    // 🌟 CORREÇÃO DE GRID: As métricas herdam a linha responsiva para conversar com o HTML consertado
    metrics.forEach((metric) => {
      const column = document.createElement("div");
      column.className = "col-12 col-md-4 mb-2 mb-md-0";

      const wrapper = document.createElement("div");
      wrapper.className = "h-100 w-100";

      const card = new ProfileMetricCard(metric);
      card.mount(wrapper);
      this.metricComponents.push(card);

      column.appendChild(wrapper);
      this.refs.metricsContainer.appendChild(column);
    });
  }

  renderReviews() {
    if (!this.refs.reviewsContainer) return;
    this.refs.reviewsContainer.textContent = "";

    const title = document.createElement("h2");
    title.className = "aq-h5 text-primary fw-semibold mb-3";
    title.textContent = "Depoimentos de Usuários";
    this.refs.reviewsContainer.appendChild(title);

    const reviews = ReviewService.getReviewsReceived(this.profileUser.id);

    if (!reviews.length) {
      this.refs.reviewsContainer.appendChild(this.renderEmptyState());
      return;
    }

    const fragment = document.createDocumentFragment();

    reviews.forEach((review) => {
      const reviewer = UserService.getById(review.reviewerId);

      const card = document.createElement("div");
      card.className = "card aq-card-surface aq-shadow-sm aq-radius-md mb-3";

      const body = document.createElement("div");
      body.className = "card-body d-flex flex-column gap-2";

      const reviewerLink = document.createElement("button");
      reviewerLink.type = "button";
      reviewerLink.className =
        "btn btn-link p-0 text-start fw-semibold text-decoration-none text-primary";
      reviewerLink.dataset.userId = reviewer?.id ?? "";
      reviewerLink.textContent = reviewer?.name ?? "Usuário";
      const date = document.createElement("span");
      date.className = "small aq-text-soft";
      date.textContent = this.formatDate(review.createdAt);
      const ratingContainer = document.createElement("div");
      const rating = new Rating({ value: review.rating, readonly: true });
      ratingContainer.appendChild(rating.render());
      this.ratingComponents.push(rating);
      const comment = document.createElement("p");
      comment.className = "mb-0 aq-text-soft";
      comment.textContent = review.comment;
      body.appendChild(reviewerLink);
      body.appendChild(date);
      body.appendChild(ratingContainer);
      body.appendChild(comment);
      card.appendChild(body);
      fragment.appendChild(card);
    });
    this.refs.reviewsContainer.appendChild(fragment);
  }

  renderEmptyState() {
    const wrapper = document.createElement("div");
    wrapper.className = "w-100 text-center py-3";
    this.emptyState = new EmptyState({
      title: "Nenhuma avaliação recebida",
      description: "Este usuário ainda não recebeu avaliações.",
      actionText: null,
      actionCallback: null,
    });
    wrapper.appendChild(this.emptyState.render());
    return wrapper;
    // Retorna o contêiner higienizado e amarrado de forma estrita
  }
  bindEvents() {
    if (this.refs.backButton) {
      this.refs.backButton.addEventListener("click", () => {
        const navigationData = NavStorage.get("profile");
        const backIds = Array.isArray(navigationData?.backIds)
          ? [...navigationData.backIds]
          : [];
        const previousId = backIds.pop();
        if (!previousId) {
          window.location.href = ROUTES["dashboard"];
          return;
        }
        NavStorage.set("profile", { userId: previousId, backIds });
        window.location.href = ROUTES["profile"];
      });
    }
    const editButton = document.getElementById("edit-profile-button");
    if (editButton) {
      editButton.addEventListener("click", () => {
        this.alertRender.info("Funcionalidade ainda não implementada.");
      });
    }
    // 🌟 AGORA FUNCIONA: Captura os elementos recém-injetados de depoimentos
    this.refs.reviewsContainer
      .querySelectorAll("[data-user-id]")
      .forEach((link) => {
        link.addEventListener("click", () => {
          const targetUserId = link.dataset.userId;
          if (!targetUserId) return;
          const navigationData = NavStorage.get("profile");
          const backIds = Array.isArray(navigationData?.backIds)
            ? [...navigationData.backIds]
            : [];
          backIds.push(this.profileUser.id);
          NavStorage.set("profile", { userId: targetUserId, backIds });
          window.location.href = ROUTES["profile"];
        });
      });
  }
  formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  destroy() {
    this.avatarComponent?.destroy();
    this.metricComponents.forEach((component) => component.destroy());
    this.ratingComponents.forEach((component) => component.destroy());
    this.metricComponents = [];
    this.ratingComponents = [];
    this.avatarComponent = null;
    this.emptyState = null;
    this.refs = {};
  }
}

document.addEventListener('DOMContentLoaded',() => new ProfilePage());