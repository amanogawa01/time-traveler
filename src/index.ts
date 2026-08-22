#!/usr/bin/env node

import { Command } from "commander";
import { registerAnalyzeCommand } from "./cli/commands/analyze.js";
import { registerExportCommand } from "./cli/commands/export.js";

const program = new Command();

program
  .name("time-traveler")
  .description("Turn your Git history into music")
  .version("0.1.0");

registerAnalyzeCommand(program);
registerExportCommand(program);

program.parseAsync();