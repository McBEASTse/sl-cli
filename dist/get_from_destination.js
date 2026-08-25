export class SLAPI {
    async fetchDestination(fromDestination) {
        const url = `https://journeyplanner.integration.sl.se/v2/stop-finder?name_sf=${fromDestination}&any_obj_filter_sf=2&type_sf=any`;
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
    async fetchDestinationDepartures(fromDestination) {
        const siteIdResult = await this.fetchDestination(fromDestination);
        const siteId = siteIdResult.locations[0]?.id.slice(-4);
        const url = `https://transport.integration.sl.se/v1/sites/${siteId}/departures`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            const departures = await response.json();
            return departures;
        }
        catch (e) {
            throw new Error(`Error fetching locations: ${e.message}`);
        }
    }
    async listDepartures(departures) {
        const nextDepartures = await this.fetchDestinationDepartures(departures);
        const departureList = nextDepartures.departures.slice(0, 5).map((dep) => {
            const convertedTime = new Date(dep.scheduled).toLocaleTimeString("sv-SE", {
                hour: "2-digit",
                minute: "2-digit",
            });
            return [`Mot: ${dep.destination} -- Avgång: ${convertedTime}`];
        });
        return departureList;
    }
}
