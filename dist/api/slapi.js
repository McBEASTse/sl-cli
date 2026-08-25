import { Cache } from "./slapi-cache.js";
export class SLAPI {
    // Static gör att man kan använda baseURL inuti class utan att behöva skriva om strängen varje gång
    static baseURL = "https://journeyplanner.integration.sl.se/v2/";
    cache;
    // constructor() används när man kallar new SLAPI
    constructor(cacheInterval) {
        this.cache = new Cache(cacheInterval);
    }
    closeCache() {
        this.cache.stopReapLoop();
    }
    // Hämtar ett utdrag av locations från API
    async fetchLocations(pageURL) {
        const url = `${SLAPI.baseURL}/stop-finder?name_sf=${locationName}&any_obj_filter_sf=2&type_sf=any`;
        const cached = this.cache.get(url);
        if (cached) {
            return cached;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            const locations = await response.json();
            this.cache.add(url, locations);
            return locations;
        }
        catch (e) {
            throw new Error(`Error fetching locations: ${e.message}`);
        }
    }
    // Hämtar en specifik location vid namn och dess info
    async fetchLocation(locationName) {
        const url = `${SLAPI.baseURL}/location-area/${locationName}`;
        const cached = this.cache.get(url);
        if (cached) {
            return cached;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            const location = await response.json();
            this.cache.add(url, location);
            return location;
        }
        catch (e) {
            throw new Error(`Error fetching location '${locationName}': ${e.message}`);
        }
    }
    async fetchPokemon(pokemonName) {
        const url = `${SLAPI.baseURL}/pokemon/${pokemonName}`;
        const cached = this.cache.get(url);
        if (cached) {
            return cached;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            const pokemon = await response.json();
            this.cache.add(url, pokemon);
            return pokemon;
        }
        catch (e) {
            throw new Error(`Error fetching pokémon '${pokemonName}': ${e.message}`);
        }
    }
}
