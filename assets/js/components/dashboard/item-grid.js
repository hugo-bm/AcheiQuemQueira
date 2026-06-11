import { BaseComponent } from '../base/base-component.js';

import { ItemCard } from './item-card.js';
import { Loading } from '../ui/loading.js';
import { EmptyState } from '../ui/empty-state.js';



export class ItemGrid extends BaseComponent {

/**
 * @typedef {Object} Location
 * @property {string} neighborhood - The neighborhood of the Item owner location.
 * @property {string} city - The city of the Item owner location.
 * @property {string} state - The state of the Item owner location.
 */

/**
 * @typedef {Object} DataItem
 * @property {Object} item - The object containing item information.
 * @property {Location} location - The geographical data of the item.
 * @property {string} subcategory - The subcategory the item belongs to.
 * @property {string} category - The main category of the item.
 */

/**
 * @param {Object} [options={}] Component configuration.
 * @param {DataItem[]} [options.data=[]] - array of items information
 * @param {Function|null} options.onItemClick - function callback
 */
    constructor({
        data = [],
        onItemClick = null
    } = {}) {
        super();

        this.data = Array.isArray(data) ? data : [];
        this.onItemClick = onItemClick;

        this.itemCards = [];

        this.loading = new Loading({
            message: 'Carregando anúncios...'
        });

        this.emptyState = null;

        this.gridElement = null;
        this.contentElement = null;
    }

    render() {
        return `<div class="item-grid w-100"><div data-ref="content"></div></div>`.trim();
    }

    afterMount() {
        this.contentElement = this.element.querySelector('[data-ref="content"]');
        this.renderItems();
    }

    renderItems() {
        this.clearContent();

        if (!this.data.length) {
            this.renderEmptyState();
            return;
        }

        this.renderGrid();
    }

    renderGrid() {
        this.gridElement = document.createElement('div');

        this.gridElement.className = 'row g-3';

        const fragment = document.createDocumentFragment();


        this.data.forEach(itemData => {
            this.appendItem(itemData, fragment);
        });

        this.gridElement.appendChild(fragment);
        this.contentElement.appendChild(this.gridElement);
    }

    renderEmptyState() {
        this.emptyState =
            new EmptyState({
                icon: 'bi-search',
                title: 'Nenhum anúncio encontrado',
                description:
                    'Não existem anúncios para exibir.'
            });

        const emptyElement =
            this.emptyState.render();

        this.contentElement.appendChild(
            emptyElement
        );
    }

    appendItem(itemData, targetContainer = null) {
        // Fallback if the method is called individually from outside.
        const containerToAppend = targetContainer || this.gridElement;

        if (!this.gridElement) {
            this.gridElement = document.createElement('div');
            this.gridElement.className =  'row g-3';
            this.contentElement.appendChild(this.gridElement);
        }

        const column = document.createElement('div');
        column.className = 'col-12 col-md-6 col-lg-4';


        containerToAppend.appendChild(column);

        const card =
            new ItemCard({
                item: itemData.item,
                category: itemData.category,
                subcategory: itemData.subcategory,
                location: itemData.location,
                onClick: item => {
                    if (typeof this.onItemClick === 'function') {
                        this.onItemClick(item);
                    }
                }
            });

        card.mount(column);

        this.itemCards.push({
            card,
            column
        });
    }

    setItems(items = []) {
        this.data = items;

        this.clear();

        this.renderItems();
    }

    showLoading() {
        this.clearContent();

        this.loading.show(
            this.contentElement
        );
    }

    hideLoading() {
        this.loading.hide();

        this.renderItems();
    }

    clear() {
        this.itemCards.forEach(
            ({ card }) => {
                card.destroy();
            }
        );

        this.itemCards = [];

        if (
            this.gridElement &&
            this.gridElement.parentNode
        ) {
            this.gridElement.parentNode.removeChild(
                this.gridElement
            );
        }

        this.gridElement = null;

        if (
            this.emptyState?.element &&
            this.emptyState.element.parentNode
        ) {
            this.emptyState.element.parentNode.removeChild(
                this.emptyState.element
            );
        }

        this.emptyState = null;
    }

    clearContent() {
        this.loading.hide();

        this.clear();

        while (
            this.contentElement &&
            this.contentElement.firstChild
        ) {
            this.contentElement.removeChild(
                this.contentElement.firstChild
            );
        }
    }

    destroy() {
        this.loading.hide();

        this.clear();

        this.contentElement = null;
        this.gridElement = null;
        this.emptyState = null;

        super.destroy();
    }
}