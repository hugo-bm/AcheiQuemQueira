import { DashboardHeader } from '../../js/components/dashboard/dashboard-header.js';
import { ItemGrid } from '../../js/components/dashboard/item-grid.js';
import { NotificationOffcanvas } from '../../js/components/dashboard/notification-offcanvas.js';
import { EmptyState } from '../../js/components/ui/empty-state.js';
import { AlertRender } from '../../js/components/ui/alert-render.js';

import { Session } from '../../js/core/session.js';
import { NavStorage } from '../../js/core/nav-storage.js';
import { UserService } from '../../js/services/user-service.js';
import { ItemService } from '../../js/services/item-service.js';
import { NotificationService } from '../../js/services/notification-service.js';
import { CatalogService } from '../../js/services/catalog-service.js';
import { ROUTES } from '../../js/core/constants.js';

class DashboardPage {
  /**
   * Creates dashboard page controller.
   */
  constructor() {
    this.currentUser = null;

    this.header = null;
    this.itemGrid = null;
    this.notificationOffcanvas = null;
    this.emptyState = null;

    this.alertRender = new AlertRender("#alert-container");

    this.headerContainer = document.getElementById('dashboard-header-container');

    this.gridContainer = document.getElementById('item-grid-container');

    this.notificationContainer = document.getElementById('notification-offcanvas-container');

    this.fabButton = document.getElementById('floating-action-button');

    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
  }

  /**
   * Initializes page.
   *
   * @returns {Promise<void>}
   */
  async init() {
    try {
      const sessionUserId = Session.getUserId();

      if (!sessionUserId) {
        window.location.href = ROUTES['login'];

        return;
      }

      this.currentUser =
        UserService.getById(sessionUserId);

      if (!this.currentUser) {
        Session.logout();

        window.location.href = ROUTES['login'];

        return;
      }

      console.log(this)

      await this.initializeHeader();
      await this.initializeNotifications();
      await this.initializeItems();

      this.initializeFab();

      window.addEventListener('beforeunload', this.handleBeforeUnload);

    } catch (error) {
      console.error(error)
      if (this.alertRender?.danger) {
        this.alertRender.danger('Erro ao carregar dashboard.');
      }
    }
  }

  /**
   * Initializes dashboard header.
   *
   * @returns {Promise<void>}
   */
  async initializeHeader() {
    this.header = new DashboardHeader({
      firstName: this.extractFirstName(),
      lastName: this.extractLastName(),
      avatarUrl: this.currentUser.avatar,

      onSearch: query => {
        NavStorage.set('search-page',{ query });

        window.location.href = ROUTES['search'];
      },

      onOpenNotifications: () => {
        this.notificationOffcanvas?.open();
      },

      onProfile: () => {
        window.location.href = ROUTES['profile'];
      },

      onLogout: () => {
        Session.logout();
        window.location.href = ROUTES['login'];
      },

      onNavigate: route => {this.navigate(route);}});

    this.header.mount(this.headerContainer);
  }

  /**
   * Initializes notification offcanvas.
   *
   * @returns {Promise<void>}
   */
  async initializeNotifications() {
    const notifications = NotificationService.getByUser(this.currentUser.id);

    this.notificationOffcanvas =new NotificationOffcanvas(
      { notifications,
        onNotificationClick:
          notification => {
            if (!notification.readAt) {
              NotificationService.markAsRead(notification.id);
            }
          }
      }
    );

    this.notificationOffcanvas.mount(
      this.notificationContainer
    );
  }

  /**
   * Initializes dashboard items.
   *
   * @returns {Promise<void>}
   */
  async initializeItems() {
    const items = ItemService.getActiveItems();

    const preparedItems = this.prepareItems(items);

    const orderedItems = this.sortItemsByLocation(preparedItems);

    if (!orderedItems.length) {
      this.renderEmptyState();
      return;
    }

    this.itemGrid = new ItemGrid({
      data: orderedItems,

      onItemClick: data => {
        console.log(data)
        NavStorage.set('describe-item-page',{itemId: data.id});
        window.location.href = ROUTES['describe-item'];
      }
    });

    this.itemGrid.mount(this.gridContainer);
  }

