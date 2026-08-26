import type {
  AllSites,
  StationDepartures,
  StationInformation,
} from "./api/slapi-types.js";

export class SLAPI {
  async fetchAllSites(): Promise<AllSites> {
    const url = `https://transport.integration.sl.se/v1/sites?expand=true`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const location = (await response.json()) as AllSites;
      return location;
    } catch (e) {
      throw new Error(`Error fetching locations: ${(e as Error).message}`);
    }
  }

  async fetchStation(stationName: string): Promise<StationInformation> {
    const url = `https://journeyplanner.integration.sl.se/v2/stop-finder?name_sf=${stationName}&any_obj_filter_sf=2&type_sf=any`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const location = (await response.json()) as StationInformation;
      return location;
    } catch (e) {
      throw new Error(`Error fetching locations: ${(e as Error).message}`);
    }
  }

  async fetchStationId(stationName: string): Promise<number | null> {
    const allSites = await this.fetchAllSites();
    const searchString: string = stationName.toLowerCase().trim();
    const exactMatch = allSites.find(
      (site) => site.name.toLowerCase() === searchString,
    );
    if (exactMatch) return exactMatch.id;

    const partialMatch = allSites.find((site) =>
      site.name.toLowerCase().includes(searchString),
    );
    if (partialMatch) return partialMatch.id;

    const aliasMatch = allSites.find((site) =>
      site.alias?.some((alias) => alias.toLowerCase().includes(searchString)),
    );
    if (aliasMatch) return aliasMatch.id;

    return null;
  }

  async fetchStationDepartures(
    stationName: string,
  ): Promise<StationDepartures> {
    const stationId = await this.fetchStationId(stationName);
    const url = `https://transport.integration.sl.se/v1/sites/${stationId}/departures`;

    if (!stationId) {
      throw new Error(
        `Kunde inte hitta något stations-ID för: "${stationName}"`,
      );
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const departures = await response.json();
      return departures as StationDepartures;
    } catch (e) {
      throw new Error(`Error fetching the station ID: ${(e as Error).message}`);
    }
  }

  async listStationDepartures(departures: string) {
    const nextDepartures = await this.fetchStationDepartures(departures);
    const departureList = nextDepartures.departures
      .slice(0, 5)
      .map((departure) => {
        const convertedTime = new Date(departure.scheduled).toLocaleTimeString(
          "sv-SE",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        );
        return [
          `${departure.stop_area?.name} => ${departure.destination} -- Avgång: ${convertedTime}`,
        ];
      });
    return departureList;
  }
}
