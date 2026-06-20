import { AQQStorage } from '../core/aqq-storage.js';

export class LocationService {
    /**
     * Retrieves all geographic location data (States, Cities, and Neighborhoods).
     *
     * @returns {Object} An object containing the array of states or an empty structure on failure.
     */
    static getAllLocations() {
        try {

            const rawData = AQQStorage.get('locations');

            if (!rawData || !rawData.states) {
                return { states: [] };
            }

            return rawData;
        } catch (error) {
            return { states: [] };
        }
    }
}