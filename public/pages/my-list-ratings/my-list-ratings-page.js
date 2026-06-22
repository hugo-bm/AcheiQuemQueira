import { Session } from '../../js/core/session.js';
import { UserService } from '../../js/services/user-service.js';
import { ReviewService } from '../../js/services/review-service.js';

import { Rating } from '../../js/components/ui/rating.js';
import { EmptyState } from '../../js/components/ui/empty-state.js';
import { AlertRender } from '../../js/components/ui/alert-render.js';

import { ROUTES } from '../../js/core/constants.js';
import { Events } from '../../js/core/events.js';

class MyListRatingsPage {
  constructor() {
    this.alert = new AlertRender('#alert-container');

    this.currentUserId = null;

    this.ratingsContainer = document.getElementById(
      'ratings-container'
    );

    this.backButton = document.getElementById(
      'back-button'
    );

    this.ratingComponents = [];
    this.listeners = [];

    this.initialize();
  }

  /**
    * Orchestrates the lifecycle initialization sequence of the page.
    *
    * @returns {void} 
    */
  initialize() {
    this.currentUserId = Session.getUserId();

    if (!this.currentUserId) {
      window.location.href =
        ROUTES['login'];

      return;
    }

    this.bindEvents();

    const reviews = this.loadReviews();

    this.renderRatings(reviews);
  }

  /**
   * Loads reviews written by current user.
   *
   * @returns {Array}
   */
  loadReviews() {
    return ReviewService.getReviewsWritten(this.currentUserId);
  }

  /**
   * Creates view model.
   *
   * @param {Object} review
   * @returns {Object}
   */
  buildReviewViewModel(review) {
    const reviewedUser = UserService.getById(review.reviewedUserId);

    return {
      review,
      reviewedUserName: reviewedUser?.name ?? 'Usuário não encontrado',
      formattedDate: this.formatDate(review.createdAt),
    };
  }

  /**
   * Formats date.
   *
   * DD/MM/YYYY
   *
   * @param {string} date
   * @returns {string}
   */
  formatDate(date) {
    const currentDate =  new Date(date);

    const day = String( currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Renders review list.
   *
   * @param {Array} reviews
   */
  renderRatings(reviews) {
    this.clearContainer();

    if (!reviews.length) {
      this.renderEmptyState();
      return;
    }

    const fragment = document.createDocumentFragment();

    reviews.forEach(review => {
      const viewModel = this.buildReviewViewModel(review);

      const card = this.createReviewCard(viewModel);

      fragment.appendChild(card);
    });

    this.ratingsContainer.appendChild(fragment);
  }

  /**
   * Creates review card.
   *
   * @param {Object} viewModel
   * @returns {HTMLElement}
   */
  createReviewCard(viewModel) {
    const wrapper = document.createElement('div');

    wrapper.classList.add(
      'card',
      'aq-card-surface',
      'aq-shadow-sm',
      'aq-radius-md',
      'mb-3',
      'aq-clickable'
    );

    wrapper.setAttribute('role', 'button');

    wrapper.setAttribute('tabindex', '0');

    const cardBody = document.createElement('div');

    cardBody.classList.add('card-body');

    const name = document.createElement('h2');

    name.classList.add('aq-h4', 'mb-3');

    name.textContent = viewModel.reviewedUserName;

    const ratingContainer = document.createElement('div');

    ratingContainer.classList.add('mb-3');

    const rating = new Rating({
        value: viewModel.review.rating,
        readonly: true
      });

    ratingContainer.appendChild(rating.render());

    this.ratingComponents.push(rating);

    const comment = document.createElement('p');

    comment.classList.add('mb-3', 'aq-text-soft');

    comment.textContent = viewModel.review.comment;

    const date = document.createElement('small');

    date.classList.add('text-muted');

    date.textContent = viewModel.formattedDate;

    cardBody.appendChild(name);
    cardBody.appendChild(ratingContainer);
    cardBody.appendChild(comment);
    cardBody.appendChild(date);

    wrapper.appendChild(cardBody);

    const clickHandler = () => {
      this.alert.info('Funcionalidade ainda não implementada.');
    };

    const keyHandler = event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        clickHandler();
      }
    };
    Events.on(wrapper, "click", clickHandler);
    Events.on(wrapper, "keydown", keyHandler);

    this.listeners.push({
      element: wrapper,
      eventName: 'click',
      handler: clickHandler
    });

    this.listeners.push({
      element: wrapper,
      eventName: 'keydown',
      handler: keyHandler
    });

    return wrapper;
  }

  /**
   * Renders empty state.
   * 
   * @returns {void} 
   */
  renderEmptyState() {
    const emptyState =
      new EmptyState({
        icon: 'bi-star',
        title: 'Nenhuma avaliação encontrada',
        description: 'Você ainda não realizou nenhuma avaliação.',
        actionText: 'Explorar anúncios',
        actionCallback: () => {
          window.location.href = ROUTES['dashboard'];
        }
      });

    this.ratingsContainer.appendChild(emptyState.render());
  }

  /**
   * Attaches interaction event listeners to the component's root element.
   * 
   * @returns {void} 
   */
  bindEvents() {
    if (!this.backButton) {
      return;
    }

    const backHandler = () => { window.location.href =  ROUTES['dashboard'];
    };

    Events.on(this.backButton, "click",backHandler);

    this.listeners.push({
      element: this.backButton,
      eventName: 'click',
      handler: backHandler
    });
  }

  /**
   * Clears container.
   * 
   * @returns {void}
   */
  clearContainer() {
    while (this.ratingsContainer && this.ratingsContainer.firstChild) {
    this.ratingsContainer.removeChild(this.ratingsContainer.firstChild);
    }
  }

  /**
   * Releases resources.
   */
  destroy() {
    this.listeners.forEach(
      listener => {
        Events.off(listener.element, listener.eventName, listener.handler);
      }
    );

    this.ratingComponents.forEach(
      component =>
        component.destroy()
    );

    this.listeners = [];
    this.ratingComponents = [];

    this.clearContainer();

    this.currentUserId = null;
    this.backButton = null;
    this.ratingsContainer = null;
    this.alert = null;
  }
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    new MyListRatingsPage();
  }
);

// I implemented a lifecycle invalidation for the BFCache (Back-Forward Cache)
// feature of mobile browsers, ensuring data reactivity in history rollback events.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload(); 
    }
});