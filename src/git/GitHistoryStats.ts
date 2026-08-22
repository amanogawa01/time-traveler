export interface GitHistoryStats {
  commitCount: number;

  totalInsertions: number;
  totalDeletions: number;
  totalFilesChanged: number;

  totalLinesChanged: number;

  averageInsertionsPerCommit: number;
  averageDeletionsPerCommit: number;
  averageFilesChangedPerCommit: number;
  averageLinesChangedPerCommit: number;

  repositoryAgeDays: number;
  commitsPerDay: number;

  busiestHour: number | null;

  churnRatio: number;
}