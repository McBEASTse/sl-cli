import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type {
  AllSites,
  StationDepartures,
  StationInformation,
  CacheStructure,
} from "./api/slapi-types.js";

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
          `${departure.stop_area?.name} => ${departure.destination}\nAvgång: ${convertedTime}\n`,
        ];
      });
    return departureList;
  }
}
