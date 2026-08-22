import { Command } from "commander";

const program = new Command();

program
  .name("time-traveler")
  .description("Turn your Git history into music")
  .version("0.1.0");

program.parse();