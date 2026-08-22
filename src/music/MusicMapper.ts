import type { GitHistoryStats } from "../git/GitHistoryStats.js";
import type {
  MusicProfile,
  ScaleType,
  Waveform
} from "./MusicProfile.js";
import { normalize } from "./normalize.js";

export class MusicMapper {
  public createProfile(
    stats: GitHistoryStats
  ): MusicProfile {
    const activity =
      normalize(
        stats.commitsPerDay,
        0,
        10
      );

    const intensity =
      normalize(
        stats.averageLinesChangedPerCommit,
        0,
        1000
      );

    const dissonance =
      stats.churnRatio;

    const noteDensity =
      normalize(
        stats.averageFilesChangedPerCommit,
        0,
        20
      );

    const tempo =
      Math.round(
        this.mapRange(
          activity,
          50,
          150
        )
      );

    const rootNote =
      this.mapHourToRootNote(
        stats.busiestHour
      );

    const scale =
      this.chooseScale(
        dissonance
      );

    const waveform =
      this.chooseWaveform(
        intensity
      );

    return {
      tempo,
      rootNote,
      scale,
      waveform,
      intensity,
      dissonance,
      noteDensity
    };
  }

  private mapRange(
    normalizedValue: number,
    min: number,
    max: number
  ): number {
    return (
      min +
      normalizedValue * (max - min)
    );
  }

  private mapHourToRootNote(
    hour: number | null
  ): string {
    if (hour === null) {
      return "C";
    }

    const notes = [
      "C",
      "D",
      "E",
      "F",
      "G",
      "A",
      "B"
    ];

    const index =
      Math.floor(
        (hour / 24) * notes.length
      );

    return notes[
      Math.min(
        index,
        notes.length - 1
      )
    ];
  }

  private chooseScale(
    dissonance: number
  ): ScaleType {
    if (dissonance >= 0.5) {
      return "minor";
    }

    if (dissonance >= 0.3) {
      return "dorian";
    }

    if (dissonance >= 0.15) {
      return "mixolydian";
    }

    return "major";
  }

  private chooseWaveform(
    intensity: number
  ): Waveform {
    if (intensity >= 0.75) {
      return "sawtooth";
    }

    if (intensity >= 0.5) {
      return "square";
    }

    if (intensity >= 0.25) {
      return "triangle";
    }

    return "sine";
  }
}