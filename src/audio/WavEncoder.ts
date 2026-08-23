import type { StereoBuffer } from "./StereoBuffer.js";

export interface WavEncoderOptions {
  sampleRate: number;
}

export class WavEncoder {
  public encode(
    stereo: StereoBuffer,
    options: WavEncoderOptions = {
      sampleRate: 44100
    }
  ): Buffer {
    if (
      stereo.left.length !==
      stereo.right.length
    ) {
      throw new Error(
        "Left and right channels must have the same length."
      );
    }

    const channels = 2;
    const bitsPerSample = 16;

    const bytesPerSample =
      bitsPerSample / 8;

    const frameCount =
      stereo.left.length;

    const dataSize =
      frameCount *
      channels *
      bytesPerSample;

    const buffer =
      Buffer.alloc(
        44 + dataSize
      );

    buffer.write(
      "RIFF",
      0
    );

    buffer.writeUInt32LE(
      36 + dataSize,
      4
    );

    buffer.write(
      "WAVE",
      8
    );

    buffer.write(
      "fmt ",
      12
    );

    buffer.writeUInt32LE(
      16,
      16
    );

    buffer.writeUInt16LE(
      1,
      20
    );

    buffer.writeUInt16LE(
      channels,
      22
    );

    buffer.writeUInt32LE(
      options.sampleRate,
      24
    );

    const byteRate =
      options.sampleRate *
      channels *
      bytesPerSample;

    buffer.writeUInt32LE(
      byteRate,
      28
    );

    const blockAlign =
      channels *
      bytesPerSample;

    buffer.writeUInt16LE(
      blockAlign,
      32
    );

    buffer.writeUInt16LE(
      bitsPerSample,
      34
    );

    buffer.write(
      "data",
      36
    );

    buffer.writeUInt32LE(
      dataSize,
      40
    );

    let offset = 44;

    for (
      let index = 0;
      index < frameCount;
      index += 1
    ) {
      const leftSample =
        this.floatToInt16(
          stereo.left[index] ?? 0
        );

      const rightSample =
        this.floatToInt16(
          stereo.right[index] ?? 0
        );

      buffer.writeInt16LE(
        leftSample,
        offset
      );

      offset += 2;

      buffer.writeInt16LE(
        rightSample,
        offset
      );

      offset += 2;
    }

    return buffer;
  }

  private floatToInt16(
    sample: number
  ): number {
    const clamped =
      Math.max(
        -1,
        Math.min(
          1,
          sample
        )
      );

    if (clamped < 0) {
      return Math.round(
        clamped *
        32768
      );
    }

    return Math.round(
      clamped *
      32767
    );
  }
}