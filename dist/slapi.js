export class SLAPI {
    async fetchAllSites() {
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
                `${departure.stop_area?.name} => ${departure.destination} -- Avgång: ${convertedTime}`,
            ];
        });
        return departureList;
    }
}
