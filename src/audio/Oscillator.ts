import type { Waveform } from "../music/MusicProfile.js";

export class Oscillator {
  public sample(
    waveform: Waveform,
    frequency: number,
    time: number
  ): number {
    switch (waveform) {
      case "sine":
        return this.sine(frequency, time);

      case "triangle":
        return this.triangle(frequency, time);

      case "sawtooth":
        return this.sawtooth(frequency, time);

      case "square":
        return this.square(frequency, time);
    }
  }

  private sine(
    frequency: number,
    time: number
  ): number {
    return Math.sin(
      2 *
      Math.PI *
      frequency *
      time
    );
  }

  private triangle(
    frequency: number,
    time: number
  ): number {
    return (
      2 /
        Math.PI *
        Math.asin(
          Math.sin(
            2 *
            Math.PI *
            frequency *
            time
          )
        )
    );
  }

  private sawtooth(
    frequency: number,
    time: number
  ): number {
    return (
      2 *
      (
        frequency * time -
        Math.floor(
          frequency * time + 0.5
        )
      )
    );
  }

  private square(
    frequency: number,
    time: number
  ): number {
    return (
      Math.sin(
        2 *
        Math.PI *
        frequency *
        time
      ) >= 0
        ? 1
        : -1
    );
  }
}