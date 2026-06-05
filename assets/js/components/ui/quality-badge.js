/**
 * Visual component used to represent the conservation
 * and quality level of an item.
 */
export class QualityBadge {
  /**
   * Creates a new QualityBadge instance.
   *
   * @param {Object} [options={}]
   * Optional component configuration.
   *
   * @param {number} [options.grade=4]
   * Item quality grade.
   *
   * @param {'compact'|'sm'|'md'} [options.size='sm']
   * Badge display size.
   */
  constructor(options = {}) {
    this.grade = Number(options.grade) || 4;
    this.size = options.size || 'sm';

    this.element = null;
    this.iconElement = null;
    this.labelElement = null;
    this.popover = null;
  }

  /**
   * Updates the quality grade.
   *
   * The component updates only the affected DOM elements
   * without rebuilding the entire structure.
   *
   * @param {number} grade
   * New quality grade.
   *
   * @returns {void}
   */
  setGrade(grade) {
    this.grade = Number(grade);

    if (!this.element) {
      return;
    }

    this.#updateUI();
  }

  /**
   * Updates the badge size.
   *
   * @param {'compact'|'sm'|'md'} size
   * Badge size.
   *
   * @returns {void}
   */
  setSize(size) {
    this.size = size;

    if (!this.element) {
      return;
    }

    this.#updateSize();
  }

  /**
   * Renders the badge component.
   *
   * @returns {HTMLElement}
   * Rendered badge element.
   */
  render() {
    const config = this.#getGradeConfig();

    const badge = document.createElement('span');

    badge.className = `
      badge
      d-inline-flex
      align-items-center
      gap-1
      border
      user-select-none
    `;

    badge.style.color = config.color;
    badge.style.borderColor = config.color;
    badge.style.backgroundColor = 'transparent';

    badge.setAttribute('role', 'button');
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('data-bs-toggle', 'popover');
    badge.setAttribute('data-bs-trigger', 'click focus');
    badge.setAttribute('data-bs-placement', 'top');
    badge.setAttribute('data-bs-content', config.description);

    const icon = document.createElement('i');

    icon.className = config.icon;
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('focusable', 'false');

    const label = document.createElement('span');

    label.textContent = config.label;

    badge.append(icon, label);

    this.element = badge;
    this.iconElement = icon;
    this.labelElement = label;

    this.#updateSize();
    this.#initializePopover();

    return this.element;
  }

  /**
   * Creates the Bootstrap Popover instance.
   *
   * @private
   *
   * @returns {void}
   */
  #initializePopover() {
    if (
      typeof bootstrap === 'undefined' ||
      !bootstrap.Popover ||
      !this.element
    ) {
      return;
    }

    this.popover?.dispose();

    this.popover = new bootstrap.Popover(this.element);
  }

  /**
   * Updates the badge visual state.
   *
   * @private
   *
   * @returns {void}
   */
  #updateUI() {
    const config = this.#getGradeConfig();

    this.element.style.color = config.color;
    this.element.style.borderColor = config.color;

    this.iconElement.className = config.icon;
    this.labelElement.textContent = config.label;

    this.element.setAttribute(
      'data-bs-content',
      config.description
    );

    this.#initializePopover();
  }

  /**
   * Applies size-specific classes.
   *
   * @private
   *
   * @returns {void}
   */
  #updateSize() {
    this.element.classList.remove(
      'small',
      'fs-6',
      'fs-7'
    );

    switch (this.size) {
      case 'compact':
        this.element.classList.add('small');
        break;

      case 'md':
        this.element.classList.add('fs-6');
        break;

      case 'sm':
      default:
        break;
    }
  }

  /**
   * Returns the configuration associated with
   * the current quality grade.
   *
   * @private
   *
   * @returns {Object}
   */
  #getGradeConfig() {
    const grades = {
      1: {
        label: 'Defeituoso',
        icon: 'bi bi-x-octagon-fill',
        color: 'var(--grau-1)',
        description:
          'O item possui defeitos que comprometem sua utilização.'
      },

      2: {
        label: 'Funcional com Problemas',
        icon: 'bi bi-exclamation-triangle-fill',
        color: 'var(--grau-2)',
        description:
          'O item funciona, porém apresenta defeitos ou limitações.'
      },

      3: {
        label: 'Problemas Estéticos',
        icon: 'bi bi-tools',
        color: 'var(--grau-3)',
        description:
          'O item funciona normalmente, apresentando apenas desgaste visual.'
      },

      4: {
        label: 'Funcional',
        icon: 'bi bi-check-circle-fill',
        color: 'var(--grau-4)',
        description:
          'O item funciona corretamente e está em boas condições.'
      }
    };

    return grades[this.grade] || grades[4];
  }
}