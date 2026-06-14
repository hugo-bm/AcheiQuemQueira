import { BaseCardComponent } from '../base/base-card-component.js';

/**
 * Reusable card component used to display
 * profile metrics.
 */
export class ProfileMetricCard extends BaseCardComponent {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.icon='']
   * @param {string|number} [options.value='']
   * @param {string} [options.label='']
   */
  constructor({
    icon = '',
    value = '',
    label = ''
  } = {}) {
    super();

    this.icon = icon;
    this.value = value;
    this.label = label;
  }

  /**
   * Additional card classes.
   *
   * @returns {string}
   */
  getCardClasses() {
    return 'w-100 h-100';
  }

  /**
   * Card body content.
   *
   * @returns {string}
   */
  renderBody() {
    return `
      <div class="d-flex flex-column justify-content-center align-items-center text-center gap-2">
        <i class="bi ${this.icon} fs-2 text-secondary" data-ref="icon" aria-hidden="true" focusable="false"></i>
        <div class="aq-h2 fw-semibold aq-text-logo aq-text-shadow-sm mb-0" data-ref="value">${this.value}</div>
        <div class="aq-text-soft" data-ref="label">${this.label}
        </div>
      </div>
    `;
  }

  /**
   * Registers internal references.
   */
  afterMount() {
    this.registerRef('icon', this.element?.querySelector('[data-ref="icon"]'));
    this.registerRef('value', this.element?.querySelector('[data-ref="value"]'));
    this.registerRef('label', this.element?.querySelector('[data-ref="label"]'));
  }

  /**
   * Updates metric value.
   *
   * @param {string|number} value
   */
  setValue(value) {
    this.value = value;

    const element = this.getRef('value');

    if (element) {
      element.textContent = String(value);
    }
  }

  /**
   * Updates metric label.
   *
   * @param {string} label
   */
  setLabel(label) {
    this.label = label;

    const element = this.getRef('label');

    if (element) {
      element.textContent = label;
    }
  }

  /**
   * Updates metric icon.
   *
   * @param {string} icon
   */
  setIcon(icon) {
    const element = this.getRef('icon');

    if (!element) {
      this.icon = icon;
      return;
    }

    if (this.icon) {
      element.classList.remove(this.icon);
    }

    if (icon) {
      element.classList.add(icon);
    }

    this.icon = icon;
  }

  /**
   * Cleans component resources.
   */
  destroy() {
    this.refs.map(element=> element = null);

    super.destroy();
  }
}