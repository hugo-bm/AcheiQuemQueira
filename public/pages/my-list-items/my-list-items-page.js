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


    init() {

        this.cacheElements();
        this.bindEvents();
        this.initialize();

    }


    cacheElements() {

        this.refs = {
            alert: new AlertRender("#alert-conteiner"),
            content: document.getElementById('items-container'),
            backButton: document.getElementById('back-button'),
            addButton: document.getElementById('floating-action-button'),
        };

    }


    bindEvents() {
        if (this.refs.backButton) {
            Events.on(this.refs.backButton,'click',this.onBackClick);
        }


        if (this.refs.addButton) {
            Events.on(this.refs.addButton,'click',this.onAddItemClick);
        }

    }


    initialize() {

        const userId =Session.getUserId();


        if (!userId) {

            window.location.href = ROUTES['login'];
            return;
        }


        this.user =  UserService.getById(userId);


        if (!this.user) {

            window.location.href = ROUTES['login'];
            return;
        }

        this.loadItems();

    }


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

        } catch(error) {
            this.refs.alert.danger('Não foi possível carregar seus anúncios.');
        }

    }


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
                    subcategory:subcategoryName,
                    location: {
                        neighborhood: this.user.neighborhood ?? '',
                        city: this.user.city ?? '',
                        state: this.user.state ?? ''
                    }
                };
            });

    }


    renderItems(data) {

        this.clearComponents();


        this.itemGrid =
            new ItemGrid({data: data,onItemClick: this.handleItemClick.bind(this)});


        this.itemGrid.mount(this.refs.content);

    }


    renderEmptyState() {

        this.clearComponents();

        this.emptyState =
            new EmptyState({
                icon:'bi-box-seam',
                title:'Nenhum anúncio encontrado',
                description:'Você ainda não criou nenhum anúncio.',
            });


        const emptyNode = this.emptyState.render();
        if (emptyNode && this.refs.content) {
            this.refs.content.appendChild(emptyNode);
        }

    }


    handleItemClick(item) {
        NavStorage.set('describe-item-page', { itemId: item.id });
        window.location.href = ROUTES['describe-item'];
    }


    handleBackClick() {
        this.destroy();
        window.location.href =  ROUTES['dashboard'];
    }


    handleAddItemClick() {
        this.destroy();
        window.location.href = ROUTES['add-item'];
    }


    clearComponents() {

        if (this.itemGrid) {
            this.itemGrid.destroy();
            this.itemGrid = null;
        }

        if (this.emptyState) {
            this.emptyState = null;
        }
    }


    destroy() {
        if (this.refs.backButton) {
            Events.off(this.refs.backButton,'click',this.onBackClick);
        }
        if (this.refs.addButton) {
            Events.off(this.refs.addButton,'click',this.onAddItemClick);
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