#!/usr/bin/env node

import { Command } from "commander";
import { SLAPI } from "./api/slapi.js";
import { listDeparturesFromSite } from "./fetch_sites.js";
const program = new Command();

export const fromDestination = program.argument(
  "<fromDestination>",
  "Destination from",
);
export const toDestinatinon = program.argument(
  "[toDestination]",
  "Destination from",
);

program
  .name("sl-cli")
  .description("Example program with argument descriptions")
  .action(async (fromDestination, toDestination) => {
    const sl = new SLAPI();
    if (!toDestination) {
      const result = await listDeparturesFromSite(fromDestination);
      for (const departure of result) {
        console.log(departure.toString());
      }
    } else {
      const result = await sl.listJourneys(fromDestination, toDestination);
      for (const trip of result) {
        console.log(trip.toString());
      }
    }
  });

program.parse();
