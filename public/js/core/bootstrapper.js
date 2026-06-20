import { AQQStorage } from './aqq-storage.js';

/**
 * Performs the initial application bootstrap process.
 */
export class Bootstrapper {
  /**
   * Verifies whether the application seed has already been installed.
   * If not, installs the initial seed data.
   *
   * @returns {Promise<void>}
   */
  static async initialize() {
    const settings = AQQStorage.get('settings');

    if (settings?.app?.seedApplied) {
      return;
    }

    await this.installSeed();
  }

  /**
   * Loads and persists the initial application data.
   *
   * Responsibilities:
   * - Load dump.json
   * - Persist all dump collections
   * - Load categories.json into catalog
   * - Load cities.json into locations
   * - Update settings.app.seedApplied
   *
   * @returns {Promise<void>}
   */
  static async installSeed() {
    const dumpResponse = await fetch('assets/data/dump.json');
    const dump = await dumpResponse.json();

    Object.entries(dump).forEach(([collection, data]) => {
      AQQStorage.set(collection, data);
    });

    const categoriesResponse = await fetch('assets/data/categories.json');
    const catalog = await categoriesResponse.json();

    AQQStorage.set('catalog', catalog);

    const citiesResponse = await fetch('assets/data/cities.json');
    const locations = await citiesResponse.json();

    AQQStorage.set('locations', locations);

    const settings = AQQStorage.get('settings') ?? {};

    settings.app ??= {};
    settings.app.seedApplied = true;

    AQQStorage.set('settings', settings);
  }
}