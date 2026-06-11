import { BaseComponent } from '../base/base-component.js';
import { Avatar } from '../ui/avatar.js';

export class DashboardHeader extends BaseComponent {
  /**
   * Creates a new DashboardHeader instance.
   *
   * @param {Object} [options={}]
   *
   * @param {string} [options.firstName='']
   * User first name.
   *
   * @param {string} [options.lastName='']
   * User Last name.
   *
   * @param {string|null} [options.avatarUrl=null]
   * User avatar URL.
   *
   * @param {Function|null} [options.onSearch=null]
   * Search callback.
   *
   * @param {Function|null} [options.onOpenNotifications=null]
   * Notification callback.
   *
   * @param {Function|null} [options.onProfile=null]
   * Profile callback.
   *
   * @param {Function|null} [options.onLogout=null]
   * Logout callback.
   *
   * @param {Function|null} [options.onNavigate=null]
   * Navigation callback.
   */
  constructor(options = {}) {
    super();

    this.firstName = options.firstName || "";
    this.lastName = options.lastName || "";
    this.avatarUrl = options.avatarUrl || null;

    this.onSearch = options.onSearch || (() => {});

    this.onOpenNotifications = options.onOpenNotifications || (() => {});

    this.onLogout = options.onLogout || (() => {});
    this.onNavigate = options.onNavigate || (() => {});

    this.avatar = null;
    this.mobileAvatar = null;
    this.mobileMenu = null;
    this.searchCollapse = null;

    this.refs = {};

    this.boundSyncDesktopToMobile = this.syncDesktopToMobile.bind(this);
    this.boundSyncMobileToDesktop = this.syncMobileToDesktop.bind(this);
  }

  /**
   * Renders component markup.
   *
   * @returns {string}
   */
  render() {
    return `
      <header class="sticky-top w-100">
        <nav class="navbar navbar-expand-lg bg-body border-bottom">
          <div class="container-fluid">
            <button class="btn d-lg-none" type="button" data-role="mobile-menu-button">
              <i class="bi bi-list fs-4"></i>
            </button>
            <a class="navbar-brand d-flex align-items-center gap-2" href="#">
              <img src="assets/icons/favicon-32.svg" width="32" height="32" alt="Logo do AQQ">
              <span class="d-none d-md-inline d-lg-none aq-text-logo">AQQ</span>
              <span class="d-none d-lg-inline fs-5 aq-text-logo"><div class="d-flex gap-1"><div class="fw-semibold">Achei</div> Quem <div class="fw-bold">Queira</div></div></span>
            </a>
            <div class="ms-auto d-flex align-items-center gap-2 d-lg-none">
              <button type="button" class="btn" data-role="mobile-search-button">
                <i class="bi bi-search"></i>
              </button>
              <button type="button" class="btn" data-role="notification-button-mobile">
                <i class="bi bi-bell"></i>
              </button>
            </div>
            <div class="collapse navbar-collapse d-none d-lg-flex">
              <form class="mx-4 flex-grow-1" data-role="desktop-search-form">
                <input type="search" class="form-control" placeholder="Pesquisar..." data-role="desktop-search-input">
              </form>
              <ul class="navbar-nav align-items-center gap-2">
                <li class="nav-item">
                  <button type="button" class="btn btn-link nav-link" data-route="my-items">Meus Itens</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="btn btn-link nav-link" data-route="my-chats">Conversas</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="btn btn-link nav-link" data-route="my-reviews">Avaliações</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="btn" data-role="notification-button-desktop">
                    <i class="bi bi-bell"></i>
                  </button>
                </li>
                <li class="nav-item dropdown">
                  <button class="btn dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown" type="button" data-role="dropdown-trigger">
                    <span data-role="desktop-avatar"></span>
                    <span data-role="greeting">Olá, ${this.firstName}</span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <button class="dropdown-item" data-role="profile-button">Meu Perfil</button>
                    </li>
                    <li>
                      <button class="dropdown-item text-danger" data-role="logout-button">Sair</button>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div class="collapse border-bottom bg-body" id="dashboard-search-collapse">
          <div class="p-2">
            <form data-role="mobile-search-form" class="input-group">
              <input type="search" class="form-control" placeholder="Pesquisar..." data-role="mobile-search-input">
              <button type="button" class="btn btn-outline-secondary" data-role="close-search">
                <i class="bi bi-x-lg"></i>
              </button>
            </form>
          </div>
        </div>
        <div class="offcanvas offcanvas-start aq-w-sm-100" tabindex="-1" data-role="mobile-menu">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title">Menu</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>
          <div class="offcanvas-body">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div data-role="mobile-avatar"></div>
              <span>Olá, ${this.firstName}</span>
            </div>
            <div class="list-group">
              <button class="list-group-item list-group-item-action" data-route="my-items">Meus Itens</button>
              <button class="list-group-item list-group-item-action" data-route="my-chats">Conversas</button>
              <button class="list-group-item list-group-item-action" data-route="my-reviews">Avaliações</button>
              <button class="list-group-item list-group-item-action" data-role="profile-button-mobile">Meu Perfil</button>
              <button class="list-group-item list-group-item-action text-danger" data-role="logout-button-mobile">Sair</button>
            </div>
          </div>
        </div>
      </header>
    `.trim();
  }

