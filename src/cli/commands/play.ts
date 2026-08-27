import path from "node:path";
import os from "node:os";
import { writeFile } from "node:fs/promises";
import type { Command } from "commander";
import { GitRepository } from "../../git/GitRepository.js";
import { GitHistoryParser } from "../../git/GitHistoryParser.js";
import { GitHistoryAnalyzer } from "../../git/GitHistoryAnalyzer.js";
import { MusicMapper } from "../../music/MusicMapper.js";
import { MusicComposer } from "../../music/MusicComposer.js";
import { Synthesizer } from "../../audio/Synthesizer.js";
import { WavEncoder } from "../../audio/WavEncoder.js";
import { AudioPlayer } from "../../audio/AudioPlayer.js";

interface PlayOptions {
  branch?: string;
}

export function registerPlayCommand(
  program: Command
): void {
  program
    .command("play")
    .description(
      "Generate and play a soundscape from the current Git repository"
    )
    .option(
      "-b, --branch <branch>",
      "Play a specific Git branch"
    )
    .action(
      async (
        options: PlayOptions
      ) => {
        const repository =
          new GitRepository(
            process.cwd()
          );

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

        const audioPlayer =
          new AudioPlayer();

        const isRepository =
          await repository.isRepository();

        if (!isRepository) {
          console.error(
            "Time Traveler must be run inside a Git repository."
          );

          process.exitCode = 1;
          return;
        }

        const hasCommits =
          await repository.hasCommits();

        if (!hasCommits) {
          console.error(
            "Time Traveler cannot process a repository with no commits."
          );

          process.exitCode = 1;
          return;
        }

        const requestedBranch =
          options.branch;

        if (
          requestedBranch !== undefined
        ) {
          const exists =
            await repository.branchExists(
              requestedBranch
            );

          if (!exists) {
            console.error(
              `Branch "${requestedBranch}" does not exist.`
            );

            process.exitCode = 1;
            return;
          }
        }

        const branch =
          requestedBranch ??
          await repository.getCurrentBranch();

        const rawHistory =
          await repository.getRawHistory(
            requestedBranch
          );

        const commits =
          historyParser.parse(
            rawHistory
          );

        if (
          commits.length === 0
        ) {
          console.error(
            "Time Traveler could not find any commits in this repository."
          );

          process.exitCode = 1;
          return;
        }

        console.log();

        console.log(
          `Generating soundscape for ${branch}...`
        );

        const stats =
          historyAnalyzer.analyze(
            commits
          );

        const musicProfile =
          musicMapper.createProfile(
            stats
          );

        const musicEvents =
          musicComposer.compose(
            musicProfile,
            commits
          );

        const stereo =
          synthesizer.render(
            musicEvents
          );

        const wav =
          wavEncoder.encode(
            stereo
          );

        const temporaryFile =
          path.join(
            os.tmpdir(),
            `time-traveler-${process.pid}.wav`
          );

        await writeFile(
          temporaryFile,
          wav
        );

        console.log(
          `Playing ${commits.length} commits from ${branch}`
        );

        await audioPlayer.play(
          temporaryFile
        );
      }
    );
}