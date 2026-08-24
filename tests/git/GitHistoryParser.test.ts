import {
  describe,
  expect,
  it
} from "vitest";
import { GitHistoryParser } from "../../src/git/GitHistoryParser.js";

describe(
  "GitHistoryParser",
  () => {
    it(
      "parses a commit with numstat data",
      () => {
        const parser =
          new GitHistoryParser();

        const rawHistory =
          [
            [
              "abc123",
              "Alice",
              "alice@example.com",
              "2026-08-24T10:00:00Z",
              "Add feature"
            ].join("\x1f"),
            "",
            "10\t2\tsrc/index.ts",
            "5\t0\tREADME.md"
          ].join("\n");

        const commits =
          parser.parse(rawHistory);

        expect(commits).toHaveLength(1);

        expect(commits[0]).toEqual({
          hash: "abc123",
          authorName: "Alice",
          authorEmail:
            "alice@example.com",
          date: new Date(
            "2026-08-24T10:00:00Z"
          ),
          message: "Add feature",
          insertions: 15,
          deletions: 2,
          filesChanged: 2
        });
      }
    );

    it(
      "parses multiple commits",
      () => {
        const parser =
          new GitHistoryParser();

        const rawHistory =
          [
            [
              "abc123",
              "Alice",
              "alice@example.com",
              "2026-08-24T10:00:00Z",
              "First commit"
            ].join("\x1f"),
            "",
            "4\t1\tsrc/a.ts",
            [
              "def456",
              "Bob",
              "bob@example.com",
              "2026-08-24T11:00:00Z",
              "Second commit"
            ].join("\x1f"),
            "",
            "8\t3\tsrc/b.ts"
          ].join("\n");

        const commits =
          parser.parse(rawHistory);

        expect(commits).toHaveLength(2);

        expect(
          commits[0]?.hash
        ).toBe("abc123");

        expect(
          commits[1]?.hash
        ).toBe("def456");

        expect(
          commits[0]?.insertions
        ).toBe(4);

        expect(
          commits[1]?.insertions
        ).toBe(8);
      }
    );

    it(
      "handles binary files",
      () => {
        const parser =
          new GitHistoryParser();

        const rawHistory =
          [
            [
              "abc123",
              "Alice",
              "alice@example.com",
              "2026-08-24T10:00:00Z",
              "Add image"
            ].join("\x1f"),
            "",
            "-\t-\timage.png"
          ].join("\n");

        const commits =
          parser.parse(rawHistory);

        expect(commits).toHaveLength(1);

        expect(
          commits[0]?.insertions
        ).toBe(0);

        expect(
          commits[0]?.deletions
        ).toBe(0);

        expect(
          commits[0]?.filesChanged
        ).toBe(1);
      }
    );

    it(
      "preserves Unicode commit messages",
      () => {
        const parser =
          new GitHistoryParser();

        const rawHistory =
          [
            [
              "abc123",
              "Daniel",
              "daniel@example.com",
              "2026-08-24T10:00:00Z",
              "これが事件の真実だ"
            ].join("\x1f"),
            "",
            "3\t1\tsrc/index.ts"
          ].join("\n");

        const commits =
          parser.parse(rawHistory);

        expect(
          commits[0]?.message
        ).toBe(
          "これが事件の真実だ"
        );
      }
    );

    it(
      "returns an empty array for empty input",
      () => {
        const parser =
          new GitHistoryParser();

        expect(
          parser.parse("")
        ).toEqual([]);
      }
    );

    it(
      "handles Windows line endings",
      () => {
        const parser =
          new GitHistoryParser();

        const rawHistory =
          [
            [
              "abc123",
              "Alice",
              "alice@example.com",
              "2026-08-24T10:00:00Z",
              "Windows test"
            ].join("\x1f"),
            "",
            "7\t2\tsrc/index.ts"
          ].join("\r\n");

        const commits =
          parser.parse(rawHistory);

        expect(commits).toHaveLength(1);

        expect(
          commits[0]?.insertions
        ).toBe(7);

        expect(
          commits[0]?.deletions
        ).toBe(2);
      }
    );
  }
);