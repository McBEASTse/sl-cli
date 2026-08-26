export type AllSites = {
  id: number;
  gid: number;
  name: string;
  alias: string[];
  note: string;
  lat: number;
  lon: number;
  valid: {
    from: Date;
  };
}[];

export type SitesInformation = {
  id: number;
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

export type StationDepartures = {
  departures: {
    direction: string;
    destination: string;
    scheduled: Date;
    stop_area: {
      id: number;
      name: string;
      type: string;
    };
  }[];
};
