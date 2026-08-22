import type { Waveform } from "./MusicProfile.js";

export interface MusicEvent {
  startTime: number;
  duration: number;
  frequency: number;
  amplitude: number;
  waveform: Waveform;

  commitHash?: string;
}