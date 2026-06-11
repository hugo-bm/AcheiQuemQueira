import { BaseCardComponent } from '../base/base-card-component.js';
import { Carousel } from '../ui/carousel.js';
import { QualityBadge } from '../ui/quality-badge.js';
import { Events } from "../../core/events.js"
import "../../models/entities.js"


export class ItemCard extends BaseCardComponent {
    /**
   * Creates a new ItemCard instance.
   * @param {Object} [options={}]
   * Optional component configuration.
   * @param {Item} options.item
   * Item instânce.
   * @param {string} options.category
   * Category Title
   * @param {string} options.subcategory
   * Subcategory Title
   * 
   * @param {Object} options.location
   *  Owner location {neighborhood, city, state}
   *
   * @param {'Funcional'|'null'} [options.onClick=null]
   * Fucntion callback for click even.
   */
    constructor({
        item,
        category,
        subcategory,
        location,
        onClick = null
    }) {
        super();

        this.item = item;
        this.onClick = onClick;
        this.categoryTitle = category;
        this.subcategoryTitle = subcategory;
        this.location = location;

        this.carousel = null;
        this.qualityBadge = null;

        this.handleClick = this.handleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    getCardClasses() {
        return ` h-100 cursor-pointer `;
    }

    getAttributes() {
        return {
            role: 'button',
            tabindex: '0',
            'aria-label': this.item.title
        };
    }

    renderBody() {
        return `<div class="d-flex flex-column gap-2">
                <div data-ref="carousel"></div>
                <div class="d-flex aq-text-soft justify-content-between">
                    <div class="ms-2" data-ref="timer">${this.getExpirationLabel()}</div>
                    <div class="me-2" data-ref="badge"></div>
                </div>
                <div class="d-flex flex-column gap-1" >
                    <h3 class="h5 mb-0 text-truncate"
                        data-ref="title"
                    >${this.item.title}</h3>
                    <span class="small text-muted"
                        data-ref="location"
                    >${this.formatLocation()}</span>
                    <div class="d-inline">
                    <span  class="small text-secondary " data-ref="category">${this.categoryTitle}</span>
                    <span class="small aq-text-light ms-2" data-ref="subcategory">${this.subcategoryTitle}</span>
                    </div> 
                    <strong class="fs-5 text-primary"
                        data-ref="price"
                    >${this.formatPrice(this.item.price)}</strong>
                </div>
            </div>`.trim();
    }

    afterMount() {
        this.registerElements();

        this.mountCarousel();

        this.mountBadge();


        Events.on(this.element, 'click', this.handleClick);
        Events.on(this.element, 'keydown', this.handleKeyDown);

    }

    registerElements() {
        this.titleElement =
            this.element.querySelector(
                '[data-ref="title"]'
            );

        this.categoryElement =
            this.element.querySelector(
                '[data-ref="category"]'
            );

        this.subcategoryElement =
            this.element.querySelector(
                '[data-ref="subcategory"]'
            );

        this.locationElement =
            this.element.querySelector(
                '[data-ref="location"]'
            );

        this.priceElement =
            this.element.querySelector(
                '[data-ref="price"]'
            );

        this.carouselContainer =
            this.element.querySelector(
                '[data-ref="carousel"]'
            );

        this.badgeContainer =
            this.element.querySelector(
                '[data-ref="badge"]'
            );
    }

    mountCarousel() {
        this.carousel = new Carousel({
            images: this.item.images,
            mode: 'card'
        });

        this.carousel.mount(
            this.carouselContainer
        );
    }

    mountBadge() {
        this.qualityBadge =
            new QualityBadge({
                grade: Number(this.item.quality.slice(-1)),
                size: 'compact'
            });

        const badgeElement =
            this.qualityBadge.render();

        this.badgeContainer.appendChild(
            badgeElement
        );
    }

    handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleClick();
        }
    }

    handleClick() {
        if (typeof this.onClick === 'function') {
            this.onClick(this.item);
        }
    }

    formatLocation() {

        return [
            this.location.neighborhood,
            this.location.city,
            this.location.state
        ].filter(Boolean).join(' • ');
    }

    formatPrice(value) {
        const number =
            Number(value.replace(',', '.')) || 0;

        return new Intl.NumberFormat(
            'pt-BR',
            {
                style: 'currency',
                currency: 'BRL'
            }
        ).format(number);
    }

    /**
     * Calculates the remaining days and returns the localized expiration label.
     *
     * @returns {string}
     * @private
     */
    getExpirationLabel() {
        if (!this.item?.expiresAt) {
            return '';
        }

        // Define o início do dia atual (00:00:00) para evitar quebras por diferença de horas
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expirationDate = new Date(this.item.expiresAt);
        expirationDate.setHours(0, 0, 0, 0);

        // Calcula a diferença em milissegundos
        const differenceInMs = expirationDate.getTime() - today.getTime();
        
        // Converte milissegundos em dias (1 dia = 24h * 60m * 60s * 1000ms)
        // Somamos 1 para garantir que a contagem inclua o dia atual de forma inclusiva
        const remainingDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1;

        // Trata os cenários de expiração passados por segurança
        if (remainingDays <= 0) {
            return 'Expirado';
        }

        // Regra 1: Faltando exatamente 1 dia
        if (remainingDays === 1) {
            return 'Último dia';
        }

        // Regra 2: Faltando exatamente 2 dias
        if (remainingDays === 2) {
            return 'Expira amanhã';
        }

        // Regra 3: Menos de 7 dias (Mostra o número de dias puro)
        if (remainingDays < 7) {
            return `${remainingDays} dias`;
        }

        // Regra 4: Mais de 7 dias (Converte e exibe em semanas cheias)
        const remainingWeeks = Math.floor(remainingDays / 7);
        const labelSemana = remainingWeeks === 1 ? 'semana' : 'semanas';
        return `${remainingWeeks} ${labelSemana}`;
    }

    setTitle(value) {
        this.item.title = value;

        if (this.titleElement) {
            this.titleElement.textContent =
                value;
        }

        this.element?.setAttribute(
            'aria-label',
            value
        );
    }

    setPrice(value) {
        this.item.basePrice = value;

        if (this.priceElement) {
            this.priceElement.textContent =
                this.formatPrice(value);
        }
    }

    setLocation({
        neighborhood,
        city,
        state
    }) {
        this.item.neighborhood =
            neighborhood;

        this.item.city =
            city;

        this.item.state =
            state;

        if (this.locationElement) {
            this.locationElement.textContent =
                this.formatLocation();
        }
    }

    updateItem(item) {
        this.item = item;

        this.setTitle(item.title);

        this.categoryElement.textContent =
            item.category;

        this.subcategoryElement.textContent =
            item.subcategory;

        this.setLocation({
            neighborhood:
                item.neighborhood,
            city:
                item.city,
            state:
                item.state
        });

        this.setPrice(
            item.basePrice
        );

        if (this.qualityBadge) {
            this.qualityBadge.setGrade(
                item.quality
            );
        }

        if (this.carousel) {
            this.carousel.setImages(
                item.images
            );
        }
    }

    destroy() {
        this.carousel?.destroy();

        if (
            this.qualityBadge?.popover
        ) {
            this.qualityBadge.popover.dispose();
        }

        this.carousel = null;
        this.qualityBadge = null;

        this.titleElement = null;
        this.categoryElement = null;
        this.subcategoryElement = null;
        this.locationElement = null;
        this.priceElement = null;
        this.carouselContainer = null;
        this.badgeContainer = null;

        Events.off(this.element, 'click', this.handleClick);
        Events.off(this.element, 'keydown', this.handleKeyDown);

        super.destroy();
    }
}