  /**
   * Creates dashboard item data.
   *
   * @param {Array} items
   *
   * @returns {Array}
   */
  prepareItems(items) {
    if (!Array.isArray(items)) return [];

    return items.map(item => {
              if (!item) return null;
              const owner = UserService.getById(item.ownerId);

              if (!owner) { return null;}

              const catalogResult = CatalogService.getSubcategoryContext(item.subcategoryId);
              console.log(catalogResult)
              const categoryName = catalogResult?.data?.category?.name || "Outros";
              const subcategoryName = catalogResult?.data?.subcategory?.name || "Diversos";
              return {
                item,
                category: categoryName,
                subcategory: subcategoryName,
                location: {
                  neighborhood: owner.neighborhood,
                  city: owner.city,
                  state: owner.state
                }};
            }).filter(Boolean);
  }

  /**
   * Orders items by proximity.
   *
   * @param {Array} items
   *
   * @returns {Array}
   */
  sortItemsByLocation(items) {
    const userNeighborhood =
      (this.currentUser.neighborhood || '').toLowerCase();

    const userCity = (this.currentUser.city || '').toLowerCase();

    const userState = (this.currentUser.state || '').toLowerCase();

    return [...items].sort(
      (a, b) =>
        this.calculatePriority(
          a.location,
          userNeighborhood,
          userCity,
          userState
        ) -
        this.calculatePriority(
          b.location,
          userNeighborhood,
          userCity,
          userState
        )
    );
  }

  /**
   * Calculates location priority.
   *
   * @param {Object} location - Item location
   * @param {string} neighborhood - Location Filter
   * @param {string} city - Location filter
   * @param {string} state - Location filter
   *
   * @returns {number}
   */
  calculatePriority(
    location,
    neighborhood,
    city,
    state
  ) {
    const itemNeighborhood = (location.neighborhood || '').toLowerCase();
    const itemCity = (location.city || '').toLowerCase();
    const itemState = (location.state || '').toLowerCase();

    if (itemNeighborhood === neighborhood) {
      return 1;
    }

    if (itemCity === city) {
      return 2;
    }

    if (itemState === state) {
      return 3;
    }

    return 4;
  }

  /**
   * Renders empty state.
   */
  renderEmptyState() {
    this.emptyState =
      new EmptyState({
        icon: 'bi-search',
        title:
          'Nenhum anúncio encontrado próximo de você.',
        description:
          'Não existem anúncios para exibir.'
      });

     this.gridContainer.appendChild(this.emptyState.render());  
  }

  /**
   * Initializes floating action button.
   */
  initializeFab() {
    if (!this.fabButton) {
      return;
    }

    this.fabButton.addEventListener(
      'click',
      () => {
        window.location.href = ROUTES['add-item'];
      }
    );
  }

  /**
   * Handles navigation requests.
   *
   * @param {string} route
   */
  navigate(route) {
    const destination =
      ROUTES[route];

    if (destination) {
      window.location.href = destination;
    }
  }

  /**
   * Extracts user first name.
   *
   * @returns {string}
   */
  extractFirstName() {
    return (
      this.currentUser.name || ''
    ).trim().split(' ')[0];
  }

  /**
   * Extracts user last name.
   *
   * @returns {string}
   */
  extractLastName() {
    const parts = (
      this.currentUser.name || ''
    ).trim().split(' ').filter(Boolean);

    if (parts.length < 2) {
      return '';
    }

    return parts[parts.length - 1];
  }

  /**
   * Cleans page resources.
   */
  destroy() {
    this.header?.destroy();
    this.itemGrid?.destroy();
    this.notificationOffcanvas?.destroy();
    this.emptyState?.destroy();

    window.removeEventListener('beforeunload',this.handleBeforeUnload);

    this.header = null;
    this.itemGrid = null;
    this.notificationOffcanvas = null;
    this.emptyState = null;
  }

  /**
   * Handles browser unload.
   */
  handleBeforeUnload() {
    this.destroy();
  }
}

document.addEventListener(
  'DOMContentLoaded',
  async () => {
    const page =
      new DashboardPage();

    await page.init();
  }
);