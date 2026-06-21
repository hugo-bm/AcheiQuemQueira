import { BaseComponent } from './base-component.js';

/**
 * Base form component.
 */
export class BaseFormComponent extends BaseComponent {
  /**
   * Creates a form component.
   */
  constructor() {
    super();

    /**
     * Main form element.
     *
     * @type {HTMLFormElement|null}
     */
    this.form = null;
  }

  /**
   * Mounts the component.
   *
   * @param {HTMLElement} container
   * @returns {BaseFormComponent}
   */
  mount(container) {
    super.mount(container);

    this.form = this.element?.querySelector('form') || null;

    return this;
  }

  /**
   * Returns form data.
   *
   * @returns {Object}
   */
  getFormData() {
    if (!this.form) {
      return {};
    }

    const formData = new FormData(this.form);

    return Object.fromEntries(formData.entries());
  }

  /**
   * Fills form fields.
   *
   * @param {Object} data
   */
  setFormData(data = {}) {
    if (!this.form) {
      return;
    }

    Object.entries(data).forEach(([name, value]) => {
      const field = this.form.elements[name];
      if (!field) return;

      // It handles native collections (such as RadioNodeList for multiple Radios/Checkboxes)
      if (field instanceof RadioNodeList || field.length !== undefined && !field.tagName) {
        const fieldArray = Array.from(field);
        fieldArray.forEach(input => {
          if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = input.value === String(value);
          } else {
            input.value = value ?? '';
          }
        });
      } else if (field.type === 'checkbox') {
        field.checked = Boolean(value);
      } else {
        field.value = value ?? '';
      }
    });
  }

  /**
   * Resets form.
   */
  resetForm() {
    this.form?.reset();
    this.clearErrors();
  }

  /**
   * Displays field error.
   *
   * @param {string} fieldName
   * @param {string} message
   */
  showFieldError(fieldName, message) {
    if (!this.form) {
      return;
    }

    const field = this.form.elements[fieldName];

    if (!field) {
      return;
    }

    field.classList.add('is-invalid');

    // Identifies whether the input is enclosed within a Bootstrap structure (.input-group)
    const targetParent = field.closest('.input-group') || field.parentElement;
    let feedback = targetParent?.querySelector('.invalid-feedback');

    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      
      // If it's an input-group, inject it at the end of the container to maintain Bootstrap alignment
      if (field.closest('.input-group')) {
        targetParent.appendChild(feedback);
      } else {
        field.insertAdjacentElement('afterend', feedback);
      }
    }

    feedback.textContent = message;
  }

  /**
   * Clears a field error.
   *
   * @param {string} fieldName
   */
  clearFieldError(fieldName) {
    if (!this.form) {
      return;
    }

    const field = this.form.elements[fieldName];

    if (!field) {
      return;
    }

    field.classList.remove('is-invalid');

    // Seek feedback by considering the expanded scope of the nearest container
    const targetParent = field.closest('.input-group') || field.parentElement;
    const feedback = targetParent?.querySelector('.invalid-feedback');

    feedback?.remove();
  }

  /**
   * Clears all form errors.
   */
  clearErrors() {
    if (!this.form) {
      return;
    }

    this.form
      .querySelectorAll('.is-invalid')
      .forEach(element =>
        element.classList.remove('is-invalid')
      );

    this.form
      .querySelectorAll('.invalid-feedback')
      .forEach(element => element.remove());
  }
}