import {
  describe,
  expect,
  it
} from "vitest";

import { WavEncoder } from "../../src/audio/WavEncoder.js";
import type { StereoBuffer } from "../../src/audio/StereoBuffer.js";

function createStereoBuffer(): StereoBuffer {
  return {
    left: new Float32Array([
      0,
      0.5,
      -0.5
    ]),
    right: new Float32Array([
      0,
      -0.5,
      0.5
    ])
  };
}

describe(
  "WavEncoder",
  () => {
    it(
      "writes a RIFF WAV header",
      () => {
        const encoder =
          new WavEncoder();

        const wav =
          encoder.encode(
            createStereoBuffer()
          );

        expect(
          wav.toString(
            "ascii",
            0,
            4
          )
        ).toBe("RIFF");

        expect(
          wav.toString(
            "ascii",
            8,
            12
          )
        ).toBe("WAVE");
      }
    );

    it(
      "writes the fmt chunk",
      () => {
        const encoder =
          new WavEncoder();

        const wav =
          encoder.encode(
            createStereoBuffer()
          );

        expect(
          wav.toString(
            "ascii",
            12,
            16
          )
        ).toBe("fmt ");
      }
    );

    it(
      "writes PCM format",
      () => {
        const encoder =
          new WavEncoder();

        const wav =
          encoder.encode(
            createStereoBuffer()
          );

        const audioFormat =
          wav.readUInt16LE(20);

        expect(
          audioFormat
        ).toBe(1);
      }
    );

    it(
      "writes two audio channels",
      () => {
        const encoder =
          new WavEncoder();

        const wav =
          encoder.encode(
            createStereoBuffer()
          );

        const channels =
          wav.readUInt16LE(22);

        expect(
          channels
        ).toBe(2);
      }
    );

    it(
      "writes the default sample rate",
      () => {
        const encoder =
          new WavEncoder();

        const wav =
          encoder.encode(
            createStereoBuffer()
          );

        const sampleRate =
          wav.readUInt32LE(24);

        expect(
          sampleRate
        ).toBe(44100);
      }
    );

    it(
      "writes a custom sample rate",
      () => {
        const encoder =
          new WavEncoder();

        const wav =
          encoder.encode(
            createStereoBuffer(),
            {
              sampleRate: 48000
            }
          );

        const sampleRate =
          wav.readUInt32LE(24);

        expect(
          sampleRate
        ).toBe(48000);
      }
    );

    it(
      "writes 16-bit audio",
      () => {
        const encoder =
          new WavEncoder();

        const wav =
          encoder.encode(
            createStereoBuffer()
          );

        const bitsPerSample =
          wav.readUInt16LE(34);

        expect(
          bitsPerSample
        ).toBe(16);
      }
    );

    it(
      "writes the data chunk",
      () => {
        const encoder =
          new WavEncoder();

        const wav =
          encoder.encode(
            createStereoBuffer()
          );

        expect(
          wav.toString(
            "ascii",
            36,
            40
          )
        ).toBe("data");
      }
    );

    it(
      "writes the correct data size",
      () => {
        const encoder =
          new WavEncoder();

        const stereo =
          createStereoBuffer();

        const wav =
          encoder.encode(
            stereo
          );

        const dataSize =
          wav.readUInt32LE(40);

        const expectedDataSize =
          stereo.left.length *
          2 *
          2;

        expect(
          dataSize
        ).toBe(
          expectedDataSize
        );
      }
    );

    it(
      "writes the correct total file size",
      () => {
        const encoder =
          new WavEncoder();

        const stereo =
          createStereoBuffer();

        const wav =
          encoder.encode(
            stereo
          );

        const expectedDataSize =
          stereo.left.length *
          2 *
          2;

        expect(
          wav.length
        ).toBe(
          44 +
          expectedDataSize
        );
      }
    );

    it(
      "interleaves left and right samples",
      () => {
        const encoder =
          new WavEncoder();

        const stereo: StereoBuffer = {
          left:
            new Float32Array([
              0.5
            ]),
          right:
            new Float32Array([
              -0.5
            ])
        };

        const wav =
          encoder.encode(
            stereo
          );

        const leftSample =
          wav.readInt16LE(44);

        const rightSample =
          wav.readInt16LE(46);

        expect(
          leftSample
        ).toBeGreaterThan(0);

        expect(
          rightSample
        ).toBeLessThan(0);
      }
    );

    it(
      "clamps samples above one",
      () => {
        const encoder =
          new WavEncoder();

        const stereo: StereoBuffer = {
          left:
            new Float32Array([
              2
            ]),
          right:
            new Float32Array([
              2
            ])
        };

        const wav =
          encoder.encode(
            stereo
          );

        expect(
          wav.readInt16LE(44)
        ).toBe(32767);

        expect(
          wav.readInt16LE(46)
        ).toBe(32767);
      }
    );

    it(
      "clamps samples below negative one",
      () => {
        const encoder =
          new WavEncoder();

        const stereo: StereoBuffer = {
          left:
            new Float32Array([
              -2
            ]),
          right:
            new Float32Array([
              -2
            ])
        };

        const wav =
          encoder.encode(
            stereo
          );

        expect(
          wav.readInt16LE(44)
        ).toBe(-32768);

        expect(
          wav.readInt16LE(46)
        ).toBe(-32768);
      }
    );

    it(
      "rejects mismatched channel lengths",
      () => {
        const encoder =
          new WavEncoder();

        const stereo: StereoBuffer = {
          left:
            new Float32Array([
              0,
              0
            ]),
          right:
            new Float32Array([
              0
            ])
        };

        expect(
          () =>
            encoder.encode(
              stereo
            )
        ).toThrow(
          "Left and right channels must have the same length."
        );
      }
    );
  }
);