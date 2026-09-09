import type { GitCommit } from "../git/GitCommit.js";
import type { MusicProfile } from "./MusicProfile.js";
import type {
  MusicEvent,
  MusicLayer
} from "./MusicEvent.js";
import { SCALE_INTERVALS } from "./scales.js";
import {
  noteToMidi,
  midiToFrequency
} from "./midi.js";
import { normalize } from "./normalize.js";

export class MusicComposer {
  public compose(
    profile: MusicProfile,
    commits: GitCommit[]
  ): MusicEvent[] {
    if (commits.length === 0) {
      return [];
    }

    const events: MusicEvent[] = [];

    const rootMidi =
      noteToMidi(profile.rootNote, 4);

    const scaleIntervals =
      SCALE_INTERVALS[profile.scale];

    const secondsPerBeat =
      60 / profile.tempo;

    const chronologicalCommits =
      [...commits].sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime()
      );

    const musicalCommits =
      this.aggregateLargeHistory(
        chronologicalCommits
      );

    let maximumLinesChanged = 1;
    let maximumFilesChanged = 1;

    for (const commit of musicalCommits) {
      const linesChanged =
        commit.insertions +
        commit.deletions;

      if (
        linesChanged >
        maximumLinesChanged
      ) {
        maximumLinesChanged =
          linesChanged;
      }

      if (
        commit.filesChanged >
        maximumFilesChanged
      ) {
        maximumFilesChanged =
          commit.filesChanged;
      }
    }

    let currentTime = 0;

    for (
      let index = 0;
      index < musicalCommits.length;
      index += 1
    ) {
      const commit =
        musicalCommits[index];

      if (commit === undefined) {
        continue;
      }

      const linesChanged =
        commit.insertions +
        commit.deletions;

      const size =
        normalize(
          linesChanged,
          0,
          maximumLinesChanged
        );

      const fileComplexity =
        normalize(
          commit.filesChanged,
          0,
          maximumFilesChanged
        );

      const deletionRatio =
        linesChanged > 0
          ? commit.deletions /
            linesChanged
          : 0;

      const scaleDegree =
        this.chooseScaleDegree(
          commit,
          scaleIntervals.length
        );

      const melodyOctave =
        this.chooseOctave(
          commit
        );

      const melodyMidi =
        rootMidi +
        scaleIntervals[
          scaleDegree
        ] +
        (melodyOctave - 4) *
          12 +
        this.calculateTensionOffset(
          deletionRatio
        );

      const melodyFrequency =
        midiToFrequency(
          melodyMidi
        );

      const melodyDuration =
        this.calculateMelodyDuration(
          secondsPerBeat,
          fileComplexity
        );

      const melodyAmplitude =
        this.calculateAmplitude(
          profile,
          size,
          "melody"
        );

      events.push({
        startTime:
          currentTime,
        duration:
          melodyDuration,
        frequency:
          melodyFrequency,
        amplitude:
          melodyAmplitude,
        waveform:
          profile.waveform,
        layer:
          "melody",
        commitHash:
          commit.hash
      });

      const bassMidi =
        rootMidi -
        12 +
        scaleIntervals[
          scaleDegree %
          scaleIntervals.length
        ];

      events.push({
        startTime:
          currentTime,
        duration:
          secondsPerBeat *
          (
            2 +
            fileComplexity
          ),
        frequency:
          midiToFrequency(
            bassMidi
          ),
        amplitude:
          this.calculateAmplitude(
            profile,
            size,
            "bass"
          ),
        waveform:
          "sine",
        layer:
          "bass",
        commitHash:
          commit.hash
      });

      const padDuration =
        secondsPerBeat *
        (
          3 +
          fileComplexity *
            3
        );

      const chordDegrees = [
        scaleDegree,
        scaleDegree + 2,
        scaleDegree + 4
      ];

      for (
        const chordDegree
        of chordDegrees
      ) {
        const wrappedDegree =
          chordDegree %
          scaleIntervals.length;

        const octaveShift =
          Math.floor(
            chordDegree /
            scaleIntervals.length
          ) *
          12;

        const padMidi =
          rootMidi +
          scaleIntervals[
            wrappedDegree
          ] +
          octaveShift;

        events.push({
          startTime:
            currentTime,
          duration:
            padDuration,
          frequency:
            midiToFrequency(
              padMidi
            ),
          amplitude:
            this.calculateAmplitude(
              profile,
              size,
              "pad"
            ),
          waveform:
            "sine",
          layer:
            "pad",
          commitHash:
            commit.hash
        });
      }

      currentTime +=
        this.calculateSpacing(
          musicalCommits,
          index,
          secondsPerBeat,
          commits.length
        );
    }

