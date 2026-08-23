import path from "node:path";
import { writeFile } from "node:fs/promises";
import type { Command } from "commander";
import { GitRepository } from "../../git/GitRepository.js";
import { GitHistoryParser } from "../../git/GitHistoryParser.js";
import { GitHistoryAnalyzer } from "../../git/GitHistoryAnalyzer.js";
import { MusicMapper } from "../../music/MusicMapper.js";
import { MusicComposer } from "../../music/MusicComposer.js";
import { Synthesizer } from "../../audio/Synthesizer.js";
import { WavEncoder } from "../../audio/WavEncoder.js";

interface ExportOptions {
  output?: string;
}

export function registerExportCommand(
  program: Command
): void {
  program
    .command("export")
    .description(
      "Generate a WAV soundscape from the current Git repository"
    )
    .option(
      "-o, --output <file>",
      "Output WAV filename"
    )
    .action(
      async (options: ExportOptions) => {
        const repository =
          new GitRepository(process.cwd());

        const historyParser =
          new GitHistoryParser();

        const historyAnalyzer =
          new GitHistoryAnalyzer();

        const musicMapper =
          new MusicMapper();

        const musicComposer =
          new MusicComposer();

        const synthesizer =
          new Synthesizer();

        const wavEncoder =
          new WavEncoder();

        const isRepository =
          await repository.isRepository();

        if (!isRepository) {
          console.error(
            "Time Traveler must be run inside a Git repository."
          );

          process.exitCode = 1;
          return;
        }

        const rawHistory =
          await repository.getRawHistory();

        const commits =
          historyParser.parse(rawHistory);

        if (commits.length === 0) {
          console.error(
            "Time Traveler could not find any commits in this repository."
          );

          process.exitCode = 1;
          return;
        }

        const latestCommit =
          commits.reduce(
            (latest, commit) =>
              commit.date > latest.date
                ? commit
                : latest
          );

        const stats =
          historyAnalyzer.analyze(commits);

        const musicProfile =
          musicMapper.createProfile(stats);

        const musicEvents =
          musicComposer.compose(
            musicProfile,
            commits
          );

        const melodyCount =
          musicEvents.filter(
            event =>
              event.layer === "melody"
          ).length;

        const bassCount =
          musicEvents.filter(
            event =>
              event.layer === "bass"
          ).length;

        const padCount =
          musicEvents.filter(
            event =>
              event.layer === "pad"
          ).length;

        console.log();
        console.log("Composition");
        console.log(
          `  Total events: ${musicEvents.length}`
        );
        console.log(
          `  Melody: ${melodyCount}`
        );
        console.log(
          `  Bass: ${bassCount}`
        );
        console.log(
          `  Pad: ${padCount}`
        );

        const samples =
          synthesizer.render(
            musicEvents
          );

        const wav =
          wavEncoder.encode(samples);

        const shortHash =
          latestCommit.hash.slice(0, 7);

        const repositoryName =
          path.basename(process.cwd());

        const outputFileName =
          options.output ??
          `${repositoryName}-${shortHash}.wav`;

        await writeFile(
          outputFileName,
          wav
        );

        console.log();
        console.log(
          `Audio written to ${outputFileName}`
        );
      }
    );
}