import type { JourneyPlanner } from "./slapi-types.js";
import chalk from "chalk";
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
  if (productName.includes() === "Waxholm") {
    lineLabel =
      chalk.hex("#FFFFFF").bold.bgHex("#000000")(` W `) +
      chalk.hex("#FFFFFF").bold.bgHex("#498228")(` ${lineNumber} `);
  }
  switch (lineNumber) {
    case "7":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` SC `) +
        chalk.hex("#FFFFFF").bold.bgHex("#747770")(` ${lineNumber} `);
      break;
    case "10":
    case "11":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` T `) +
        chalk.hex("#FFFFFF").bold.bgHex("#007DB8")(` ${lineNumber} `);
      break;
    case "12":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` N `) +
        chalk.hex("#FFFFFF").bold.bgHex("#627892")(` ${lineNumber} `);
      break;
    case "13":
    case "14":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` T `) +
        chalk.hex("#FFFFFF").bold.bgHex("#D71D24")(` ${lineNumber} `);
      break;
    case "17":
    case "18":
    case "19":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` T `) +
        chalk.hex("#FFFFFF").bold.bgHex("#148541")(` ${lineNumber} `);
      break;
    case "21":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` L `) +
        chalk.hex("#FFFFFF").bold.bgHex("#007DB8")(` ${lineNumber} `);
      break;
    case "25":
    case "26":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` S `) +
        chalk.hex("#FFFFFF").bold.bgHex("#007DB8")(` ${lineNumber} `);
      break;
    case "27":
    case "28":
    case "29":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` R `) +
        chalk.hex("#FFFFFF").bold.bgHex("#9F599A")(` ${lineNumber} `);
      break;
    case "30":
    case "31":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` Tv `) +
        chalk.hex("#FFFFFF").bold.bgHex("#007DB8")(` ${lineNumber} `);
      break;
    case "40":
    case "41":
    case "42":
    case "43":
    case "44":
    case "48":
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` P `) +
        chalk.hex("#FFFFFF").bold.bgHex("#CC417F")(` ${lineNumber} `);
      break;
    default:
      lineLabel =
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` B `) +
        chalk.hex("#FFFFFF").bold.bgHex("#000000")(` ${lineNumber} `);
      break;
  }
  return `${origin} ${lineLabel} => ${destination}`;
}
