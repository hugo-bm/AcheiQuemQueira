import { Session } from '../../js/core/session.js';
import { UserService } from '../../js/services/user-service.js';
import { ItemService } from '../../js/services/item-service.js';
import { CatalogService } from '../../js/services/catalog-service.js';

import { ItemGrid } from '../../js/components/dashboard/item-grid.js';
import { EmptyState } from '../../js/components/ui/empty-state.js';
import { Loading } from '../../js/components/ui/loading.js';
import { AlertRender } from '../../js/components/ui/alert-render.js';

import { NavStorage } from '../../js/core/nav-storage.js';
import { Events } from '../../js/core/events.js';
import { ROUTES } from '../../js/core/constants.js';


export class MyListItemsPage {

    constructor() {

        this.user = null;

        this.itemGrid = null;
        this.emptyState = null;

        this.loading = new Loading({ message: "Carregando seus anúncios..." });
        this.refs = {};

        this.onBackClick = this.handleBackClick.bind(this);

        this.onAddItemClick = this.handleAddItemClick.bind(this);
        this.init();
    }

    /**
    * Orchestrates the lifecycle initialization sequence of the page.
    *
    * @returns {void}
    */
    init() {

        this.cacheElements();
        this.bindEvents();
        this.initialize();

    }

    /**
     * Caches required DOM element references and instantiates utility alert components.
     *
     * @returns {void}
     */
    cacheElements() {

        this.refs = {
            alert: new AlertRender("#alert-conteiner"),
            content: document.getElementById('items-container'),
            backButton: document.getElementById('back-button'),
            addButton: document.getElementById('floating-action-button'),
        };
    }

    /**
    * Attaches interaction event listeners to the component's root element.
    *
    * @returns {void}
    */
    bindEvents() {
        if (this.refs.backButton) {
            Events.on(this.refs.backButton, 'click', this.onBackClick);
        }


        if (this.refs.addButton) {
            Events.on(this.refs.addButton, 'click', this.onAddItemClick);
        }

    }


     /**
     * Validates user credentials, authenticates the session, and triggers data loading.
     *
     * @returns {void}
     */
    initialize() {
        const userId = Session.getUserId();

        if (!userId) {
            window.location.href = ROUTES['login'];
            return;
        }

        this.user = UserService.getById(userId);

        if (!this.user) {
            window.location.href = ROUTES['login'];
            return;
        }

        this.loadItems();
    }

    /**
     * Manages the loading indicator overlay while retrieving user items to spawn layout renders.
     *
     * @returns {void}
     */
    loadItems() {

        try {
            if (this.refs.content) {
                this.loading.show(this.refs.content);
            }
            const items = ItemService.getUserItems(this.user.id);

            const data = this.buildGridData(items);

            this.loading.hide();

            if (data.length === 0) {
                this.renderEmptyState();
                return;
            }
            this.renderItems(data);

        } catch (error) {
            this.refs.alert.danger('Não foi possível carregar seus anúncios.');
        }

    }

/**
     * Formats, sorts chronologically, and compiles item entities into hydrated grid view models.
     *
     * @param {Object[]} items - The collection of raw item records to transform.
     * @returns {Object[]} The compiled array of structured grid item payloads.
     */
    buildGridData(items) {
        const catalogResponse = CatalogService.getAllCatalog();

        const catalog = catalogResponse.data;

        return [...items]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .map(item => {

                const catalogResult = CatalogService.getSubcategoryContext(item.subcategoryId);
                const categoryName = catalogResult?.data?.category?.name || "Outros";
                const subcategoryName = catalogResult?.data?.subcategory?.name || "Diversos";

                return {
                    item: item,
                    category: categoryName,
                    subcategory: subcategoryName,
                    location: {
                        neighborhood: this.user.neighborhood ?? '',
                        city: this.user.city ?? '',
                        state: this.user.state ?? ''
                    }
                };
            });

    }

    /**
     * Clears active layouts and mounts the parent ItemGrid component into its section.
     *
     * @param {Object[]} data - The compiled collection of formatted item data view models.
     * @returns {void}
     */
    renderItems(data) {

        this.clearComponents();

        this.itemGrid =
            new ItemGrid({ data: data, onItemClick: this.handleItemClick.bind(this) });

        this.itemGrid.mount(this.refs.content);
    }

    /**
     * Instantiates and appends the empty placeholder component when no conversations exist.
     *
     * @returns {void}
     */
    renderEmptyState() {

        this.clearComponents();

        this.emptyState =
            new EmptyState({
                icon: 'bi-box-seam',
                title: 'Nenhum anúncio encontrado',
                description: 'Você ainda não criou nenhum anúncio.',
            });

        const emptyNode = this.emptyState.render();
        if (emptyNode && this.refs.content) {
            this.refs.content.appendChild(emptyNode);
        }

    }


    /**
     * Persists the selected item identity and redirects the user to the details view page.
     *
     * @param {Object} item - The target item entity record.
     * @returns {void}
     */
    handleItemClick(item) {
        NavStorage.set('describe-item-page', { itemId: item.id });
        window.location.href = ROUTES['describe-item'];
    }

    /**
     * Executes the lifecycle destruction and diverts the viewport back to the dashboard.
     *
     * @returns {void}
     */
    handleBackClick() {
        this.destroy();
        window.location.href = ROUTES['dashboard'];
    }

    /**
     * Executes the lifecycle destruction and diverts the viewport to the add item page.
     *
     * @returns {void}
     */
    handleAddItemClick() {
        this.destroy();
        window.location.href = ROUTES['add-item'];
    }

    /**
     * Destroys active subcomponents and releases memory pointers safely.
     *
     * @returns {void}
     */
    clearComponents() {

        if (this.itemGrid) {
            this.itemGrid.destroy();
            this.itemGrid = null;
        }

        if (this.emptyState) {
            this.emptyState = null;
        }
    }

    /**
     * Releases page resources
     */
    destroy() {
        if (this.refs.backButton) {
            Events.off(this.refs.backButton, 'click', this.onBackClick);
        }
        if (this.refs.addButton) {
            Events.off(this.refs.addButton, 'click', this.onAddItemClick);
        }
        this.clearComponents();
        this.refs = {};
    }
}


window.addEventListener('DOMContentLoaded', () => new MyListItemsPage());

// I implemented a lifecycle invalidation for the BFCache (Back-Forward Cache)
// feature of mobile browsers, ensuring data reactivity in history rollback events.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});