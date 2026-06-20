import { Session } from '../../js/core/session.js';
import { NavStorage } from '../../js/core/nav-storage.js';
import { ROUTES } from '../../js/core/constants.js';

import { ItemService } from '../../js/services/item-service.js';
import { UserService } from '../../js/services/user-service.js';
import { CatalogService } from '../../js/services/catalog-service.js';

import { AlertRender } from '../../js/components/ui/alert-render.js';

import { SearchFilterPanel } from '../../js/components/search/search-filter-panel.js';
import { ItemGrid } from '../../js/components/dashboard/item-grid.js';
import { EmptyState } from '../../js/components/ui/empty-state.js';

import { Events } from '../../js/core/events.js';

export class SearchPage {
    constructor() {
        this.alertRender = new AlertRender('#alert-container');

        this.searchFilterPanel = null;
        this.itemGrid = null;

        this.listeners = [];
        this.refs = {};

        this.term = '';

        this.filters = {
            order: '',
            quality: '',
            categoryId: '',
            subcategoryId: '',
            state: '',
            city: '',
            neighborhood: ''
        };

        this.isResettingFilters = false;

        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);

        this.handleBack = this.handleBack.bind(this);

        this.handleSearchKeyDown = this.handleSearchKeyDown.bind(this);
        this.init();
    }

    init() {
        if (!Session.isAuthenticated()) {
            NavStorage.remove('search-page');

            window.location.href = ROUTES['login'];
            return;
        }
        

       try {
         this.cacheElements();
 
         this.renderHeader(); 
         
         this.renderFilters();
         
         this.loadSearchState();
         
         this.executeSearch();
       } catch (error) {
        console.error("Erro na inicialização da busca:", error);
       }
    }

    cacheElements() {
        this.refs.headerContainer = document.getElementById('search-header');
        this.refs.filterContainer = document.getElementById('search-filter-container');
        this.refs.resultsContainer = document.getElementById('results-container');
    }

    loadSearchState() {
        const state = NavStorage.get('search-page');

        if (!state) {
            return;
        }

        this.term = state.query || '';
        this.filters = { ...this.filters, ...(state.filters ?? {}) };
        if (this.refs.searchInput) {
            this.refs.searchInput.value = this.term;
        }
    }

    saveSearchState() {
        NavStorage.set('search-page',
            {
                query: this.term,
                filters: { ...this.filters }
            }
        );
    }

     /**
   * Creates page header.
   */
    renderHeader() {
        const header = this.refs.headerContainer;
        header.replaceChildren();

        const wrapper = document.createElement('div');

        wrapper.className = [
            'd-flex',
            'flex-row',
            'flex-wrap',
            'justify-content-center',
            'align-items-center', 
            'w-100',
            'gap-2',
        ].join(' ');

        const backButton = document.createElement('button');

        backButton.type = 'button';

        backButton.className = [
          "btn",
          "aq-btn-secundary",
          "p-0",
          "text-decoration-none",
          "d-flex",
          "align-items-center",
          "justify-content-center",
        ].join(" ");

        backButton.setAttribute('aria-label', 'Voltar');
        backButton.style.zIndex = "100";
        backButton.style.minWidth = "48px";
        backButton.style.minHeight = "48px";
        
        const backIcon = document.createElement('i');
        
        backIcon.className = 'bi bi-arrow-left fs-3';
        
        backButton.appendChild(backIcon);
        
        const searchInputConteiner = document.createElement('div');
        const searchInput = document.createElement('input');
        
        searchInputConteiner.className = "mx-auto flex-grow-1"
        searchInputConteiner.style.minWidth = "48px";

        searchInput.type = 'search';

        searchInput.className = [
            'form-control',
            'flex-grow-1',
            'border',
            'border-1',
            'aq-shadow-sm',
            'aq-surface'
        ].join(' ');

        searchInput.placeholder = 'Pesquisar anúncios...';

        searchInput.value = this.term;

        searchInputConteiner.appendChild(searchInput);

        const searchButton = document.createElement('button');

        searchButton.type = 'button';

        searchButton.className = [
            'btn',
            'aq-btn-primary',
            'flex-shrink-0',
            'rounded-circle'            
        ].join(' ');

        searchButton.setAttribute('aria-label', 'Pesquisar');

        const searchIcon = document.createElement('i');

        searchIcon.className = 'bi bi-search fs-5';

        searchButton.appendChild(searchIcon);

        wrapper.appendChild(backButton);

        wrapper.appendChild(searchInputConteiner);

        wrapper.appendChild(searchButton);

        header.appendChild(wrapper);

        this.refs.searchInput = searchInput;

        this.refs.searchButton = searchButton;

        this.refs.backButton = backButton;

        this.addListener(backButton, 'click', this.handleBack);
        this.addListener(searchButton, 'click', this.handleSearch);
        this.addListener(searchInput, 'keydown', this.handleSearchKeyDown);
    }

    renderFilters() {
        if (!this.refs.filterContainer) 
        {
            return;
        }
        this.searchFilterPanel = new SearchFilterPanel({
            filters: { ...this.filters },
            onChange: this.handleFilterChange
        });

        this.searchFilterPanel.mount(this.refs.filterContainer);
    }

    handleBack() {
        window.location.href = ROUTES['dashboard'];
    }

    handleSearchKeyDown(event) {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        this.handleSearch();
    }

    handleSearch() {
        this.term = this.refs.searchInput?.value?.trim() || '';

        this.filters = {
            order: '',
            quality: '',
            categoryId: '',
            subcategoryId: '',
            state: '',
            city: '',
            neighborhood: ''
        };

        this.isResettingFilters = true;

        this.searchFilterPanel?.reset();

        this.isResettingFilters = false;

        this.saveSearchState();

        this.executeSearch();
    }

    handleFilterChange(filters) {
        if (this.isResettingFilters) {
            return;
        }

        this.filters = { ...filters };

        this.saveSearchState();

        this.executeSearch();
    }
    executeSearch() {
        const items = ItemService.getActiveItems();
        const results = [];
        
        for (const item of items) {
            const context = CatalogService.getSubcategoryContext(item.subcategoryId);
            const owner = UserService.getById(item.ownerId);

            if (!owner) {
                    continue;
                }
            
            const categoryName = context?.data?.category?.name || '';
            
            const subcategoryName = context?.data?.subcategory?.name || '';
            
            const score = this.calculateScore(item, categoryName, subcategoryName);
            
            if (this.term && score <= 0) {
                continue;
            }
            
            results.push({
              item,
              score,
              location: {
                neighborhood: owner.neighborhood,
                city: owner.city,
                state: owner.state,
              },
              categoryName,
              subcategoryName,
            });
        }
        
        let filteredResults = this.applyFilters(results);

        if (this.term) {
            filteredResults.sort((a, b) => b.score - a.score);
        }

        filteredResults = this.applySorting(filteredResults);

        this.renderResults(filteredResults);
    }

    calculateScore(item, categoryName, subcategoryName) {
        if (!this.term) {
            return 1;
        }

        const searchTerm = this.normalizeText(this.term);

        let score = 0;

        const title = this.normalizeText(item.title);

        const description = this.normalizeText(item.description);

        const category = this.normalizeText(categoryName);

        const subcategory = this.normalizeText(subcategoryName);

        if (title.includes(searchTerm)) {
            score += 4;
        }

        if (category.includes(searchTerm)) {
            score += 3;
        }

        if (subcategory.includes(searchTerm)) {
            score += 2;
        }

        if (description.includes(searchTerm)) {
            score += 1;
        }

        return score;
    }

    normalizeText(value) {
        return String(value ?? '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    applyFilters(items) {
         if (!Array.isArray(items)) return [];

        return items.filter(entry => {
            const location = entry.location || {};

            if (this.filters.quality && entry.item.quality !== this.filters.quality) {
                return false;
            }

            if (this.filters.categoryId && entry.item.categoryId !== this.filters.categoryId) {
                return false;
            }

            if (this.filters.subcategoryId && entry.item.subcategoryId !== this.filters.subcategoryId) {
                return false;
            }

            if (this.filters.state && location.state !== this.filters.state) {
                return false;
            }

            if (this.filters.city && location.city !== this.filters.city) {
                return false;
            }

            if (this.filters.neighborhood && location.neighborhood !== this.filters.neighborhood) {
                return false;
            }

            return true;
        });
    }

    applySorting(items) {
        const results = [...items];

        switch (this.filters.order) {
            case 'recent':
                results.sort(
                    (a, b) => new Date(b.item.createdAt) - new Date(a.item.createdAt));
                break;

            case 'oldest':
                results.sort((a, b) => new Date(a.item.createdAt) - new Date(b.item.createdAt));
                break;

            case 'price-asc':
                results.sort((a, b) => Number(a.item.price) - Number(b.item.price));
                break;

            case 'price-desc':
                results.sort((a, b) => Number(b.item.price) - Number(a.item.price));
                break;
        }
        return results;
    }
    /**
 * Renders search results.
 *
 * @param {Object[]} items
 */
    renderResults(items) {
        if (!this.refs.resultsContainer) {
            return;
        }
        const data = items.map((entry) => ({
            item: entry.item,
            location: entry.location,
            category: entry.categoryName,
            subcategory: entry.subcategoryName
        })) || [];

        if (!this.itemGrid) {
            this.itemGrid = new ItemGrid({
              data,
              onItemClick: (item) => {
                this.handleItemClick(item);
              },
              customFallbackMessage: {
                icon: "bi-search",
                title: "Nenhum anúncio encontrado",
                description:
                  "Tente alterar os filtros ou pesquisar outro termo.",
              },
            });

            this.refs.resultsContainer.replaceChildren();

            this.itemGrid.mount(this.refs.resultsContainer);

            return;
        }

        this.itemGrid.setItems(data);
    }

    /**
     * Handles item click.
     *
     * @param {Object} item
     */
    handleItemClick(item) {
        NavStorage.set('describe-item-page', { itemId: item.id });
        this.destroy();
        window.location.href = ROUTES['describe-item'];
    }
   
    /**
     * Mounts filter panel.
     */
    renderFilterPanel() {
        if (!this.filterContainer) {
            return;
        }

        this.searchFilterPanel = new SearchFilterPanel({
            filters: this.filters,
            onChange: (filters) => {
                if (this.isResettingFilters) { return; }
                this.filters = { ...filters };

                this.saveSearchState();
                this.executeSearch();
            }
        });

        this.searchFilterPanel.mount(
            this.filterContainer
        );
    }

    /**
     * Registers page events.
     */
    bindEvents() {
        this.addListener(this.refs.backButton, 'click', this.handleBackClick);
        this.addListener(this.refs.searchButton, 'click', this.handleSearchClick);
        this.addListener(this.refs.searchInput, 'keydown', this.handleSearchKeydown);
    }

    /**
     * Removes page events.
     */
    unbindEvents() {
        this.removeListener(this.refs.backButton, 'click', this.handleBackClick);
        this.removeListener(this.refs.searchButton, 'click', this.handleSearchClick);
        this.removeListener(this.refs.searchInput, 'keydown', this.handleSearchKeydown);
    }

    /**
     * Registers an event listener.
     *
     * @param {HTMLElement|Document|Window} element
     * @param {string} eventName
     * @param {Function} handler
     */
    addListener(element, eventName, handler) {
        Events.on(element, eventName, handler);

        this.listeners.push({
            element,
            eventName,
            handler
        });
    }

    /**
     * Removes a registered listener.
     *
     * @param {HTMLElement|Document|Window} element
     * @param {string} eventName
     * @param {Function} handler
     */
    removeListener(element, eventName, handler) {
        Events.off(element, eventName, handler);

        this.listeners = this.listeners.filter(
            listener =>
                !(
                    listener.element === element &&
                    listener.eventName === eventName &&
                    listener.handler === handler
                )
        );
    }

    /**
     * Handles back navigation.
     */
    handleBackClick() {
        this.destroy();
        window.location.href = ROUTES['dashboard'];
    }

    /**
     * Handles search button click.
     */
    handleSearchClick() {
        this.handleSearch(this.refs.searchInput.value);
    }

    /**
     * Handles Enter/Search key.
     *
     * @param {KeyboardEvent} event
     */
    handleSearchKeydown(event) {
        if (event.key !== 'Enter') {
            return;
        }
        event.preventDefault();

        this.handleSearch(this.refs.searchInput.value);
    }

    /**
     * Releases resources.
     */
    destroy() {
        this.unbindEvents();

        if (this.searchFilterPanel) {
            this.searchFilterPanel.destroy();
            this.searchFilterPanel = null;
        }

        if (this.itemGrid) {
            this.itemGrid.destroy();
            this.itemGrid = null;
        }

        this.alertRender = null;

        this.refs.headerContainer.textContent = "";

        Object.keys(this.refs).forEach(key => {
            this.refs[key] = null;
        });
    }
}

window.addEventListener("DOMContentLoaded", () => new SearchPage());

// I implemented a lifecycle invalidation for the BFCache (Back-Forward Cache)
// feature of mobile browsers, ensuring data reactivity in history rollback events.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload(); 
    }
});