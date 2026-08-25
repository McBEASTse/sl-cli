export type StopLookup = {
  locations: {
    id: string;
  }[];
};

export type locationDestinations = {
  departures: {
    direction: string;
    destination: string;
    scheduled: Date;
  }[];
};

export class SLAPI {
  async fetchDestination(fromDestination: string): Promise<StopLookup> {
    const url = `https://journeyplanner.integration.sl.se/v2/stop-finder?name_sf=${fromDestination}&any_obj_filter_sf=2&type_sf=any`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const location = (await response.json()) as StopLookup;
      return location;
    } catch (e) {
      throw new Error(`Error fetching locations: ${(e as Error).message}`);
    }
  }

  async fetchDestinationDepartures(
    fromDestination: string,
  ): Promise<locationDestinations> {
    const siteIdResult = await this.fetchDestination(fromDestination);
    const siteId = siteIdResult.locations[0]?.id.slice(-4);
    const url = `https://transport.integration.sl.se/v1/sites/${siteId}/departures`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const departures = await response.json();
      return departures as locationDestinations;
    } catch (e) {
      throw new Error(`Error fetching locations: ${(e as Error).message}`);
    }
  }

  async listDepartures(departures: string) {
    const nextDepartures = await this.fetchDestinationDepartures(departures);
    const departureList = nextDepartures.departures.slice(0, 5).map((dep) => {
      const convertedTime = new Date(dep.scheduled).toLocaleTimeString(
        "sv-SE",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      );
      return [`Mot: ${dep.destination} -- Avgång: ${convertedTime}`];
    });
    return departureList;
  }
}
