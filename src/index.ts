import { writeFile } from "node:fs/promises";
import { Command } from "commander";
import { GitRepository } from "./git/GitRepository.js";
import { GitHistoryParser } from "./git/GitHistoryParser.js";
import { GitHistoryAnalyzer } from "./git/GitHistoryAnalyzer.js";
import { MusicMapper } from "./music/MusicMapper.js";
import { MusicComposer } from "./music/MusicComposer.js";
import { Synthesizer } from "./audio/Synthesizer.js";
import { WavEncoder } from "./audio/WavEncoder.js";

const program = new Command();

program
  .name("time-traveler")
  .description("Turn your Git history into music")
  .version("0.1.0");

const repository = new GitRepository(process.cwd());
const historyParser = new GitHistoryParser();
const historyAnalyzer = new GitHistoryAnalyzer();
const musicMapper = new MusicMapper();
const musicComposer = new MusicComposer();
const synthesizer = new Synthesizer();
const wavEncoder = new WavEncoder();

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

    if (commits.length === 0) {
      console.error(
        "Time Traveler could not find any commits in this repository."
      );

      process.exitCode = 1;
      return;
    }

    const latestCommit = commits.reduce(
      (latest, commit) =>
        commit.date > latest.date
          ? commit
          : latest
    );

    const stats = historyAnalyzer.analyze(commits);
    const musicProfile = musicMapper.createProfile(stats);

    const musicEvents = musicComposer.compose(
      musicProfile,
      commits
    );

    const samples = synthesizer.render(
      musicEvents
    );

    const wav = wavEncoder.encode(
      samples
    );

    const shortHash =
    latestCommit.hash.slice(0, 7);

    const outputFileName =
      `time-traveler-${shortHash}.wav`;

    await writeFile(
      outputFileName,
      wav
    );

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

    console.log();

    console.log("Musical Profile");
    console.log(
      `  Tempo: ${musicProfile.tempo} BPM`
    );
    console.log(
      `  Root note: ${musicProfile.rootNote}`
    );
    console.log(
      `  Scale: ${musicProfile.scale}`
    );
    console.log(
      `  Waveform: ${musicProfile.waveform}`
    );
    console.log(
      `  Intensity: ${musicProfile.intensity.toFixed(2)}`
    );
    console.log(
      `  Dissonance: ${musicProfile.dissonance.toFixed(2)}`
    );
    console.log(
      `  Note density: ${musicProfile.noteDensity.toFixed(2)}`
    );

    console.log();

    console.log("Composition");
    console.log(
      `  Events: ${musicEvents.length}`
    );

    if (musicEvents.length > 0) {
      console.log();
      console.log("Events");

      for (const event of musicEvents) {
        console.log({
          startTime: event.startTime.toFixed(2),
          duration: event.duration.toFixed(2),
          frequency: event.frequency.toFixed(2),
          amplitude: event.amplitude.toFixed(2),
          waveform: event.waveform,
          commit: event.commitHash?.slice(0, 7)
        });
      }
    }

    console.log();
    console.log(
      `Audio written to ${outputFileName}`
    );
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