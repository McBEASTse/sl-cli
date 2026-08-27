import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type {
  AllSites,
  DeparturesFromSite,
  StationInformation,
  CacheStructure,
  JourneyPlanner,
} from "./slapi-types.js";

export class SLAPI {
  private cachePath = path.join(os.tmpdir(), "sl_cli_allSites_cache.json");
  private cacheTTL = 24 * 60 * 60 * 1000;

  async fetchAllSites(forceRefresh: boolean = false): Promise<AllSites> {
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

  private async fetchSitesFromAPI(): Promise<AllSites> {
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

  private async readCache(): Promise<AllSites | null> {
    try {
      const fileContent = await fs.readFile(this.cachePath, "utf-8");
      const cache: CacheStructure = JSON.parse(fileContent);

      const isExpired = Date.now() - cache.timestamp > this.cacheTTL;
      if (!isExpired) {
        return cache.data;
      }
    } catch {}
    return null;
  }

  private async writeCache(data: AllSites): Promise<void> {
    try {
      const cacheToSave: CacheStructure = {
        timestamp: Date.now(),
        data,
      };
      await fs.writeFile(this.cachePath, JSON.stringify(cacheToSave), "utf-8");
    } catch (e) {
      throw new Error(`Error writing cache file: ${(e as Error).message}`);
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

  async fetchStationId(stationName: string) {
    const allSites = await this.fetchAllSites();
    const searchString: string = stationName.toLowerCase().trim();
    const exactMatch = allSites.find(
      (site) => site.name.toLowerCase() === searchString,
    );
    if (exactMatch) return { id: exactMatch.id, gid: exactMatch.gid };

    const partialMatch = allSites.find((site) =>
      site.name.toLowerCase().includes(searchString),
    );
    if (partialMatch) return { id: partialMatch.id, gid: partialMatch.gid };

    const aliasMatch = allSites.find((site) =>
      site.alias?.some((alias) => alias.toLowerCase().includes(searchString)),
    );
    if (aliasMatch) return { id: aliasMatch.id, gid: aliasMatch.gid };

    return null;
  }

  async fetchStationGid(stationName: string): Promise<string> {
    const fetchStationNames = await this.fetchStation(stationName);
    const bestStationMatch = fetchStationNames.locations?.[0];

    if (!bestStationMatch) {
      throw new Error(`Error finding a best match for: ${stationName}`);
    }
    return bestStationMatch.id;
  }

  async fetchDeparturesFromSite(
    stationName: string,
  ): Promise<DeparturesFromSite> {
    const stationIdGid = await this.fetchStationId(stationName);
    if (!stationIdGid) {
      throw new Error(
        `Kunde inte hitta något stations-ID för: "${stationName}"`,
      );
    }

    const stationId = stationIdGid.id;
    const url = `https://transport.integration.sl.se/v1/sites/${stationId}/departures`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const departures = await response.json();
      return departures as DeparturesFromSite;
    } catch (e) {
      throw new Error(`Error fetching the station ID: ${(e as Error).message}`);
    }
  }

  async listDeparturesFromSite(departures: string) {
    const nextDepartures = await this.fetchDeparturesFromSite(departures);
    const departureList = nextDepartures.departures
      .slice(0, 5)
      .map((departure) => {
        const convertedTime = this.convertTime(departure.scheduled);
        return [
          `${departure.stop_area?.name} => ${departure.destination}\nAvgång: ${convertedTime} (${departure.display})\n`,
        ];
      });
    return departureList;
  }

  async journeyPlanner(
    fromDestination: string,
    toDestination: string,
    numberOfTrips: number = 3,
  ): Promise<JourneyPlanner> {
    const fromDestinationIdGid = await this.fetchStationGid(fromDestination);
    const toDestinationIdGid = await this.fetchStationGid(toDestination);
    if (!fromDestinationIdGid || !toDestinationIdGid) {
      throw new Error(`Det blev något fel.`);
    }
    const url = `https://journeyplanner.integration.sl.se/v2/trips?type_origin=any&type_destination=any&name_origin=${fromDestinationIdGid}&name_destination=${toDestinationIdGid}&calc_number_of_trips=${numberOfTrips}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const journey = (await response.json()) as JourneyPlanner;
      return journey as JourneyPlanner;
    } catch (e) {
      throw new Error(`Error fetching locations: ${(e as Error).message}`);
    }
  }

  async listJourneys(fromDestination: string, toDestination: string) {
    const journeysData = await this.journeyPlanner(
      fromDestination,
      toDestination,
    );
    return journeysData.journeys.map((journey) => {
      const firstLeg = journey.legs[0];
      const lastLeg = journey.legs[journey.legs.length - 1];
      if (!firstLeg || !lastLeg) {
        throw new Error(`Ingen information om delsträckor.`);
      }

      const startStation = firstLeg.origin.name;
      const endStation = lastLeg.destination.name;
      const startStationTime = this.convertTime(
        firstLeg.origin.departureTimePlanned,
      );
      const endStationTime = this.convertTime(
        lastLeg.destination.arrivalTimePlanned,
      );

      return `Från: ${startStation} (${startStationTime}) => ${endStation} (${endStationTime}), byten ${journey.interchanges}`;
    });
  }

  private convertTime(rawTimeFormat: string) {
    return new Date(rawTimeFormat).toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
