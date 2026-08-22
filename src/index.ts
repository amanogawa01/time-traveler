import { Command } from "commander";
import { GitRepository } from "./git/GitRepository.js";
import { GitHistoryParser } from "./git/GitHistoryParser.js";
import { GitHistoryAnalyzer } from "./git/GitHistoryAnalyzer.js";

const program = new Command();

program
  .name("time-traveler")
  .description("Turn your Git history into an ambient musical soundscape")
  .version("0.1.0");

const repository = new GitRepository(process.cwd());
const historyParser = new GitHistoryParser();
const historyAnalyzer = new GitHistoryAnalyzer();

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

    const rawHistory = await repository.getRawHistory();
    const commits = historyParser.parse(rawHistory);
    const stats = historyAnalyzer.analyze(commits);

    console.log();
    console.log("Time Traveler");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();

    console.log("Repository");
    console.log(`  Branch: ${branch}`);
    console.log(`  Commits: ${stats.commitCount}`);
    console.log(
      `  Age: ${stats.repositoryAgeDays.toFixed(1)} days`
    );

    console.log();

    console.log("Code Activity");
    console.log(
      `  Lines added: ${stats.totalInsertions.toLocaleString()}`
    );
    console.log(
      `  Lines deleted: ${stats.totalDeletions.toLocaleString()}`
    );
    console.log(
      `  Total lines changed: ${stats.totalLinesChanged.toLocaleString()}`
    );
    console.log(
      `  Files changed: ${stats.totalFilesChanged.toLocaleString()}`
    );
    console.log(
      `  Churn ratio: ${(stats.churnRatio * 100).toFixed(1)}%`
    );

    console.log();

    console.log("Commit Activity");
    console.log(
      `  Commits/day: ${stats.commitsPerDay.toFixed(2)}`
    );
    console.log(
      `  Avg lines/commit: ${stats.averageLinesChangedPerCommit.toFixed(1)}`
    );

    if (stats.busiestHour !== null) {
      console.log(
        `  Busiest hour: ${formatHour(stats.busiestHour)}`
      );
    }
  });

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 === 0
      ? 12
      : hour % 12;

  return `${displayHour}:00 ${suffix}`;
}

program.parseAsync();