import type { MusicEvent } from "../music/MusicEvent.js";
import { Oscillator } from "./Oscillator.js";
import {
  Envelope,
  type EnvelopeSettings
} from "./Envelope.js";

export interface SynthesizerOptions {
  sampleRate: number;
}

export class Synthesizer {
  private readonly oscillator =
    new Oscillator();

  private readonly envelope =
    new Envelope();

  public render(
    events: MusicEvent[],
    options: SynthesizerOptions = {
      sampleRate: 44100
    }
  ): Float32Array {
    if (events.length === 0) {
      return new Float32Array();
    }

    const totalDuration =
      Math.max(
        ...events.map(
          event =>
            event.startTime +
            event.duration
        )
      );

    const totalSamples =
      Math.ceil(
        totalDuration *
        options.sampleRate
      );

    const output =
      new Float32Array(totalSamples);

    for (const event of events) {
      this.renderEvent(
        output,
        event,
        options.sampleRate
      );
    }

    this.applyMasterGain(output);
    this.softClip(output);

    return output;
  }

  private renderEvent(
    output: Float32Array,
    event: MusicEvent,
    sampleRate: number
  ): void {
    const startSample =
      Math.floor(
        event.startTime *
        sampleRate
      );

    const eventSamples =
      Math.ceil(
        event.duration *
        sampleRate
      );

    const envelopeSettings =
      this.getEnvelopeForLayer(
        event.layer
      );

    for (
      let index = 0;
      index < eventSamples;
      index += 1
    ) {
      const outputIndex =
        startSample + index;

      if (outputIndex >= output.length) {
        break;
      }

      const time =
        index / sampleRate;

      const timbreSample =
        this.getTimbreSample(
          event,
          time
        );

      const envelopeAmplitude =
        this.envelope.amplitude(
          time,
          event.duration,
          envelopeSettings
        );

      const layerGain =
        this.getLayerGain(
          event.layer
        );

      output[outputIndex] +=
        timbreSample *
        event.amplitude *
        envelopeAmplitude *
        layerGain;
    }
  }

  private getTimbreSample(
    event: MusicEvent,
    time: number
  ): number {
    switch (event.layer) {
      case "melody": {
        const primary =
          this.oscillator.sample(
            event.waveform,
            event.frequency,
            time
          );

        const sine =
          this.oscillator.sample(
            "sine",
            event.frequency,
            time
          );

        return (
          primary * 0.7 +
          sine * 0.3
        );
      }

      case "bass": {
        const sine =
          this.oscillator.sample(
            "sine",
            event.frequency,
            time
          );

        const triangle =
          this.oscillator.sample(
            "triangle",
            event.frequency,
            time
          );

        return (
          sine * 0.85 +
          triangle * 0.15
        );
      }

      case "pad": {
        const sine =
          this.oscillator.sample(
            "sine",
            event.frequency,
            time
          );

        const triangle =
          this.oscillator.sample(
            "triangle",
            event.frequency,
            time
          );

        return (
          sine * 0.6 +
          triangle * 0.4
        );
      }
    }
  }

  private getEnvelopeForLayer(
    layer: MusicEvent["layer"]
  ): EnvelopeSettings {
    switch (layer) {
      case "melody":
        return {
          attack: 0.02,
          decay: 0.12,
          sustain: 0.6,
          release: 0.2
        };

      case "bass":
        return {
          attack: 0.08,
          decay: 0.2,
          sustain: 0.8,
          release: 0.35
        };

      case "pad":
        return {
          attack: 0.35,
          decay: 0.25,
          sustain: 0.65,
          release: 0.6
        };
    }
  }

  private getLayerGain(
    layer: MusicEvent["layer"]
  ): number {
    switch (layer) {
      case "melody":
        return 0.9;

      case "bass":
        return 0.7;

      case "pad":
        return 0.3;
    }
  }

  private applyMasterGain(
    samples: Float32Array
  ): void {
    const masterGain = 0.85;

    for (
      let index = 0;
      index < samples.length;
      index += 1
    ) {
      samples[index] *=
        masterGain;
    }
  }

  private softClip(
    samples: Float32Array
  ): void {
    for (
      let index = 0;
      index < samples.length;
      index += 1
    ) {
      samples[index] =
        Math.tanh(
          samples[index]
        );
    }
  }
}