import type { GitCommit } from "./GitCommit.js";

const FIELD_SEPARATOR =
  "\x1f";

export class GitHistoryParser {
  public parse(
    rawHistory: string
  ): GitCommit[] {
    return this.parseLines(
      rawHistory.split(
        /\r?\n/
      )
    );
  }

  public async parseStream(
    chunks: AsyncIterable<string>
  ): Promise<GitCommit[]> {
    const commits:
      GitCommit[] = [];

    let currentCommit:
      GitCommit | null = null;

    let remainder = "";

    for await (
      const chunk
      of chunks
    ) {
      const text =
        remainder +
        chunk;

      const lines =
        text.split(
          /\r?\n/
        );

      remainder =
        lines.pop() ?? "";

      for (
        const line
        of lines
      ) {
        currentCommit =
          this.processLine(
            line,
            currentCommit,
            commits
          );
      }
    }

    if (
      remainder.length > 0
    ) {
      currentCommit =
        this.processLine(
          remainder,
          currentCommit,
          commits
        );
    }

    if (
      currentCommit !== null
    ) {
      commits.push(
        currentCommit
      );
    }

    return commits;
  }

  private parseLines(
    lines: string[]
  ): GitCommit[] {
    const commits:
      GitCommit[] = [];

    let currentCommit:
      GitCommit | null = null;

    for (
      const line
      of lines
    ) {
      currentCommit =
        this.processLine(
          line,
          currentCommit,
          commits
        );
    }

    if (
      currentCommit !== null
    ) {
      commits.push(
        currentCommit
      );
    }

    return commits;
  }

  private processLine(
    line: string,
    currentCommit: GitCommit | null,
    commits: GitCommit[]
  ): GitCommit | null {
    if (
      line.includes(
        FIELD_SEPARATOR
      )
    ) {
      if (
        currentCommit !== null
      ) {
        commits.push(
          currentCommit
        );
      }

      const fields =
        line.split(
          FIELD_SEPARATOR
        );

      const [
        hash,
        authorName,
        authorEmail,
        date,
        message
      ] = fields;

      if (
        hash === undefined ||
        authorName === undefined ||
        authorEmail === undefined ||
        date === undefined ||
        message === undefined
      ) {
        return null;
      }

      return {
        hash,
        authorName,
        authorEmail,
        date:
          new Date(
            date
          ),
        message,
        insertions: 0,
        deletions: 0,
        filesChanged: 0
      };
    }

    if (
      currentCommit === null
    ) {
      return null;
    }

    if (
      line.length === 0
    ) {
      return currentCommit;
    }

    const parts =
      line.split("\t");

    if (
      parts.length < 3
    ) {
      return currentCommit;
    }

    const [
      insertionsText,
      deletionsText
    ] = parts;

    currentCommit.filesChanged +=
      1;

    if (
      insertionsText !== "-"
    ) {
      const insertions =
        Number(
          insertionsText
        );

      if (
        Number.isFinite(
          insertions
        )
      ) {
        currentCommit.insertions +=
          insertions;
      }
    }

    if (
      deletionsText !== "-"
    ) {
      const deletions =
        Number(
          deletionsText
        );

      if (
        Number.isFinite(
          deletions
        )
      ) {
        currentCommit.deletions +=
          deletions;
      }
    }

    return currentCommit;
  }
}