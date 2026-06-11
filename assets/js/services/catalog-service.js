import { AQQStorage } from '../core/aqq-storage.js'; // Ajuste o caminho se necessário

/**
 * @typedef {Object} Category
 * @property {string} id - Unique identifier for the category.
 * @property {string} name - Display name of the category.
 * @property {string} icon - Bootstrap icon class name.
 */

/**
 * @typedef {Object} Subcategory
 * @property {string} id - Unique identifier for the subcategory.
 * @property {string} categoryId - Foreign key linking to the parent category.
 * @property {string} name - Display name of the subcategory.
 */

/**
 * @typedef {Object} CatalogStructure
 * @property {Category[]} categories - Collection of available categories.
 * @property {Subcategory[]} subcategories - Collection of available subcategories.
 */

/**
 * @typedef {Object} CategoryWithSubcategories
 * @property {Category} category - The main category information.
 * @property {Subcategory[]} subcategories - Array of subcategories belonging to this category.
 */

/**
 * @typedef {Object} SubcategoryContext
 * @property {Category} category - The parent category information.
 * @property {Subcategory} subcategory - The requested subcategory details.
 */

/**
 * @typedef {Object} ServiceResponse
 * @property {Object|null} data - The payload returned by the operation.
 * @property {Error|null} error - The captured exception or null on success.
 */

/**
 * CatalogService.
 *
 * High-performance static utility service for retrieving and querying
 * catalog category and subcategory structures from local persistence.
 */
export class CatalogService {
  /**
   * Retrieves the entire data structure of categories and subcategories.
   *
   * @returns {ServiceResponse} Standardized payload or empty arrays fallback.
   */
  static getAllCatalog() {
    try {
      const rawData = AQQStorage.get('catalog');

      if (!rawData || !Array.isArray(rawData.categories) || !Array.isArray(rawData.subcategories)) {
        return {
          data: { categories: [], subcategories: [] },
          error: null
        };
      }

      return { data: rawData, error: null };
    } catch (error) {
      return {
        data: { categories: [], subcategories: [] },
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Retrieves a category and all its nested subcategories by matching the category ID.
   *
   * @param {string} categoryId - The unique identifier of the main category.
   * @returns {ServiceResponse} Standardized payload containing CategoryWithSubcategories or null.
   */
  static getCategoryWithSubcategories(categoryId) {
    try {
      if (!categoryId) {
        return { data: null, error: new Error('Category ID is required.') };
      }

      const { data: catalog } = this.getAllCatalog();
      
      const category = catalog.categories.find(cat => cat && cat.id === categoryId);
      
      if (!category) {
        return { data: null, error: null };
      }

      // Performance mobile-first: filtra subcategorias em um laço único linear
      const subcategories = catalog.subcategories.filter(sub => sub && sub.categoryId === categoryId);

      return {
        data: { category, subcategories },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Retrieves the specific subcategory information alongside its parent category data 
   * using exclusively the subcategory identifier.
   *
   * @param {string} subcategoryId - The unique identifier of the target subcategory.
   * @returns {ServiceResponse} Standardized payload containing SubcategoryContext or null.
   */
  static getSubcategoryContext(subcategoryId) {
    try {
      if (!subcategoryId) {
        return { data: null, error: new Error('Subcategory ID is required.') };
      }

      const { data: catalog } = this.getAllCatalog();

      const subcategory = catalog.subcategories.find(sub => sub && sub.id === subcategoryId);

      if (!subcategory) {
        return { data: null, error: null };
      }

      // Localiza o nó pai imediato através do id indexado
      const category = catalog.categories.find(cat => cat && cat.id === subcategory.categoryId);

      if (!category) {
        return { data: null, error: null };
      }

      return {
        data: { category, subcategory },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
}