import { BaseComponent } from './base-component.js';

/**
 * Base component for Bootstrap cards.
 *
 * Acts as the foundation for all card-based components
 * in the application.
 *
 * Future examples:
 *
 * - ItemCard
 * - ProposalCard
 * - ReviewCard
 * - NotificationCard
 * - ChatCard
 */
export class BaseCardComponent extends BaseComponent {
  /**
   * Creates a new card component.
   */
  constructor() {
    super();

    /**
     * Internal DOM references.
     *
     * @type {Object.<string, HTMLElement>}
     */
    this.refs = {};
  }

  /**
   * Registers a DOM reference.
   *
   * @param {string} name - Reference name.
   * @param {HTMLElement} element - DOM element.
   */
  registerRef(name, element) {
    if (!name || !element) {
      return;
    }

    this.refs[name] = element;
  }

  /**
   * Returns a previously registered reference.
   *
   * @param {string} name - Reference name.
   * @returns {HTMLElement|null}
   */
  getRef(name) {
    return this.refs[name] ?? null;
  }

  /**
   * Returns the semantic tag name used by the root element.
   *
   * Components may override this method.
   *
   * @returns {string}
   */
  getTagName() {
    return 'div';
  }

  /**
   * Returns additional attributes for the root element.
   *
   * Components may override this method.
   *
   * @returns {Object<string, string>}
   */
  getAttributes() {
    return {};
  }

  /**
   * Returns additional card classes.
   *
   * Components may override this method.
   *
   * @returns {string}
   */
  getCardClasses() {
    return '';
  }

  /**
   * Renders the card header.
   *
   * Components may override this method.
   *
   * @returns {string}
   */
  renderHeader() {
    return '';
  }

  /**
   * Renders the card body.
   *
   * Must be overridden by child components.
   *
   * @returns {string}
   */
  renderBody() {
    return '';
  }

  /**
   * Renders the card footer.
   *
   * Components may override this method.
   *
   * @returns {string}
   */
  renderFooter() {
    return '';
  }

  /**
   * Converts attribute object into HTML attributes.
   *
   * @returns {string}
   * @protected
   */
  buildAttributes() {
    const attributes = this.getAttributes();

    return Object.entries(attributes)
      .map(([key, value]) => `${key}="${String(value)}"`)
      .join(' ');
  }

  /**
   * Renders the complete card structure.
   *
   * Uses native Bootstrap card markup.
   *
   * @returns {string}
   */
  render() {
    const tagName = this.getTagName();
    const attributes = this.buildAttributes();

    const header = this.renderHeader();
    const body = this.renderBody();
    const footer = this.renderFooter();

    return `
      <${tagName}
        class="card aq-card-surface aq-shadow-sm aq-radius-md ${this.getCardClasses()}"
        ${attributes}
      >
        ${header ? `<div class="card-header">${header}</div>` : ''}

        <div class="card-body">
          ${body}
        </div>

        ${footer ? `<div class="card-footer">${footer}</div>` : ''}
      </${tagName}>
    `;
  }

  /**
   * Clears internal references before component destruction.
   */
  destroy() {
    this.refs = {};

    super.destroy();
  }
}