    return events;
  }

  private aggregateLargeHistory(
    commits: GitCommit[]
  ): GitCommit[] {
    const aggregationThreshold =
      1000;

    if (
      commits.length <=
      aggregationThreshold
    ) {
      return commits;
    }

    const targetCount =
      Math.round(
        600 +
        Math.log10(
          commits.length /
          aggregationThreshold
        ) *
        120
      );

    const bucketSize =
      Math.ceil(
        commits.length /
        targetCount
      );

    const aggregated:
      GitCommit[] = [];

    for (
      let start = 0;
      start < commits.length;
      start += bucketSize
    ) {
      const end =
        Math.min(
          start +
          bucketSize,
          commits.length
        );

      const first =
        commits[start];

      const last =
        commits[
          end - 1
        ];

      if (
        first === undefined ||
        last === undefined
      ) {
        continue;
      }

      let insertions = 0;
      let deletions = 0;
      let filesChanged = 0;
      let timestampTotal = 0;
      let commitCount = 0;

      for (
        let index = start;
        index < end;
        index += 1
      ) {
        const commit =
          commits[index];

        if (
          commit === undefined
        ) {
          continue;
        }

        insertions +=
          commit.insertions;

        deletions +=
          commit.deletions;

        filesChanged +=
          commit.filesChanged;

        timestampTotal +=
          commit.date.getTime();

        commitCount += 1;
      }

      if (commitCount === 0) {
        continue;
      }

      const averageTimestamp =
        timestampTotal /
        commitCount;

      aggregated.push({
        hash:
          `${first.hash.slice(
            0,
            7
          )}-${last.hash.slice(
            0,
            7
          )}`,
        authorName:
          "Aggregated",
        authorEmail:
          "",
        date:
          new Date(
            averageTimestamp
          ),
        message:
          `Aggregated ${commitCount} commits`,
        insertions,
        deletions,
        filesChanged
      });
    }

    return aggregated;
  }

  private chooseScaleDegree(
    commit: GitCommit,
    scaleLength: number
  ): number {
    const value =
      commit.insertions +
      commit.filesChanged;

    return (
      value %
      scaleLength
    );
  }

  private chooseOctave(
    commit: GitCommit
  ): number {
    const hour =
      commit.date.getHours();

    if (hour < 6) {
      return 3;
    }

    if (hour < 12) {
      return 4;
    }

    if (hour < 18) {
      return 5;
    }

    return 4;
  }

  private calculateTensionOffset(
    deletionRatio: number
  ): number {
    if (
      deletionRatio >=
      0.6
    ) {
      return 1;
    }

    if (
      deletionRatio >=
      0.35
    ) {
      return -1;
    }

    return 0;
  }

  private calculateMelodyDuration(
    secondsPerBeat: number,
    fileComplexity: number
  ): number {
    return (
      secondsPerBeat *
      (
        0.75 +
        fileComplexity *
          1.5
      )
    );
  }

  private calculateAmplitude(
    profile: MusicProfile,
    commitSize: number,
    layer: MusicLayer
  ): number {
    const base =
      0.12 +
      profile.intensity *
        0.18 +
      commitSize *
        0.18;

    switch (layer) {
      case "melody":
        return Math.min(
          base + 0.08,
          0.5
        );

      case "bass":
        return Math.min(
          base * 0.75,
          0.35
        );

      case "pad":
        return Math.min(
          base * 0.35,
          0.16
        );
    }
  }

  private calculateSpacing(
    commits: GitCommit[],
    index: number,
    secondsPerBeat: number,
    totalCommitCount: number
  ): number {
    const current =
      commits[index];

    const next =
      commits[
        index + 1
      ];

    if (
      current === undefined ||
      next === undefined
    ) {
      return secondsPerBeat;
    }

    const millisecondsBetween =
      next.date.getTime() -
      current.date.getTime();

    const hoursBetween =
      Math.max(
        0,
        millisecondsBetween /
        (
          1000 *
          60 *
          60
        )
      );

    const compressedGap =
      Math.log1p(
        hoursBetween
      );

    const maximumReferenceGap =
      Math.log1p(
        24 * 365
      );

    const normalizedGap =
      Math.min(
        1,
        compressedGap /
        maximumReferenceGap
      );

    const sizeCompression =
      totalCommitCount <=
      100
        ? 1
        : 1 /
          (
            1 +
            Math.log10(
              totalCommitCount /
              100
            ) *
            0.18
          );

    const baseSpacing =
      secondsPerBeat *
      (
        1 +
        normalizedGap *
          4
      );

    return (
      baseSpacing *
      sizeCompression
    );
  }
}