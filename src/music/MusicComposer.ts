import type { GitCommit } from "../git/GitCommit.js";
import type { MusicProfile } from "./MusicProfile.js";
import type { MusicEvent } from "./MusicEvent.js";
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
          a.date.getTime() - b.date.getTime()
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
          commit => commit.filesChanged
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

      const octave =
        this.chooseOctave(commit);

      const midiNote =
        rootMidi +
        scaleIntervals[scaleDegree] +
        (octave - 4) * 12 +
        this.calculateTensionOffset(
          deletionRatio
        );

      const frequency =
        midiToFrequency(midiNote);

      const duration =
        this.calculateDuration(
          secondsPerBeat,
          fileComplexity
        );

      const amplitude =
        this.calculateAmplitude(
          profile,
          size
        );

      events.push({
        startTime: currentTime,
        duration,
        frequency,
        amplitude,
        waveform: profile.waveform,
        commitHash: commit.hash
      });

      currentTime +=
        this.calculateSpacing(
          chronologicalCommits,
          index,
          secondsPerBeat
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
    if (deletionRatio >= 0.6) {
      return 1;
    }

    if (deletionRatio >= 0.35) {
      return -1;
    }

    return 0;
  }

  private calculateDuration(
    secondsPerBeat: number,
    fileComplexity: number
  ): number {
    return (
      secondsPerBeat *
      (1 + fileComplexity * 2)
    );
  }

  private calculateAmplitude(
    profile: MusicProfile,
    commitSize: number
  ): number {
    const amplitude =
      0.15 +
      profile.intensity * 0.25 +
      commitSize * 0.25;

    return Math.min(
      amplitude,
      0.7
    );
  }

  private calculateSpacing(
    commits: GitCommit[],
    index: number,
    secondsPerBeat: number
  ): number {
    const current =
      commits[index];

    const next =
      commits[index + 1];

    if (
      current === undefined ||
      next === undefined
    ) {
      return secondsPerBeat * 2;
    }

    const millisecondsBetween =
      next.date.getTime() -
      current.date.getTime();

    const hoursBetween =
      millisecondsBetween /
      (1000 * 60 * 60);

    const normalizedGap =
      normalize(
        hoursBetween,
        0,
        48
      );

    return (
      secondsPerBeat *
      (1 + normalizedGap * 3)
    );
  }
}