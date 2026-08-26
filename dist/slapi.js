import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
export class SLAPI {
    cachePath = path.join(os.tmpdir(), "sl_cli_allSites_cache.json");
    cacheTTL = 24 * 60 * 60 * 1000;
    async fetchAllSites(forceRefresh = false) {
        if (!forceRefresh) {
            const cachedData = await this.readCache();
            if (cachedData) {
                return cachedData;
            }
        }
        const apiData = await this.fetchSitesFromAPI();
        await this.writeCache(apiData);
        return apiData;
    }
    async fetchSitesFromAPI() {
        const url = `https://transport.integration.sl.se/v1/sites?expand=true`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            const location = (await response.json());
            return location;
        }
        catch (e) {
            throw new Error(`Error fetching locations: ${e.message}`);
        }
    }
    async readCache() {
        try {
            const fileContent = await fs.readFile(this.cachePath, "utf-8");
            const cache = JSON.parse(fileContent);
            const isExpired = Date.now() - cache.timestamp > this.cacheTTL;
            if (!isExpired) {
                return cache.data;
            }
        }
        catch { }
        return null;
    }
    async writeCache(data) {
        try {
            const cacheToSave = {
                timestamp: Date.now(),
                data,
            };
            await fs.writeFile(this.cachePath, JSON.stringify(cacheToSave), "utf-8");
        }
        catch (e) {
            throw new Error(`Error writing cache file: ${e.message}`);
        }
    }
    async fetchStation(stationName) {
        const url = `https://journeyplanner.integration.sl.se/v2/stop-finder?name_sf=${stationName}&any_obj_filter_sf=2&type_sf=any`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            const location = (await response.json());
            return location;
        }
        catch (e) {
            throw new Error(`Error fetching locations: ${e.message}`);
        }
    }
    async fetchStationId(stationName) {
        const allSites = await this.fetchAllSites();
        const searchString = stationName.toLowerCase().trim();
        const exactMatch = allSites.find((site) => site.name.toLowerCase() === searchString);
        if (exactMatch)
            return exactMatch.id;
        const partialMatch = allSites.find((site) => site.name.toLowerCase().includes(searchString));
        if (partialMatch)
            return partialMatch.id;
        const aliasMatch = allSites.find((site) => site.alias?.some((alias) => alias.toLowerCase().includes(searchString)));
        if (aliasMatch)
            return aliasMatch.id;
        return null;
    }
    async fetchStationDepartures(stationName) {
        const stationId = await this.fetchStationId(stationName);
        const url = `https://transport.integration.sl.se/v1/sites/${stationId}/departures`;
        if (!stationId) {
            throw new Error(`Kunde inte hitta något stations-ID för: "${stationName}"`);
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            const departures = await response.json();
            return departures;
        }
        catch (e) {
            throw new Error(`Error fetching the station ID: ${e.message}`);
        }
    }
    async listStationDepartures(departures) {
        const nextDepartures = await this.fetchStationDepartures(departures);
        const departureList = nextDepartures.departures
            .slice(0, 5)
            .map((departure) => {
            const convertedTime = new Date(departure.scheduled).toLocaleTimeString("sv-SE", {
                hour: "2-digit",
                minute: "2-digit",
            });
            return [
                `${departure.stop_area?.name} => ${departure.destination}\nAvgång: ${convertedTime}\n`,
            ];
        });
        return departureList;
    }
}
