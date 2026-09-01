import type { JourneyPlanner } from "./slapi-types.js";
import kleur from "kleur";
import { fetchStationGid } from "../fetch_station.js";
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
    const calcOneDirectionTrue = `&calc_one_direction=true`;
    if (!fromDestinationIdGid || !toDestinationIdGid) {
      throw new Error(`Det blev något fel.`);
    }
    const url = `https://journeyplanner.integration.sl.se/v2/trips?type_origin=any&type_destination=any&name_origin=${fromDestinationIdGid}&name_destination=${toDestinationIdGid}&calc_number_of_trips=${numberOfTrips}${calcOneDirectionTrue}`;

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
      const journeyStopNames: string[] = journey.legs.map(
        (journeyStop) => journeyStop.destination.name,
      );
      const journeyOrigin = journeyOriginNames[0];
      const journeyDestination = journeyStopNames[journeyStopNames.length - 1];
      if (!journeyOriginNames || !journeyStopNames || !firstLeg || !lastLeg) {
        throw new Error(`Ingen information om delsträckor.`);
      }
      const formattedLegs = journey.legs
        .map(formatLeg)
        .filter((leg): leg is string => leg !== null);
      const journeyStops = formattedLegs.join(` => `);

      const startStationTime = convertTime(
        firstLeg.origin.departureTimePlanned,
      );
      const endStationTime = convertTime(
        lastLeg.destination.arrivalTimePlanned,
      );

      return `${journeyOrigin} (${startStationTime}) => ${journeyDestination} (${endStationTime})
Antal byten: ${journey.interchanges}
${journeyStops}\n`;
    });
  }
}

function formatLeg(leg: any): string | null {
  const productName = leg.transportation.product.name;
  if (productName === "footpath") {
    return null;
  }

  const lineNumber = leg.transportation.disassembledName;
  const origin = leg.origin.name;
  const destination = leg.destination.name;

  let lineLabel = lineNumber;
  if (lineNumber === "10" || lineNumber === "11") {
    lineLabel = kleur.bold().black().bgBlue(` T${lineNumber} `);
  } else if (lineNumber === "13" || lineNumber === "14") {
    lineLabel = kleur.bold().black().bgRed(` T${lineNumber} `);
  } else if (lineNumber === "29") {
    lineLabel = kleur.bold().black().bgMagenta(` R${lineNumber} `);
  } else if (
    lineNumber === "17" ||
    lineNumber === "18" ||
    lineNumber === "19"
  ) {
    lineLabel = kleur.bold().black().bgGreen(` ${lineNumber} `);
  } else {
    lineLabel = kleur.bold().white().bgBlack(` B${lineNumber} `);
  }

  return `${origin} ${lineLabel} => ${destination}`;
}