  /**
   * Initializes Bootstrap components.
   *
   * @returns {void}
   */
  afterMount() {
    this.cacheElements();
    this.mountAvatars();
    this.initializeBootstrap();
    this.registerEvents();
  }

  cacheElements() {
    this.refs.mobileMenu = this.element.querySelector(
      '[data-role="mobile-menu"]',
    );
    this.refs.searchCollapse = this.element.querySelector(
      "#dashboard-search-collapse",
    );

    this.refs.desktopSearchForm = this.element.querySelector(
      '[data-role="desktop-search-form"]',
    );
    this.refs.desktopSearchInput = this.element.querySelector(
      '[data-role="desktop-search-input"]',
    );

    this.refs.mobileSearchForm = this.element.querySelector(
      '[data-role="mobile-search-form"]',
    );
    this.refs.mobileSearchInput = this.element.querySelector(
      '[data-role="mobile-search-input"]',
    );

    this.refs.greeting = this.element.querySelector('[data-role="greeting"]');

    // Elementos de Gatilho Mobile-First
    this.refs.mobileMenuBtn = this.element.querySelector(
      '[data-role="mobile-menu-button"]',
    );
    this.refs.mobileSearchBtn = this.element.querySelector(
      '[data-role="mobile-search-button"]',
    );
    this.refs.closeSearchBtn = this.element.querySelector(
      '[data-role="close-search"]',
    );
    this.refs.notifyMobileBtn = this.element.querySelector(
      '[data-role="notification-button-mobile"]',
    );
    this.refs.notifyDesktopBtn = this.element.querySelector(
      '[data-role="notification-button-desktop"]',
    );

    // Perfis e Logouts
    this.refs.profileBtn = this.element.querySelector(
      '[data-role="profile-button"]',
    );
    this.refs.profileMobileBtn = this.element.querySelector(
      '[data-role="profile-button-mobile"]',
    );
    this.refs.logoutBtn = this.element.querySelector(
      '[data-role="logout-button"]',
    );
    this.refs.logoutMobileBtn = this.element.querySelector(
      '[data-role="logout-button-mobile"]',
    );
    this.refs.dropdownTrigger = this.element.querySelector(
      '[data-role="dropdown-trigger"]',
    );
  }

  mountAvatars() {
    const desktopTarget = this.element.querySelector(
      '[data-role="desktop-avatar"]',
    );
    const mobileTarget = this.element.querySelector(
      '[data-role="mobile-avatar"]',
    );
    const fullName = `${this.firstName} ${this.lastName}`;

    this.avatar = new Avatar({
      imageUrl: this.avatarUrl,
      name: fullName,
      size: "sm",
    });
    this.avatar.mount(desktopTarget);

    this.mobileAvatar = new Avatar({
      imageUrl: this.avatarUrl,
      name: fullName,
      size: "sm",
    });
    this.mobileAvatar.mount(mobileTarget);
  }

  initializeBootstrap() {
    this.mobileMenu = bootstrap.Offcanvas.getOrCreateInstance(
      this.refs.mobileMenu,
    );
    this.searchCollapse = bootstrap.Collapse.getOrCreateInstance(
      this.refs.searchCollapse,
      { toggle: false },
    );
    if (this.refs.dropdownTrigger) {
      this.dropdown = bootstrap.Dropdown.getOrCreateInstance(
        this.refs.dropdownTrigger,
      );
    }
  }

