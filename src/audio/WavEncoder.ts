export class WavEncoder {
  public encode(
    samples: Float32Array,
    sampleRate = 44100
  ): Buffer {
    const bytesPerSample = 2;
    const channelCount = 1;

    const dataSize =
      samples.length *
      bytesPerSample;

    const buffer =
      Buffer.alloc(
        44 + dataSize
      );

    let offset = 0;

    buffer.write(
      "RIFF",
      offset
    );
    offset += 4;

    buffer.writeUInt32LE(
      36 + dataSize,
      offset
    );
    offset += 4;

    buffer.write(
      "WAVE",
      offset
    );
    offset += 4;

    buffer.write(
      "fmt ",
      offset
    );
    offset += 4;

    buffer.writeUInt32LE(
      16,
      offset
    );
    offset += 4;

    buffer.writeUInt16LE(
      1,
      offset
    );
    offset += 2;

    buffer.writeUInt16LE(
      channelCount,
      offset
    );
    offset += 2;

    buffer.writeUInt32LE(
      sampleRate,
      offset
    );
    offset += 4;

    buffer.writeUInt32LE(
      sampleRate *
        channelCount *
        bytesPerSample,
      offset
    );
    offset += 4;

    buffer.writeUInt16LE(
      channelCount *
        bytesPerSample,
      offset
    );
    offset += 2;

    buffer.writeUInt16LE(
      16,
      offset
    );
    offset += 2;

    buffer.write(
      "data",
      offset
    );
    offset += 4;

    buffer.writeUInt32LE(
      dataSize,
      offset
    );
    offset += 4;

    for (const sample of samples) {
      const clamped =
        Math.max(
          -1,
          Math.min(
            1,
            sample
          )
        );

      const pcm =
        clamped < 0
          ? Math.round(
              clamped *
              32768
            )
          : Math.round(
              clamped *
              32767
            );

      buffer.writeInt16LE(
        pcm,
        offset
      );

      offset += 2;
    }

    return buffer;
  }
}