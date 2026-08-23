import type { Waveform } from "./MusicProfile.js";

export type MusicLayer =
  | "melody"
  | "bass"
  | "pad";

export interface MusicEvent {
  startTime: number;
  duration: number;
  frequency: number;
  amplitude: number;
  waveform: Waveform;

  layer: MusicLayer;
  commitHash?: string;
}