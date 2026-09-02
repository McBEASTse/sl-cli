export type AllSites = {
  id: string;
  gid: string;
  name: string;
  alias: string[];
  note: string;
  lat: number;
  lon: number;
  valid: {
    from: string;
  };
}[];

export type SitesInformation = {
  id: string;
  gid: number;
  name: string;
  abbreviation: string;
  lat: number;
  lon: number;
};

export type StationInformation = {
  locations: {
    coord: number[];
    disassembledName: string;
    id: string;
    isBest: boolean;
    matchQuality: number;
    name: string;
    parent: {
      id: string;
      name: string;
    };
  }[];
};

export type DeparturesFromSite = {
  departures: {
    destination: string;
    direction: string;
    display: string;
    scheduled: string;
    stop_area: {
      id: number;
      name: string;
      type: string;
    };
    line: {
      id: number;
      designation: string;
      transport_mode: string;
      group_of_lines: string;
    };
  }[];
};

export type CacheStructure = {
  timestamp: number;
  data: AllSites;
};

export type JourneyPlanner = {
  journeys: {
    tripDuration: number;
    isAdditional: boolean;
    interchanges: number;
    legs: {
      origin: {
        departureTimePlanned: string;
        name: string;
      };
      destination: {
        arrivalTimePlanned: string;
        name: string;
      };
      transportation: {
        disassembledName: string;
        number: string;
        product: {
          name: string;
        };
        destination: {
          name: string;
        };
      };
    }[];
  }[];
};
