import { describe, expect, it } from "vitest";
import type { GitCommit } from "../../src/git/GitCommit.js";
import { MusicComposer } from "../../src/music/MusicComposer.js";
import type { MusicProfile } from "../../src/music/MusicProfile.js";

describe("MusicComposer", () => {
  const composer =
    new MusicComposer();

  const profile: MusicProfile = {
    tempo: 120,
    rootNote: "C",
    scale: "major",
    waveform: "triangle",
    intensity: 0.5,
    dissonance: 0.2,
    noteDensity: 0.4
  };

  function createCommit(
    overrides: Partial<GitCommit> = {}
  ): GitCommit {
    return {
      hash: "abcdef1234567890",
      authorName: "Test Author",
      authorEmail: "test@example.com",
      date: new Date(
        "2026-01-01T12:00:00Z"
      ),
      message: "Test commit",
      insertions: 10,
      deletions: 2,
      filesChanged: 1,
      ...overrides
    };
  }

  it("returns an empty array for no commits", () => {
    const events =
      composer.compose(
        profile,
        []
      );

    expect(events).toEqual([]);
  });

  it("creates five events for one commit", () => {
    const commits = [
      createCommit()
    ];

    const events =
      composer.compose(
        profile,
        commits
      );

    expect(events).toHaveLength(5);
  });

  it("creates one melody event per commit", () => {
    const commits = [
      createCommit()
    ];

    const events =
      composer.compose(
        profile,
        commits
      );

    const melodyEvents =
      events.filter(
        event =>
          event.layer ===
          "melody"
      );

    expect(
      melodyEvents
    ).toHaveLength(1);
  });

  it("creates one bass event per commit", () => {
    const commits = [
      createCommit()
    ];

    const events =
      composer.compose(
        profile,
        commits
      );

    const bassEvents =
      events.filter(
        event =>
          event.layer ===
          "bass"
      );

    expect(
      bassEvents
    ).toHaveLength(1);
  });

  it("creates three pad events per commit", () => {
    const commits = [
      createCommit()
    ];

    const events =
      composer.compose(
        profile,
        commits
      );

    const padEvents =
      events.filter(
        event =>
          event.layer ===
          "pad"
      );

    expect(
      padEvents
    ).toHaveLength(3);
  });

  it("creates five events per commit for multiple commits", () => {
    const commits = [
      createCommit({
        hash: "commit-1",
        date: new Date(
          "2026-01-01T12:00:00Z"
        )
      }),
      createCommit({
        hash: "commit-2",
        date: new Date(
          "2026-01-02T12:00:00Z"
        )
      })
    ];

    const events =
      composer.compose(
        profile,
        commits
      );

    expect(events).toHaveLength(10);
  });

  it("associates events with their commit hash", () => {
    const commit =
      createCommit({
        hash:
          "1234567890abcdef"
      });

    const events =
      composer.compose(
        profile,
        [commit]
      );

    for (
      const event
      of events
    ) {
      expect(
        event.commitHash
      ).toBe(
        commit.hash
      );
    }
  });

  it("uses the profile waveform for melody", () => {
    const events =
      composer.compose(
        profile,
        [
          createCommit()
        ]
      );

    const melody =
      events.find(
        event =>
          event.layer ===
          "melody"
      );

    expect(
      melody
    ).toBeDefined();

    expect(
      melody?.waveform
    ).toBe(
      profile.waveform
    );
  });

  it("uses sine waveforms for bass and pad layers", () => {
    const events =
      composer.compose(
        profile,
        [
          createCommit()
        ]
      );

    const nonMelodyEvents =
      events.filter(
        event =>
          event.layer !==
          "melody"
      );

    for (
      const event
      of nonMelodyEvents
    ) {
      expect(
        event.waveform
      ).toBe("sine");
    }
  });

  it("creates three distinct pad frequencies", () => {
    const events =
      composer.compose(
        profile,
        [
          createCommit()
        ]
      );

    const padFrequencies =
      events
        .filter(
          event =>
            event.layer ===
            "pad"
        )
        .map(
          event =>
            event.frequency
        );

    const uniqueFrequencies =
      new Set(
        padFrequencies
      );

    expect(
      uniqueFrequencies.size
    ).toBe(3);
  });

  it("sorts commits chronologically before composing", () => {
    const laterCommit =
      createCommit({
        hash: "later",
        date: new Date(
          "2026-01-03T12:00:00Z"
        )
      });

    const earlierCommit =
      createCommit({
        hash: "earlier",
        date: new Date(
          "2026-01-01T12:00:00Z"
        )
      });

    const events =
      composer.compose(
        profile,
        [
          laterCommit,
          earlierCommit
        ]
      );

    const melodyEvents =
      events.filter(
        event =>
          event.layer ===
          "melody"
      );

    expect(
      melodyEvents[0]
        ?.commitHash
    ).toBe(
      "earlier"
    );

    expect(
      melodyEvents[1]
        ?.commitHash
    ).toBe(
      "later"
    );
  });

  it("starts the first commit at time zero", () => {
    const events =
      composer.compose(
        profile,
        [
          createCommit()
        ]
      );

    for (
      const event
      of events
    ) {
      expect(
        event.startTime
      ).toBe(0);
    }
  });

  it("places later commits after earlier commits", () => {
    const commits = [
      createCommit({
        hash: "first",
        date: new Date(
          "2026-01-01T12:00:00Z"
        )
      }),
      createCommit({
        hash: "second",
        date: new Date(
          "2026-01-02T12:00:00Z"
        )
      })
    ];

    const events =
      composer.compose(
        profile,
        commits
      );

    const melodyEvents =
      events.filter(
        event =>
          event.layer ===
          "melody"
      );

    expect(
      melodyEvents[0]
        ?.startTime
    ).toBe(0);

    expect(
      melodyEvents[1]
        ?.startTime
    ).toBeGreaterThan(0);
  });

  it("produces deterministic output", () => {
    const commits = [
      createCommit({
        hash: "first",
        insertions: 25,
        deletions: 5,
        filesChanged: 3
      }),
      createCommit({
        hash: "second",
        date: new Date(
          "2026-01-02T16:00:00Z"
        ),
        insertions: 100,
        deletions: 40,
        filesChanged: 8
      })
    ];

    const first =
      composer.compose(
        profile,
        commits
      );

    const second =
      composer.compose(
        profile,
        commits
      );

    expect(
      second
    ).toEqual(
      first
    );
  });

  it("makes larger commits louder", () => {
    const commits = [
      createCommit({
        hash: "small",
        insertions: 1,
        deletions: 0,
        filesChanged: 1,
        date: new Date(
          "2026-01-01T12:00:00Z"
        )
      }),
      createCommit({
        hash: "large",
        insertions: 1000,
        deletions: 100,
        filesChanged: 1,
        date: new Date(
          "2026-01-02T12:00:00Z"
        )
      })
    ];

    const events =
      composer.compose(
        profile,
        commits
      );

    const smallMelody =
      events.find(
        event =>
          event.layer ===
            "melody" &&
          event.commitHash ===
            "small"
      );

    const largeMelody =
      events.find(
        event =>
          event.layer ===
            "melody" &&
          event.commitHash ===
            "large"
      );

    expect(
      smallMelody
    ).toBeDefined();

    expect(
      largeMelody
    ).toBeDefined();

    expect(
      largeMelody!.amplitude
    ).toBeGreaterThan(
      smallMelody!.amplitude
    );
  });

  it("gives commits touching more files longer melody durations", () => {
    const commits = [
      createCommit({
        hash: "simple",
        filesChanged: 1,
        date: new Date(
          "2026-01-01T12:00:00Z"
        )
      }),
      createCommit({
        hash: "complex",
        filesChanged: 100,
        date: new Date(
          "2026-01-02T12:00:00Z"
        )
      })
    ];

    const events =
      composer.compose(
        profile,
        commits
      );

    const simpleMelody =
      events.find(
        event =>
          event.layer ===
            "melody" &&
          event.commitHash ===
            "simple"
      );

    const complexMelody =
      events.find(
        event =>
          event.layer ===
            "melody" &&
          event.commitHash ===
            "complex"
      );

    expect(
      simpleMelody
    ).toBeDefined();

    expect(
      complexMelody
    ).toBeDefined();

    expect(
      complexMelody!.duration
    ).toBeGreaterThan(
      simpleMelody!.duration
    );
  });

  it("does not aggregate histories with 1000 commits or fewer", () => {
    const commits =
      Array.from(
        {
          length: 1000
        },
        (
          _,
          index
        ) =>
          createCommit({
            hash:
              `commit-${index}`,
            date:
              new Date(
                Date.UTC(
                  2026,
                  0,
                  1,
                  0,
                  index
                )
              )
          })
      );

    const events =
      composer.compose(
        profile,
        commits
      );

    expect(
      events
    ).toHaveLength(
      1000 * 5
    );
  });

  it("aggregates histories larger than 1000 commits", () => {
    const commits =
      Array.from(
        {
          length: 10_000
        },
        (
          _,
          index
        ) =>
          createCommit({
            hash:
              `commit-${index}`,
            date:
              new Date(
                Date.UTC(
                  2026,
                  0,
                  1,
                  0,
                  index
                )
              ),
            insertions: 10,
            deletions: 2,
            filesChanged: 1
          })
      );

    const events =
      composer.compose(
        profile,
        commits
      );

    expect(
      events.length
    ).toBeLessThan(
      10_000 * 5
    );

    expect(
      events.length % 5
    ).toBe(0);
  });

  it("keeps large-history composition deterministic", () => {
    const commits =
      Array.from(
        {
          length: 5000
        },
        (
          _,
          index
        ) =>
          createCommit({
            hash:
              `commit-${index}`,
            date:
              new Date(
                Date.UTC(
                  2026,
                  0,
                  1,
                  0,
                  index
                )
              ),
            insertions:
              index % 50,
            deletions:
              index % 20,
            filesChanged:
              (
                index %
                10
              ) + 1
          })
      );

    const first =
      composer.compose(
        profile,
        commits
      );

    const second =
      composer.compose(
        profile,
        commits
      );

    expect(
      second
    ).toEqual(
      first
    );
  });
});