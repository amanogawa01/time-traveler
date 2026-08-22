export interface GitCommit {
  hash: string;
  authorName: string;
  authorEmail: string;
  date: Date;
  message: string;
  insertions: number;
  deletions: number;
  filesChanged: number;
}