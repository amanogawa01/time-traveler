import {
  describe,
  expect,
  it
} from "vitest";

import { MusicMapper } from "../../src/music/MusicMapper.js";
import type { GitHistoryStats } from "../../src/git/GitHistoryStats.js";

function createStats(
  overrides: Partial<GitHistoryStats> = {}
): GitHistoryStats {
  return {
    commitCount: 10,
    totalInsertions: 100,
    totalDeletions: 20,
    totalFilesChanged: 30,
    totalLinesChanged: 120,
    averageInsertionsPerCommit: 10,
    averageDeletionsPerCommit: 2,
    averageFilesChangedPerCommit: 3,
    averageLinesChangedPerCommit: 12,
    repositoryAgeDays: 10,
    commitsPerDay: 1,
    busiestHour: 12,
    churnRatio: 0.1,
    ...overrides
  };
}

describe(
  "MusicMapper",
  () => {
    it(
      "maps low repository activity to a slower tempo",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              commitsPerDay: 0
            })
          );

        expect(
          profile.tempo
        ).toBe(50);
      }
    );

    it(
      "maps high repository activity to the maximum tempo",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              commitsPerDay: 10
            })
          );

        expect(
          profile.tempo
        ).toBe(150);
      }
    );

    it(
      "clamps activity above the expected range",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              commitsPerDay: 100
            })
          );

        expect(
          profile.tempo
        ).toBe(150);
      }
    );

    it(
      "maps average lines changed to intensity",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              averageLinesChangedPerCommit:
                500
            })
          );

        expect(
          profile.intensity
        ).toBeCloseTo(
          0.5
        );
      }
    );

    it(
      "maps churn ratio to dissonance",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              churnRatio: 0.42
            })
          );

        expect(
          profile.dissonance
        ).toBeCloseTo(
          0.42
        );
      }
    );

    it(
      "maps files changed per commit to note density",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              averageFilesChangedPerCommit:
                10
            })
          );

        expect(
          profile.noteDensity
        ).toBeCloseTo(
          0.5
        );
      }
    );

    it(
      "uses a major scale for low churn",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              churnRatio: 0.1
            })
          );

        expect(
          profile.scale
        ).toBe("major");
      }
    );

    it(
      "uses mixolydian for moderate-low churn",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              churnRatio: 0.2
            })
          );

        expect(
          profile.scale
        ).toBe("mixolydian");
      }
    );

    it(
      "uses dorian for moderate churn",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              churnRatio: 0.4
            })
          );

        expect(
          profile.scale
        ).toBe("dorian");
      }
    );

    it(
      "uses minor for high churn",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              churnRatio: 0.6
            })
          );

        expect(
          profile.scale
        ).toBe("minor");
      }
    );

    it(
      "uses sine for low intensity",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              averageLinesChangedPerCommit:
                100
            })
          );

        expect(
          profile.waveform
        ).toBe("sine");
      }
    );

    it(
      "uses triangle for moderate-low intensity",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              averageLinesChangedPerCommit:
                300
            })
          );

        expect(
          profile.waveform
        ).toBe("triangle");
      }
    );

    it(
      "uses square for moderate-high intensity",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              averageLinesChangedPerCommit:
                600
            })
          );

        expect(
          profile.waveform
        ).toBe("square");
      }
    );

    it(
      "uses sawtooth for high intensity",
      () => {
        const mapper =
          new MusicMapper();

        const profile =
          mapper.createProfile(
            createStats({
              averageLinesChangedPerCommit:
                800
            })
          );

        expect(
          profile.waveform
        ).toBe("sawtooth");
      }
    );

    it(
      "maps busiest hour deterministically to a root note",
      () => {
        const mapper =
          new MusicMapper();

        const first =
          mapper.createProfile(
            createStats({
              busiestHour: 12
            })
          );

        const second =
          mapper.createProfile(
            createStats({
              busiestHour: 12
            })
          );

        expect(
          first.rootNote
        ).toBe(
          second.rootNote
        );
      }
    );
  }
);