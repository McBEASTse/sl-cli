#!/usr/bin/env node
import { Command } from "commander";
import { SLAPI } from "./slapi.js";
const program = new Command();
export const fromDestination = program.argument("<fromDestination>", "Destination from");
export const toDestinatinon = program.argument("[toDestination]", "Destination from");
program
    .name("sl-cli")
    .description("Example program with argument descriptions")
    .action((fromDestination, toDestination) => {
    if (toDestination === undefined || toDestination === null) {
        async function run() {
            const sl = new SLAPI();
            const result = await sl.listStationDepartures(fromDestination);
            for (const departure of result) {
                console.log(departure.toString());
            }
        }
        run();
    }
    else {
        console.log("from:", fromDestination);
        console.log("to:", toDestination);
    }
});
program.parse();
