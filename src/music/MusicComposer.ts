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

    const maximumLinesChanged =
      Math.max(
        ...chronologicalCommits.map(
          commit =>
            commit.insertions +
            commit.deletions
        ),
        1
      );

    const maximumFilesChanged =
      Math.max(
        ...chronologicalCommits.map(
          commit =>
            commit.filesChanged
        ),
        1
      );

    let currentTime = 0;

    for (
      let index = 0;
      index < chronologicalCommits.length;
      index += 1
    ) {
      const commit =
        chronologicalCommits[index];

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
          ? commit.deletions / linesChanged
          : 0;

      const scaleDegree =
        this.chooseScaleDegree(
          commit,
          scaleIntervals.length
        );

      const melodyOctave =
        this.chooseOctave(commit);

      const melodyMidi =
        rootMidi +
        scaleIntervals[scaleDegree] +
        (melodyOctave - 4) * 12 +
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
        startTime: currentTime,
        duration: melodyDuration,
        frequency: melodyFrequency,
        amplitude: melodyAmplitude,
        waveform: profile.waveform,
        layer: "melody",
        commitHash: commit.hash
      });

      const bassMidi =
        rootMidi -
        12 +
        scaleIntervals[
          scaleDegree %
          scaleIntervals.length
        ];

      events.push({
        startTime: currentTime,
        duration:
          secondsPerBeat *
          (2 + fileComplexity),
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
        waveform: "sine",
        layer: "bass",
        commitHash: commit.hash
      });

      const padDuration =
        secondsPerBeat *
        (
          3 +
          fileComplexity * 3
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
          ) * 12;

        const padMidi =
          rootMidi +
          scaleIntervals[
            wrappedDegree
          ] +
          octaveShift;

        events.push({
          startTime: currentTime,
          duration: padDuration,
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
          waveform: "sine",
          layer: "pad",
          commitHash: commit.hash
        });
      }

      currentTime +=
        this.calculateSpacing(
          chronologicalCommits,
          index,
          secondsPerBeat,
          chronologicalCommits.length
        );
    }

    return events;
  }

  private chooseScaleDegree(
    commit: GitCommit,
    scaleLength: number
  ): number {
    const value =
      commit.insertions +
      commit.filesChanged;

    return value % scaleLength;
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
      deletionRatio >= 0.6
    ) {
      return 1;
    }

    if (
      deletionRatio >= 0.35
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
        fileComplexity * 1.5
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
      commits[index + 1];

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
        (1000 * 60 * 60)
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
      1 /
      (
        1 +
        Math.log10(
          Math.max(
            1,
            totalCommitCount
          )
        ) *
        0.35
      );

    const baseSpacing =
      secondsPerBeat *
      (
        0.75 +
        normalizedGap * 4.25
      );

    return (
      baseSpacing *
      sizeCompression
    );
  }
}