#!/usr/bin/env node

import { program } from "commander";

const hello = (message: string) => {
  console.log(`hello`, program.args[0], program.args[1]);
};

program
  .description("SL CLI - under uppbyggnad")
  .argument("<string>")
  .argument("<string>")
  .action(hello);

program.parse();
