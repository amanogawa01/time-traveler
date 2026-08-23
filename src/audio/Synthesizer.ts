import type { MusicEvent } from "../music/MusicEvent.js";
import { Oscillator } from "./Oscillator.js";
import {
  Envelope,
  type EnvelopeSettings
} from "./Envelope.js";
import { LowPassFilter } from "./LowPassFilter.js";
import type { StereoBuffer } from "./StereoBuffer.js";

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
  ): StereoBuffer {
    if (events.length === 0) {
      return {
        left: new Float32Array(),
        right: new Float32Array()
      };
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

    const left =
      new Float32Array(
        totalSamples
      );

    const right =
      new Float32Array(
        totalSamples
      );

    for (const event of events) {
      this.renderEvent(
        left,
        right,
        event,
        options.sampleRate
      );
    }

    this.applyMasterGain(
      left,
      right
    );

    this.softClip(left);
    this.softClip(right);

    return {
      left,
      right
    };
  }

  private renderEvent(
    left: Float32Array,
    right: Float32Array,
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

    const cutoffFrequency =
      this.getCutoffFrequency(
        event.layer
      );

    const leftFilter =
      new LowPassFilter();

    const rightFilter =
      new LowPassFilter();

    const pan =
      this.getPan(event);

    const {
      leftGain,
      rightGain
    } =
      this.calculatePanGains(pan);

    for (
      let index = 0;
      index < eventSamples;
      index += 1
    ) {
      const outputIndex =
        startSample +
        index;

      if (
        outputIndex >=
        left.length
      ) {
        break;
      }

      const time =
        index /
        sampleRate;

      const timbreSample =
        this.getTimbreSample(
          event,
          time
        );

      const filteredLeft =
        leftFilter.process(
          timbreSample,
          cutoffFrequency,
          sampleRate
        );

      const filteredRight =
        rightFilter.process(
          timbreSample,
          cutoffFrequency,
          sampleRate
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

      const sample =
        event.amplitude *
        envelopeAmplitude *
        layerGain;

      left[outputIndex] +=
        filteredLeft *
        sample *
        leftGain;

      right[outputIndex] +=
        filteredRight *
        sample *
        rightGain;
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

  private getPan(
    event: MusicEvent
  ): number {
    switch (event.layer) {
      case "bass":
        return 0;

      case "melody":
        return this.getMelodyPan(
          event.frequency
        );

      case "pad":
        return this.getPadPan(
          event.frequency
        );
    }
  }

  private getMelodyPan(
    frequency: number
  ): number {
    const normalized =
      Math.min(
        1,
        Math.max(
          0,
          (frequency - 130) /
          (1046 - 130)
        )
      );

    return (
      normalized * 0.8 -
      0.4
    );
  }

  private getPadPan(
    frequency: number
  ): number {
    const normalized =
      Math.min(
        1,
        Math.max(
          0,
          (frequency - 130) /
          (1046 - 130)
        )
      );

    return (
      normalized * 1.2 -
      0.6
    );
  }

  private calculatePanGains(
    pan: number
  ): {
    leftGain: number;
    rightGain: number;
  } {
    const clampedPan =
      Math.min(
        1,
        Math.max(
          -1,
          pan
        )
      );

    const angle =
      (
        clampedPan + 1
      ) *
      Math.PI /
      4;

    return {
      leftGain:
        Math.cos(angle),

      rightGain:
        Math.sin(angle)
    };
  }

  private getCutoffFrequency(
    layer: MusicEvent["layer"]
  ): number {
    switch (layer) {
      case "melody":
        return 12000;

      case "bass":
        return 1800;

      case "pad":
        return 2500;
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
    left: Float32Array,
    right: Float32Array
  ): void {
    const masterGain =
      0.85;

    for (
      let index = 0;
      index < left.length;
      index += 1
    ) {
      left[index] *=
        masterGain;

      right[index] *=
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