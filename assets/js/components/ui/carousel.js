import { BaseComponent } from "../base/base-component.js";

/**
 * Renders item images using the native Bootstrap Carousel component.
 *
 * Supported modes:
 * - card: renders only the first image
 * - details: renders a full Bootstrap Carousel when applicable
 */
export class Carousel extends BaseComponent {
  /**
   * Creates a new Carousel component instance.
   *
   * @param {Object} [options={}] Component options.
   * @param {string[]} [options.images=[]] Image paths.
   * @param {string} [options.mode='details'] Display mode.
   */
  constructor(options = {}) {
    super();

    this.images = Array.isArray(options.images) ? options.images : [];

    this.mode = options.mode || "details";

    this.carousel = null;
    this.carouselId = `carousel-${this.generateId()}`;
  }

  /**
   * Updates the image collection.
   *
   * @param {string[]} images New image collection.
   */
  setImages(images = []) {
    this.images = Array.isArray(images) ? images : [];

    this.update();
  }

  /**
   * Updates the display mode.
   *
   * Supported values:
   * - card
   * - details
   *
   * @param {string} mode Display mode.
   */
  setMode(mode) {
    this.mode = mode;
    this.update();
  }

  /**
   * Mounts the component and initializes
   * Bootstrap Carousel when necessary.
   *
   * @param {HTMLElement} container Target container.
   */
  mount(container) {
    super.mount(container);
    this.initializeCarousel();
  }

  /**
   * Updates the component content.
   */
  update() {
    if (!this.container || !this.element) {
      return;
    }

    this.disposeCarousel();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.render().trim();
    const newElement = wrapper.firstElementChild;

    if (newElement) {
      this.container.replaceChild(newElement, this.element);
      this.element = newElement;
    }

    this.initializeCarousel();
  }

  /**
   * Releases Bootstrap resources.
   */
  destroy() {
    this.disposeCarousel();
    super.destroy();
  }

  /**
   * Initializes Bootstrap Carousel only when required.
   *
   * Conditions:
   * - details mode
   * - two or more images
   */
  initializeCarousel() {
    if (this.mode !== "details" || this.images.length < 2 || !this.element) {
      return;
    }

    const carouselElement = this.element.querySelector(".carousel");

    if (!carouselElement || !window.bootstrap?.Carousel) {
      return;
    }

    this.carousel = new bootstrap.Carousel(carouselElement, {
            ride: false,
            interval: false,
            touch: true
        });
  }

  /**
   * Disposes Bootstrap Carousel instance.
   */
  disposeCarousel() {
    if (this.carousel) {
      this.carousel.dispose();
      this.carousel = null;
    }
  }

  /**
   * Renders the component.
   *
   * @returns {string} Component HTML.
   */
  render() {
    if (!this.images.length) {
      return this.renderEmptyState();
    }

    if (this.mode === "card") {
      return this.renderSingleImage(this.images[0]);
    }

    if (this.images.length === 1) {
      return this.renderSingleImage(this.images[0]);
    }

    return this.renderCarousel();
  }

  /**
   * Renders the empty image state.
   *
   * @returns {string} HTML markup.
   */
  renderEmptyState() {
    return `
            <div class="d-flex flex-column align-items-center justify-content-center text-center p-4 border rounded h-100">
                <i class="bi bi-image fs-1 text-secondary"
                    aria-hidden="true"></i>
                <span class="mt-2 text-muted">Imagem não disponível</span>
            </div>
        `.trim();
  }

  /**
   * Renders a single image.
   *
   * @param {string} image Image path.
   * @returns {string} HTML markup.
   */
  renderSingleImage(image) {
    return `
            <div class="overflow-hidden rounded bg-light d-flex align-items-center justify-content-center"
            style="aspect-ratio: 4 / 3;">
                <img src="${image}"
                    alt="Item image"
                    class="img-fluid w-100"
                    loading="lazy" style="object-fit: contain; max-height: 240px; max-width: 240px;">
            </div>
        `.trim();
  }

  /**
   * Renders a complete Bootstrap Carousel.
   *
   * @returns {string} HTML markup.
   */
  renderCarousel() {
    return `
            <div id="${this.carouselId}"
                class="carousel slide"
                data-bs-ride="false">
                ${this.renderIndicators()}
                <div class="carousel-inner">
                    ${this.renderSlides()}
                </div>
                ${this.renderControls()}
            </div>
        `.trim();
  }

  /**
   * Renders carousel indicators.
   *
   * @returns {string} HTML markup.
   */
  renderIndicators() {
    return `
            <div class="carousel-indicators">
                ${this.images
                  .map(
                    (_, index) => `
                            <button
                                type="button"
                                data-bs-target="#${this.carouselId}"
                                data-bs-slide-to="${index}"
                                class="${index === 0 ? "active" : ""}"
                                aria-current="${index === 0}"
                                aria-label="Slide ${index + 1}"
                            ></button>
                        `,
                  )
                  .join("")}
            </div>
        `.trim();
  }

  /**
   * Renders carousel slides.
   *
   * @returns {string} HTML markup.
   */
  renderSlides() {
    return this.images
      .map(
        (image, index) => `
                    <div class="carousel-item ${index === 0 ? "active" : ""}">
                      <div class="d-flex align-items-center justify-content-center bg-light w-100" 
                             style="aspect-ratio: 4 / 3;">
                        <img src="${image}"
                            alt="Item image ${index + 1}" class="d-block w-100" loading="lazy"
                            style="object-fit: contain; max-height: 100%; max-width: 100%;">
                      </div>
                    </div>`.trim(),
      ).join("");
  }

  /**
   * Renders previous and next controls.
   *
   * @returns {string} HTML markup.
   */
  renderControls() {
    return `
            <button class="carousel-control-prev"
                type="button"
                data-bs-target="#${this.carouselId}"
                data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true" ></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next"
                type="button"
                data-bs-target="#${this.carouselId}"
                data-bs-slide="next">
                <span class="carousel-control-next-icon"
                    aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        `.trim();
  }

  /**
   * Generates a unique identifier.
   *
   * @returns {string} Unique identifier.
   */
  generateId() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`; // fallback
  }
}
