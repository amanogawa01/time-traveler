export interface EnvelopeSettings {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export class Envelope {
  public amplitude(
    time: number,
    duration: number,
    settings: EnvelopeSettings
  ): number {
    const {
      attack,
      decay,
      sustain,
      release
    } = settings;

    if (time < 0) {
      return 0;
    }

    if (time < attack) {
      return time / attack;
    }

    if (time < attack + decay) {
      const decayProgress =
        (time - attack) / decay;

      return (
        1 -
        decayProgress *
          (1 - sustain)
      );
    }

    const releaseStart =
      Math.max(
        attack + decay,
        duration - release
      );

    if (time < releaseStart) {
      return sustain;
    }

    if (time < duration) {
      const releaseProgress =
        (time - releaseStart) /
        Math.max(
          duration - releaseStart,
          0.0001
        );

      return (
        sustain *
        (1 - releaseProgress)
      );
    }

    return 0;
  }
}