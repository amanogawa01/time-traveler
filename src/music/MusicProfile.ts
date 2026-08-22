export type Waveform =
  | "sine"
  | "triangle"
  | "sawtooth"
  | "square";

export type ScaleType =
  | "major"
  | "minor"
  | "dorian"
  | "mixolydian";

export interface MusicProfile {
  tempo: number;

  rootNote: string;
  scale: ScaleType;
  waveform: Waveform;

  intensity: number;
  dissonance: number;
  noteDensity: number;
}