import { fetchAllSites } from "./fetch_sites.js";
import { StationInformation } from "./api/slapi-types.js";

export async function fetchStation(
  stationName: string,
): Promise<StationInformation> {
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

export async function fetchStationId(stationName: string) {
  const allSites = await fetchAllSites();
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

export async function fetchStationGid(stationName: string): Promise<string> {
  const fetchStationNames = await fetchStation(stationName);
  const bestStationMatch = fetchStationNames.locations?.[0];

  if (!bestStationMatch) {
    throw new Error(`Error finding a best match for: ${stationName}`);
  }
  return bestStationMatch.id;
}
