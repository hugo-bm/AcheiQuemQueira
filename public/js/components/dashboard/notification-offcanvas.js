import { BaseComponent } from '../base/base-component.js';
import { NotificationCard } from './notification-card.js';
import { Loading } from '../ui/loading.js';
import { EmptyState } from '../ui/empty-state.js';

/**
 * NotificationOffcanvas component.
 *
 * Responsible only for presenting notifications.
 */
export class NotificationOffcanvas extends BaseComponent {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.title='Notificações']
   * @param {Object[]} [options.notifications=[]]
   * @param {Function|null} [options.onNotificationClick=null]
   */
  constructor(options = {}) {
    super();

    this.title = options.title ?? 'Notificações';
    this.notifications = options.notifications ?? [];
    this.onNotificationClick =
      options.onNotificationClick ?? null;

    this.loading = new Loading({
      message: 'Carregando notificações...'
    });

    this.offcanvas = null;
    this.notificationCards = [];

    this.isLoading = false;

    this.refs = {};
  }

  /**
   * Renders component markup.
   *
   * @returns {string}
   */
  render() {
    return `
      <div
        class="offcanvas offcanvas-end aq-w-sm-100"
        tabindex="-1"
        aria-labelledby="notification-offcanvas-title"
      >
        <div class="offcanvas-header">
          <h5
            id="notification-offcanvas-title"
            class="offcanvas-title"
          >${this.title}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body p-0"
          data-role="body"
        ></div>
      </div>
    `;
  }

  /**
   * Called after mount.
   */
  afterMount() {
    this.refs.body =
      this.element.querySelector('[data-role="body"]');

    this.offcanvas =
      bootstrap.Offcanvas.getOrCreateInstance(
        this.element
      );

    this.addListener(
      this.element,
      'shown.bs.offcanvas',
      this.#handleShown.bind(this)
    );

    this.addListener(
      this.element,
      'hidden.bs.offcanvas',
      this.#handleHidden.bind(this)
    );

    this.#renderContent();
  }

  /**
   * Opens offcanvas.
   */
  open() {
    this.offcanvas?.show();
  }

  /**
   * Closes offcanvas.
   */
  close() {
    this.offcanvas?.hide();
  }

  /**
   * Updates notifications.
   *
   * @param {Object[]} notifications
   */
  setNotifications(notifications = []) {
    this.notifications = notifications;

    if (!this.refs.body) {
      return;
    }

    this.#renderContent();
  }

  /**
   * Clears notifications.
   */
  clearNotifications() {
    this.setNotifications([]);
  }

  /**
   * Displays loading state.
   */
  showLoading() {
    this.isLoading = true;

    this.#destroyCards();
    this.#clearBody();

    this.loading.show(this.refs.body);
  }

  /**
   * Hides loading state.
   */
  hideLoading() {
    this.isLoading = false;

    this.loading.hide();

    this.#renderContent();
  }

  /**
   * Renders current state.
   *
   * @private
   */
  #renderContent() {
    if (!this.refs.body) {
      return;
    }

    this.loading.hide();
    this.#destroyCards();
    this.#clearBody();

    if (this.isLoading) {
      this.loading.show(this.refs.body);
      return;
    }

    if (!this.notifications.length) {
      this.#renderEmptyState();
      return;
    }

    this.#renderNotifications();
  }

  /**
   * Renders notification list.
   *
   * @private
   */
  #renderNotifications() {
    const list = document.createElement('div');

    list.className = 'd-flex flex-column gap-2 p-3';

    const fragment = document.createDocumentFragment();

    this.notifications.forEach(notification => {
      const wrapper = document.createElement('div');

      wrapper.classList.add("mb-2")
      fragment.appendChild(wrapper);

      const card = new NotificationCard({
        notification,
        onClick: currentNotification => {
          if (typeof this.onNotificationClick === 'function') {
            this.onNotificationClick(currentNotification);
          }
        }
      });

      card.mount(wrapper);
      this.notificationCards.push(card);
    });

    list.appendChild(fragment);

    this.refs.body.appendChild(list);
  }

  /**
   * Renders empty state.
   *
   * @private
   */
  #renderEmptyState() {
    const emptyState = new EmptyState({
      icon: 'bi-bell',
      title: 'Nenhuma notificação',
      description:
        'Quando houver novidades elas aparecerão aqui.'
    });

    const element = emptyState.render();

    if (typeof element === 'string') {
      const wrapper = document.createElement('div');

      wrapper.innerHTML = element.trim();

      this.refs.body.appendChild(
        wrapper.firstElementChild
      );

      return;
    }

    this.refs.body.appendChild(element);
  }

  /**
   * Clears body content.
   *
   * @private
   */
  #clearBody() {
    while (this.refs.body.firstChild) {
      this.refs.body.removeChild(
        this.refs.body.firstChild
      );
    }
  }

  /**
   * Destroys mounted cards.
   *
   * @private
   */
  #destroyCards() {
    this.notificationCards.forEach(card => {
      card.destroy();
    });

    this.notificationCards = [];
  }

  /**
   * Offcanvas shown handler.
   *
   * @private
   */
  #handleShown() {}

  /**
   * Offcanvas hidden handler.
   *
   * @private
   */
  #handleHidden() {}

  /**
   * Releases resources.
   */
  destroy() {
    this.loading.hide();

    this.#destroyCards();

    if (this.offcanvas) {
      this.offcanvas.hide();
      this.offcanvas.dispose();
      this.offcanvas = null;
    }

    this.refs = {};

    super.destroy();
  }
}