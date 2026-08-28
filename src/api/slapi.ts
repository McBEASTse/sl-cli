import type { JourneyPlanner } from "./slapi-types.js";
import { fetchStationGid } from "../fetch_station_ids.js";
import { convertTime } from "../convert_time.js";
import { fetchDeparturesFromSite } from "../fetch_sites.js";

export class SLAPI {
  async listDeparturesFromSite(departures: string) {
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

  async journeyPlanner(
    fromDestination: string,
    toDestination: string,
    numberOfTrips: number = 3,
  ): Promise<JourneyPlanner> {
    const fromDestinationIdGid = await fetchStationGid(fromDestination);
    const toDestinationIdGid = await fetchStationGid(toDestination);
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
      const journeyOriginNames: string[] = journey.legs.map(
        (journeyStop) => journeyStop.origin.name,
      );
      const journeyDestinationNames: string[] = journey.legs.map(
        (journeyStop) => journeyStop.destination.name,
      );
      const journeyOrigin = journeyOriginNames[0];
      const journeyDestination =
        journeyDestinationNames[journeyDestinationNames.length - 1];
      if (
        !journeyOriginNames ||
        !journeyDestinationNames ||
        !firstLeg ||
        !lastLeg
      ) {
        throw new Error(`Ingen information om delsträckor.`);
      }

      const listStops = journeyDestinationNames.join(" => ");

      const startStationTime = convertTime(
        firstLeg.origin.departureTimePlanned,
      );
      const endStationTime = convertTime(
        lastLeg.destination.arrivalTimePlanned,
      );

      return `${journeyOrigin} (${startStationTime}) => ${journeyDestination} (${endStationTime})
Antal byten: ${journey.interchanges}
${journeyOrigin} => ${listStops}\n`;
    });
  }
}
