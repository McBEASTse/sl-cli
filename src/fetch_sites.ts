import { AllSites, DeparturesFromSite } from "./api/slapi-types.js";
import { readCache, writeCache } from "./cache.js";
import { fetchStationId } from "./fetch_station_ids.js";
import { convertTime } from "./convert_time.js";

export async function fetchAllSites(
  forceRefresh: boolean = false,
): Promise<AllSites> {
  if (!forceRefresh) {
    const cachedData = await readCache();
    if (cachedData) {
      return cachedData;
    }
  }

  const apiData = await fetchSitesFromAPI();
  await writeCache(apiData);

  return apiData;
}

export async function fetchSitesFromAPI(): Promise<AllSites> {
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

export async function fetchDeparturesFromSite(
  stationName: string,
): Promise<DeparturesFromSite> {
  const stationId = await fetchStationId(stationName);
  if (!stationId) {
    throw new Error(`Kunde inte hitta något stations-ID för: "${stationName}"`);
  }

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

export async function listDeparturesFromSite(departures: string) {
  const nextDepartures = await fetchDeparturesFromSite(departures);
  const departureList = nextDepartures.departures
    .slice(0, 5)
    .map((departure) => {
      const convertedTime = convertTime(departure.scheduled);
      return [
        `${departure.stop_area?.name} => ${departure.destination}\nAvgång: ${convertedTime} (${departure.display})\n`,
      ];
    });
  return departureList;
}
