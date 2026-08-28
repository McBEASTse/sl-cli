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
