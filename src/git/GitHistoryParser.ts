import type { GitCommit } from "./GitCommit.js";

const FIELD_SEPARATOR = "\x1f";

export class GitHistoryParser {
  public parse(rawHistory: string): GitCommit[] {
    const lines = rawHistory.split(/\r?\n/);

    const commits: GitCommit[] = [];

    let currentCommit: GitCommit | null = null;

    for (const line of lines) {
      if (line.includes(FIELD_SEPARATOR)) {
        if (currentCommit !== null) {
          commits.push(currentCommit);
        }

        const [
          hash,
          authorName,
          authorEmail,
          date,
          message
        ] = line.split(FIELD_SEPARATOR);

        if (
          hash === undefined ||
          authorName === undefined ||
          authorEmail === undefined ||
          date === undefined ||
          message === undefined
        ) {
          continue;
        }

        currentCommit = {
          hash,
          authorName,
          authorEmail,
          date: new Date(date),
          message,
          insertions: 0,
          deletions: 0,
          filesChanged: 0
        };

        continue;
      }

      if (currentCommit === null || line.trim() === "") {
        continue;
      }

      const parts = line.split("\t");

      if (parts.length < 3) {
        continue;
      }

      const [insertionsText, deletionsText] = parts;

      currentCommit.filesChanged += 1;

      if (insertionsText !== "-") {
        currentCommit.insertions += Number(insertionsText);
      }

      if (deletionsText !== "-") {
        currentCommit.deletions += Number(deletionsText);
      }
    }

    if (currentCommit !== null) {
      commits.push(currentCommit);
    }

    return commits;
  }
}