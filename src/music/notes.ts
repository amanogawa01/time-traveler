const NOTE_OFFSETS: Record<string, number> = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11
};

export function noteToFrequency(
  note: string,
  octave: number
): number {
  const offset = NOTE_OFFSETS[note];

  if (offset === undefined) {
    throw new Error(`Unknown note: ${note}`);
  }

  const midiNote =
    12 * (octave + 1) + offset;

  return 440 *
    Math.pow(
      2,
      (midiNote - 69) / 12
    );
}