import { Command } from "commander";
import { GitRepository } from "./git/GitRepository.js";

const program = new Command();

program
  .name("time-traveler")
  .description("Turn your Git history into music")
  .version("0.1.0");

const repository = new GitRepository(process.cwd());

program
  .command("analyze")
  .description("Analyze the current Git repository")
  .action(async () => {
    const isRepository = await repository.isRepository();

    if (!isRepository) {
      console.error(
        "Time Traveler must be run inside a Git repository."
      );

      process.exitCode = 1;
      return;
    }

    const branch = await repository.getCurrentBranch();

    console.log(`Current branch: ${branch}`);
  });

program.parseAsync();