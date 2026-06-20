import { BaseComponent } from '../base/base-component.js';
import { CatalogService } from '../../services/catalog-service.js';
import { LocationService } from '../../services/location-service.js';
import { AlertRender } from '../ui/alert-render.js';

 /**
     * @typedef {Object} CatalogFilters
     * @property {string} order - The sorting order criteria (e.g., 'asc', 'desc', 'recent').
     * @property {string} quality - The required item quality tier filter identifier.
     * @property {string} categoryId - The unique identifier of the main catalog category.
     * @property {string} subcategoryId - The unique identifier of the nested catalog subcategory.
     * @property {string} state - The geographical state abbreviation or description.
     * @property {string} city - The name of the city filter target.
     * @property {string} neighborhood - The neighborhood boundary parameter.
     */

export class SearchFilterPanel extends BaseComponent {
    

    /**
     * Creates an instance of the component and initializes the default filter state.
     *
     * @param {Object} [options={}] - Configuration options for the component.
     * @param {Partial<CatalogFilters>} [options.filters={}] - Initial filter overrides to merge with defaults.
     * @param {Function|null} [options.onChange=null] - State mutation listener triggered when filters change.
     */
    constructor({filters = {},onChange = null} = {}) {
        super();

        this.filters = {
            order: '',
            quality: '',
            categoryId: '',
            subcategoryId: '',
            state: '',
            city: '',
            neighborhood: '',
            ...filters
        };

        this.onChange = onChange;

        this.categories = [];
        this.subcategories = [];

        this.locations = { states: [] };

        this.alertRender = new AlertRender('#alert-container');

        this.refs = {
            order: null,
            quality: null,
            category: null,
            subcategory: null,
            state: null,
            city: null,
            neighborhood: null,
            resetButton: null
        };

        this.handleOrderChange = this.handleOrderChange.bind(this);
        this.handleQualityChange = this.handleQualityChange.bind(this);
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.handleSubcategoryChange = this.handleSubcategoryChange.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleCityChange = this.handleCityChange.bind(this);
        this.handleNeighborhoodChange = this.handleNeighborhoodChange.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    render() {
        return `
            <div class="accordion w-100 d-block border border-1 aq-shadow-sm aq-slide-up rounded" data-ref="accordion">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button w-100" type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#search-filter-panel-content"
                            aria-expanded="true">
                            <i class="bi bi-funnel me-2"></i>
                            Filtros e Ordenação
                        </button>
                    </h2>
                    <div id="search-filter-panel-content"
                        class="accordion-collapse collapse show">
                        <div class="accordion-body">
                            <div class="row g-3">
                                <div class="col-6 col-md-4 col-lg">
                                    <label class="form-label">Ordenação</label>
                                    <select class="form-select rounded-pill" data-ref="order">
                                        <option value="">Selecione</option>                                       
                                        <option value="recent">Mais recentes</option>
                                        <option value="oldest">Mais antigos</option>
                                        <option value="price-asc">Menor preço</option>
                                        <option value="price-desc">Maior preço</option>
                                    </select>
                                </div>
                                <div class="col-6 col-md-4 col-lg">
                                    <label class="form-label">Grau</label>
                                    <select class="form-select rounded-pill" data-ref="quality">
                                        <option value="">Selecione</option>
                                        <option value="grau-1">Defeituoso</option>
                                        <option value="grau-2">Funcional com Problemas</option>
                                        <option value="grau-3">Problemas Estéticos</option>
                                        <option value="grau-4">Funcional</option>
                                    </select>
                                </div>
                                <div class="col-6 col-md-4 col-lg">
                                    <label class="form-label">Categoria</label>
                                    <select class="form-select rounded-pill" data-ref="category">
                                        <option value="">
                                            Selecione
                                        </option>
                                    </select>
                                </div>
                                <div class="col-6 col-md-4 col-lg">
                                    <label class="form-label">Subcategoria</label>
                                    <select class="form-select rounded-pill" data-ref="subcategory" disabled>
                                        <option value="">
                                            Selecione
                                        </option>
                                    </select>
                                </div>
                                <div class="col-6 col-md-4 col-lg">
                                    <label class="form-label">Estado</label>
                                    <select class="form-select rounded-pill" data-ref="state">
                                        <option value="">
                                            Selecione
                                        </option>
                                    </select>
                                </div>

                                <div class="col-6 col-md-4 col-lg">
                                    <label class="form-label">
                                        Cidade
                                    </label>

                                    <select
                                        class="form-select rounded-pill"
                                        data-ref="city"
                                        disabled
                                    >
                                        <option value="">
                                            Selecione
                                        </option>
                                    </select>
                                </div>

                                <div class="col-12 col-md-4 col-lg">
                                    <label class="form-label">
                                        Bairro
                                    </label>

                                    <select
                                        class="form-select rounded-pill"
                                        data-ref="neighborhood"
                                        disabled
                                    >
                                        <option value="">
                                            Selecione
                                        </option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <button type="button" class="btn aq-btn-secondary" data-ref="reset-button">
                                        <i class="bi bi-arrow-counterclockwise me-2"></i>
                                        Limpar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `.trim();
    }

    afterMount() {
        this.registerRefs();
        this.loadCatalog();
        this.loadLocations();
        this.restoreFilters();
        this.updateSubcategories();
        this.updateCities();
        this.updateNeighborhoods();
        this.bindEvents();
    }

    registerRefs() {
        Object.keys(this.refs).forEach(key => {
            const selector =
                key === 'resetButton'
                    ? '[data-ref="reset-button"]'
                    : `[data-ref="${key}"]`;

            this.refs[key] = this.element.querySelector(selector);
        });
    }

    loadCatalog() {
        const result = CatalogService.getAllCatalog();

        if (result.error) {
            this.disableCatalogFilters();
            this.alertRender.danger('Erro ao carregar categorias.');

            return;
        }

        this.categories = result.data?.categories ?? [];

        this.subcategories = result.data?.subcategories ?? [];

        this.populateCategories();
    }

    loadLocations() {
        const locations = LocationService.getAllLocations();

        if (
            !locations ||
            !Array.isArray(locations.states) ||
            locations.states.length === 0
        ) {
            this.disableLocationFilters();
            this.alertRender.danger('Erro ao carregar localizações.');
            return;
        }

        this.locations = locations;
        this.populateStates();
    }
    populateCategories() {
        const categorySelect = this.refs.category;

        if (!categorySelect) {
            return;
        }

        const fragment = document.createDocumentFragment();
        const defaultOption = document.createElement('option');

        defaultOption.value = '';
        defaultOption.textContent = 'Selecione';

        fragment.appendChild(defaultOption);

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            fragment.appendChild(option);
        });
        categorySelect.replaceChildren(fragment);
    }

    populateStates() {
        const stateSelect = this.refs.state;

        if (!stateSelect) {
            return;
        }
        const fragment = document.createDocumentFragment();
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione';
        fragment.appendChild(defaultOption);
        this.locations.states.forEach(state => {
            const option = document.createElement('option');
            option.value = state.name;
            option.textContent = state.name;
            fragment.appendChild(option);
        });
        stateSelect.replaceChildren(fragment);
    }

    updateSubcategories() {
        const select = this.refs.subcategory;
        if (!select) {
            return;
        }
        const fragment = document.createDocumentFragment();
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione';
        fragment.appendChild(defaultOption);

        const categoryId = this.filters.categoryId;

        if (!categoryId) {
            select.disabled = true;
            select.replaceChildren(fragment);
            return;
        }

        const subcategories = this.subcategories.filter(
            subcategory => subcategory.categoryId === categoryId
        );

        subcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.id;
            option.textContent = subcategory.name;
            fragment.appendChild(option);
        });

        select.disabled = false;
        select.replaceChildren(fragment);
        select.value = this.filters.subcategoryId || '';
    }

    updateCities() {
        const citySelect = this.refs.city;

        if (!citySelect) {
            return;
        }
        const fragment = document.createDocumentFragment();
        const defaultOption = document.createElement('option');

        defaultOption.value = '';
        defaultOption.textContent = 'Selecione';

        fragment.appendChild(defaultOption);

        if (!this.filters.state) {
            citySelect.disabled = true;
            citySelect.replaceChildren(fragment);
            return;
        }

        const state = this.locations.states.find(
            currentState => currentState.name === this.filters.state
        );

        if (!state) {
            citySelect.disabled = true;
            citySelect.replaceChildren(fragment);
            return;
        }

        state.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.name;
            option.textContent = city.name;
            fragment.appendChild(option);
        });

        citySelect.disabled = false;

        citySelect.replaceChildren(fragment);

        citySelect.value = this.filters.city || '';
    }

    updateNeighborhoods() {
        const neighborhoodSelect = this.refs.neighborhood;

        if (!neighborhoodSelect) {
            return;
        }

        const fragment = document.createDocumentFragment();

        const defaultOption = document.createElement('option');

        defaultOption.value = '';
        defaultOption.textContent = 'Selecione';

        fragment.appendChild(defaultOption);

        if (!this.filters.state || !this.filters.city) {
            neighborhoodSelect.disabled = true;
            neighborhoodSelect.replaceChildren(fragment);
            return;
        }

        const state = this.locations.states.find(
            currentState => currentState.name === this.filters.state
        );

        const city = state?.cities.find(
            currentCity => currentCity.name === this.filters.city
        );

        if (!city) {
            neighborhoodSelect.disabled = true;
            neighborhoodSelect.replaceChildren(fragment);
            return;
        }

        city.neighborhoods.forEach(
            neighborhood => {
                const option = document.createElement('option');
                option.value = neighborhood;
                option.textContent = neighborhood;
                fragment.appendChild(option);
            }
        );

        neighborhoodSelect.disabled = false;

        neighborhoodSelect.replaceChildren(fragment);

        neighborhoodSelect.value = this.filters.neighborhood || '';
    }

    restoreFilters() {
        if (this.refs.order) {
            this.refs.order.value = this.filters.order;
        }

        if (this.refs.quality) {
            this.refs.quality.value = this.filters.quality;
        }

        if (this.refs.category) {
            this.refs.category.value = this.filters.categoryId;
        }

        if (this.refs.subcategory) {
            this.refs.subcategory.value = this.filters.subcategoryId;
        }

        if (this.refs.state) {
            this.refs.state.value = this.filters.state;
        }

        if (this.refs.city) {
            this.refs.city.value = this.filters.city;
        }

        if (this.refs.neighborhood) {
            this.refs.neighborhood.value = this.filters.neighborhood;
        }
    }

    notifyChange() {
        if (typeof this.onChange !== 'function') {
            return;
        }

        this.onChange({
            order: this.filters.order,
            quality: this.filters.quality,
            categoryId: this.filters.categoryId,
            subcategoryId: this.filters.subcategoryId,
            state: this.filters.state,
            city: this.filters.city,
            neighborhood: this.filters.neighborhood
        });
    }

    reset() {
        this.filters = {
            order: '',
            quality: '',
            categoryId: '',
            subcategoryId: '',
            state: '',
            city: '',
            neighborhood: ''
        };

        this.restoreFilters();

        this.updateSubcategories();
        this.updateCities();
        this.updateNeighborhoods();

        this.notifyChange();
    }

    disableCatalogFilters() {
        this.refs.category?.setAttribute('disabled', 'disabled');

        this.refs.subcategory?.setAttribute('disabled', 'disabled');
    }

    disableLocationFilters() {
        this.refs.state?.setAttribute('disabled', 'disabled');

        this.refs.city?.setAttribute('disabled', 'disabled');

        this.refs.neighborhood?.setAttribute('disabled', 'disabled');
    }

    bindEvents() {
        this.addListener(this.refs.order, 'change', this.handleOrderChange);
        this.addListener(this.refs.quality, 'change', this.handleQualityChange);
        this.addListener(this.refs.category, 'change', this.handleCategoryChange);
        this.addListener(this.refs.subcategory, 'change', this.handleSubcategoryChange);
        this.addListener(this.refs.state, 'change', this.handleStateChange);
        this.addListener(this.refs.city, 'change', this.handleCityChange);
        this.addListener(this.refs.neighborhood, 'change', this.handleNeighborhoodChange);
        this.addListener(this.refs.resetButton, 'click', this.handleReset);
    }

    handleOrderChange(event) {
        this.filters.order = event.target.value;

        this.notifyChange();
    }

    handleQualityChange(event) {
        this.filters.quality = event.target.value;

        this.notifyChange();
    }

    handleCategoryChange(event) {
        this.filters.categoryId =
            event.target.value;

        this.filters.subcategoryId = '';

        this.updateSubcategories();

        this.notifyChange();
    }

    handleSubcategoryChange(event) {
        this.filters.subcategoryId = event.target.value;

        this.notifyChange();
    }

    handleStateChange(event) {
        this.filters.state = event.target.value;

        this.filters.city = '';
        this.filters.neighborhood = '';

        this.updateCities();
        this.updateNeighborhoods();

        this.notifyChange();
    }

    handleCityChange(event) {
        this.filters.city =
            event.target.value;

        this.filters.neighborhood = '';

        this.updateNeighborhoods();

        this.notifyChange();
    }

    handleNeighborhoodChange(event) {
        this.filters.neighborhood = event.target.value;

        this.notifyChange();
    }

    handleReset() {
        this.reset();
    }

    destroy() {
        this.categories = [];

        this.subcategories = [];

        this.locations = { states: [] };

        this.filters = {
            order: '',
            quality: '',
            categoryId: '',
            subcategoryId: '',
            state: '',
            city: '',
            neighborhood: ''
        };

        this.onChange = null;

        this.alertRender = null;

        Object.keys(this.refs).forEach(
            key => { this.refs[key] = null; }
        );

        super.destroy();
    }
}