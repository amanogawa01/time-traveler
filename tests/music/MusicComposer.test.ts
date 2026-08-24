import {
  describe,
  expect,
  it
} from "vitest";

import { MusicComposer } from "../../src/music/MusicComposer.js";
import type { GitCommit } from "../../src/git/GitCommit.js";
import type { MusicProfile } from "../../src/music/MusicProfile.js";

function createProfile(
  overrides: Partial<MusicProfile> = {}
): MusicProfile {
  return {
    tempo: 120,
    rootNote: "C",
    scale: "major",
    waveform: "triangle",
    intensity: 0.5,
    dissonance: 0.2,
    noteDensity: 0.5,
    ...overrides
  };
}

function createCommit(
  overrides: Partial<GitCommit> = {}
): GitCommit {
  return {
    hash: "abc123",
    authorName: "Alice",
    authorEmail: "alice@example.com",
    date: new Date(
      "2026-08-24T12:00:00Z"
    ),
    message: "Test commit",
    insertions: 10,
    deletions: 2,
    filesChanged: 2,
    ...overrides
  };
}

describe(
  "MusicComposer",
  () => {
    it(
      "returns no events when there are no commits",
      () => {
        const composer =
          new MusicComposer();

        const events =
          composer.compose(
            createProfile(),
            []
          );

        expect(events).toEqual([]);
      }
    );

    it(
      "creates five events for one commit",
      () => {
        const composer =
          new MusicComposer();

        const events =
          composer.compose(
            createProfile(),
            [
              createCommit()
            ]
          );

        expect(events).toHaveLength(5);
      }
    );

    it(
      "creates one melody, one bass, and three pad voices per commit",
      () => {
        const composer =
          new MusicComposer();

        const events =
          composer.compose(
            createProfile(),
            [
              createCommit()
            ]
          );

        const melody =
          events.filter(
            event =>
              event.layer === "melody"
          );

        const bass =
          events.filter(
            event =>
              event.layer === "bass"
          );

        const pad =
          events.filter(
            event =>
              event.layer === "pad"
          );

        expect(melody).toHaveLength(1);
        expect(bass).toHaveLength(1);
        expect(pad).toHaveLength(3);
      }
    );

    it(
      "creates five events per commit",
      () => {
        const composer =
          new MusicComposer();

        const commits = [
          createCommit({
            hash: "one"
          }),
          createCommit({
            hash: "two",
            date: new Date(
              "2026-08-24T13:00:00Z"
            )
          }),
          createCommit({
            hash: "three",
            date: new Date(
              "2026-08-24T14:00:00Z"
            )
          })
        ];

        const events =
          composer.compose(
            createProfile(),
            commits
          );

        expect(events).toHaveLength(
          15
        );
      }
    );

    it(
      "associates every generated event with its commit hash",
      () => {
        const composer =
          new MusicComposer();

        const events =
          composer.compose(
            createProfile(),
            [
              createCommit({
                hash:
                  "deadbeef"
              })
            ]
          );

        for (
          const event
          of events
        ) {
          expect(
            event.commitHash
          ).toBe(
            "deadbeef"
          );
        }
      }
    );

    it(
      "uses the profile waveform for melody events",
      () => {
        const composer =
          new MusicComposer();

        const events =
          composer.compose(
            createProfile({
              waveform:
                "sawtooth"
            }),
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
          melody?.waveform
        ).toBe(
          "sawtooth"
        );
      }
    );

    it(
      "uses sine waveforms for bass and pad events",
      () => {
        const composer =
          new MusicComposer();

        const events =
          composer.compose(
            createProfile(),
            [
              createCommit()
            ]
          );

        const supportingEvents =
          events.filter(
            event =>
              event.layer !==
              "melody"
          );

        expect(
          supportingEvents.every(
            event =>
              event.waveform ===
              "sine"
          )
        ).toBe(true);
      }
    );

    it(
      "creates three distinct pad frequencies",
      () => {
        const composer =
          new MusicComposer();

        const events =
          composer.compose(
            createProfile(),
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

        expect(
          new Set(
            padFrequencies
          ).size
        ).toBe(3);
      }
    );

    it(
      "sorts commits chronologically before composing",
      () => {
        const composer =
          new MusicComposer();

        const later =
          createCommit({
            hash: "later",
            date: new Date(
              "2026-08-24T18:00:00Z"
            )
          });

        const earlier =
          createCommit({
            hash: "earlier",
            date: new Date(
              "2026-08-24T08:00:00Z"
            )
          });

        const events =
          composer.compose(
            createProfile(),
            [
              later,
              earlier
            ]
          );

        expect(
          events[0]
            ?.commitHash
        ).toBe(
          "earlier"
        );
      }
    );

    it(
      "starts the first commit at zero seconds",
      () => {
        const composer =
          new MusicComposer();

        const events =
          composer.compose(
            createProfile(),
            [
              createCommit()
            ]
          );

        expect(
          events[0]
            ?.startTime
        ).toBe(0);
      }
    );

    it(
      "places later commits after earlier commits",
      () => {
        const composer =
          new MusicComposer();

        const first =
          createCommit({
            hash: "first",
            date: new Date(
              "2026-08-24T10:00:00Z"
            )
          });

        const second =
          createCommit({
            hash: "second",
            date: new Date(
              "2026-08-24T11:00:00Z"
            )
          });

        const events =
          composer.compose(
            createProfile(),
            [
              first,
              second
            ]
          );

        const firstEvent =
          events.find(
            event =>
              event.commitHash ===
              "first"
          );

        const secondEvent =
          events.find(
            event =>
              event.commitHash ===
              "second"
          );

        expect(
          secondEvent!.startTime
        ).toBeGreaterThan(
          firstEvent!.startTime
        );
      }
    );

    it(
      "produces deterministic output for identical input",
      () => {
        const composer =
          new MusicComposer();

        const profile =
          createProfile();

        const commits = [
          createCommit({
            hash: "one"
          }),
          createCommit({
            hash: "two",
            date: new Date(
              "2026-08-25T12:00:00Z"
            ),
            insertions: 24,
            deletions: 8,
            filesChanged: 4
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

        expect(first).toEqual(
          second
        );
      }
    );

    it(
      "makes larger commits louder than smaller commits",
      () => {
        const composer =
          new MusicComposer();

        const small =
          createCommit({
            hash: "small",
            insertions: 1,
            deletions: 0
          });

        const large =
          createCommit({
            hash: "large",
            date: new Date(
              "2026-08-24T13:00:00Z"
            ),
            insertions: 1000,
            deletions: 500
          });

        const events =
          composer.compose(
            createProfile(),
            [
              small,
              large
            ]
          );

        const smallMelody =
          events.find(
            event =>
              event.commitHash ===
                "small" &&
              event.layer ===
                "melody"
          );

        const largeMelody =
          events.find(
            event =>
              event.commitHash ===
                "large" &&
              event.layer ===
                "melody"
          );

        expect(
          largeMelody!.amplitude
        ).toBeGreaterThan(
          smallMelody!.amplitude
        );
      }
    );

    it(
      "gives commits touching more files longer melody durations",
      () => {
        const composer =
          new MusicComposer();

        const simple =
          createCommit({
            hash: "simple",
            filesChanged: 1
          });

        const complex =
          createCommit({
            hash: "complex",
            date: new Date(
              "2026-08-24T13:00:00Z"
            ),
            filesChanged: 20
          });

        const events =
          composer.compose(
            createProfile(),
            [
              simple,
              complex
            ]
          );

        const simpleMelody =
          events.find(
            event =>
              event.commitHash ===
                "simple" &&
              event.layer ===
                "melody"
          );

        const complexMelody =
          events.find(
            event =>
              event.commitHash ===
                "complex" &&
              event.layer ===
                "melody"
          );

        expect(
          complexMelody!.duration
        ).toBeGreaterThan(
          simpleMelody!.duration
        );
      }
    );
  }
);