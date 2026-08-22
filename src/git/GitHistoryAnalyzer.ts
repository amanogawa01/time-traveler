import type { GitCommit } from "./GitCommit.js";
import type { GitHistoryStats } from "./GitHistoryStats.js";

export class GitHistoryAnalyzer {
  public analyze(commits: GitCommit[]): GitHistoryStats {
    if (commits.length === 0) {
      return {
        commitCount: 0,

        totalInsertions: 0,
        totalDeletions: 0,
        totalFilesChanged: 0,

        totalLinesChanged: 0,

        averageInsertionsPerCommit: 0,
        averageDeletionsPerCommit: 0,
        averageFilesChangedPerCommit: 0,
        averageLinesChangedPerCommit: 0,

        repositoryAgeDays: 0,
        commitsPerDay: 0,

        busiestHour: null,

        churnRatio: 0
      };
    }

    let totalInsertions = 0;
    let totalDeletions = 0;
    let totalFilesChanged = 0;

    const hourCounts = new Array<number>(24).fill(0);

    for (const commit of commits) {
      totalInsertions += commit.insertions;
      totalDeletions += commit.deletions;
      totalFilesChanged += commit.filesChanged;

      const hour = commit.date.getHours();

      hourCounts[hour] += 1;
    }

    const commitCount = commits.length;

    const totalLinesChanged =
      totalInsertions + totalDeletions;

    const averageInsertionsPerCommit =
      totalInsertions / commitCount;

    const averageDeletionsPerCommit =
      totalDeletions / commitCount;

    const averageFilesChangedPerCommit =
      totalFilesChanged / commitCount;

    const averageLinesChangedPerCommit =
      totalLinesChanged / commitCount;

    const repositoryAgeDays =
      this.calculateRepositoryAgeDays(commits);

    const commitsPerDay =
      repositoryAgeDays > 0
        ? commitCount / repositoryAgeDays
        : commitCount;

    const busiestHour =
      this.findBusiestHour(hourCounts);

    const churnRatio =
      totalLinesChanged > 0
        ? totalDeletions / totalLinesChanged
        : 0;

    return {
      commitCount,

      totalInsertions,
      totalDeletions,
      totalFilesChanged,

      totalLinesChanged,

      averageInsertionsPerCommit,
      averageDeletionsPerCommit,
      averageFilesChangedPerCommit,
      averageLinesChangedPerCommit,

      repositoryAgeDays,
      commitsPerDay,

      busiestHour,

      churnRatio
    };
  }

  private calculateRepositoryAgeDays(
    commits: GitCommit[]
  ): number {
    const timestamps = commits.map(
      commit => commit.date.getTime()
    );

    const oldest = Math.min(...timestamps);
    const newest = Math.max(...timestamps);

    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    const difference =
      newest - oldest;

    return Math.max(
      1,
      difference / millisecondsPerDay
    );
  }

  private findBusiestHour(
    hourCounts: number[]
  ): number {
    let busiestHour = 0;
    let highestCount = 0;

    for (
      let hour = 0;
      hour < hourCounts.length;
      hour += 1
    ) {
      if (hourCounts[hour] > highestCount) {
        highestCount = hourCounts[hour];
        busiestHour = hour;
      }
    }

    return busiestHour;
  }
}