  registerEvents() {
    // Global Shipping Routes
    this.element.querySelectorAll("[data-route]").forEach((btn) => {
      this.addListener(btn, "click", () => {
        this.closeMenu();
        this.onNavigate?.(btn.dataset.route);
      });
    });

    // Submitting Surveys (Avoid page refresh and unify the search)
    if (this.refs.desktopSearchForm) {
      this.addListener(this.refs.desktopSearchForm, "submit", (e) =>
        this.handleSearchSubmit(e, this.refs.desktopSearchInput),
      );
    }
    if (this.refs.mobileSearchForm) {
      this.addListener(this.refs.mobileSearchForm, "submit", (e) =>
        this.handleSearchSubmit(e, this.refs.mobileSearchInput),
      );
    }

    // Mobile Search Menu Interactions
    if (this.refs.mobileMenuBtn) {
      this.addListener(this.refs.mobileMenuBtn, "click", () => this.openMenu());
    }
    if (this.refs.mobileSearchBtn) {
      this.addListener(this.refs.mobileSearchBtn, "click", () =>
        this.openSearch(),
      );
    }
    if (this.refs.closeSearchBtn) {
      this.addListener(this.refs.closeSearchBtn, "click", () =>
        this.closeSearch(),
      );
    }

    // Notification Clicks (Mobile & Desktop)
    if (this.refs.notifyMobileBtn) {
      this.addListener(this.refs.notifyMobileBtn, "click", () =>
        this.onOpenNotifications?.(),
      );
    }
    if (this.refs.notifyDesktopBtn) {
      this.addListener(this.refs.notifyDesktopBtn, "click", () =>
        this.onOpenNotifications?.(),
      );
    }

    // Profiles and Logouts (Mapping the Correct HTML IDs)
    if (this.refs.profileBtn) {
      this.addListener(this.refs.profileBtn, "click", () =>
        this.onNavigate?.("profile"),
      );
    }

    if (this.refs.profileMobileBtn) {
      this.addListener(this.refs.profileMobileBtn, "click", () =>
        this.onNavigate?.("profile"),
      );
    }
    if (this.refs.logoutBtn) {
      this.addListener(this.refs.logoutBtn, "click", () => this.onLogout?.());
    }
    if (this.refs.logoutMobileBtn) {
      this.addListener(this.refs.logoutMobileBtn, "click", () =>
        this.onLogout?.(),
      );
    }
     // Real-time Input Synchronization (Desktop <-> Mobile)
    if (this.refs.desktopSearchInput) {
      this.addListener(this.refs.desktopSearchInput, "input", this.boundSyncDesktopToMobile);
    }

    if (this.refs.mobileSearchInput) {
      this.addListener(this.refs.mobileSearchInput, "input", this.boundSyncMobileToDesktop);
    }
  }

  handleSearchSubmit(event, inputElement) {
    event.preventDefault();
    if (!inputElement) return;
    const value = inputElement.value.trim();
    if (value) {
      this.onSearch?.(value);
    }
  }

  /**
   * Synchronizes the value entered on the computer to the hidden bar on the mobile phone.
   */
  syncDesktopToMobile() {
    if (this.refs.mobileSearchInput && this.refs.desktopSearchInput) {
      this.refs.mobileSearchInput.value = this.refs.desktopSearchInput.value;
    }
  }

  /**
   * It synchronizes the value entered on the mobile phone back to the computer's address bar.
   */
  syncMobileToDesktop() {
    if (this.refs.desktopSearchInput && this.refs.mobileSearchInput) {
      this.refs.desktopSearchInput.value = this.refs.mobileSearchInput.value;
    }
  }

  /**
   * Updates displayed first name.
   *
   * @param {string} FirstName
   * @param {string} LastName
   * @returns {void}
   */
  setName(FirstName, LastName) {
    this.firstName = FirstName || "";
    this.lastName = LastName || "";

    if (this.refs.greeting) {
      this.refs.greeting.textContent = `Olá, ${this.firstName}`;
    }

    const fullName = `${this.firstName} ${this.lastName}`;
    this.avatar?.setName(fullName);
    this.mobileAvatar?.setName(fullName);
  }

  /**
   * Updates avatar image.
   *
   * @param {string|null} url
   * @returns {void}
   */
  setAvatar(url) {
    this.avatarUrl = url || null;

    this.avatar?.setImage(url);
    this.mobileAvatar?.setImage(url);
  }

  /**
   * Clears search inputs.
   *
   * @returns {void}
   */
  clearSearch() {
    if (this.refs.desktopSearchInput) {
      this.refs.desktopSearchInput.value = "";
    }

    if (this.refs.mobileSearchInput) {
      this.refs.mobileSearchInput.value = "";
    }
  }

  /**
   * Opens mobile menu.
   *
   * @returns {void}
   */
  openMenu() {
    this.mobileMenu?.show();
  }

  /**
   * Closes mobile menu.
   *
   * @returns {void}
   */
  closeMenu() {
    this.mobileMenu?.hide();
  }

  /**
   * Opens mobile search.
   *
   * @returns {void}
   */
  openSearch() {
    this.searchCollapse?.show();

    requestAnimationFrame(() => {
      this.refs.mobileSearchInput?.focus();
    });
  }

  /**
   * Closes mobile search.
   *
   * @returns {void}
   */
  closeSearch() {
    this.searchCollapse?.hide();
    this.clearSearch();
  }

  /**
   * Releases component resources.
   *
   * @returns {void}
   */
   destroy() {
    if (this.dropdown) {
      this.dropdown.dispose();
      this.dropdown = null;
    }
    
    if (this.mobileMenu) {
      this.mobileMenu.hide();
      this.mobileMenu.dispose();
      this.mobileMenu = null;
    }

    if (this.searchCollapse) {
      this.searchCollapse.hide();
      this.searchCollapse.dispose();
      this.searchCollapse = null;
    }

    if (this.avatar) {
      this.avatar.destroy();
      this.avatar = null;
    }

    if (this.mobileAvatar) {
      this.mobileAvatar.destroy();
      this.mobileAvatar = null;
    }

    this.refs = {};
    this.boundSyncDesktopToMobile = null;
    this.boundSyncMobileToDesktop = null;
    super.destroy();
  }
}