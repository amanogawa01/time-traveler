import {
  execFile,
  spawn
} from "node:child_process";
import { promisify } from "node:util";

const execFileAsync =
  promisify(execFile);

export class GitRepository {
  public constructor(
    private readonly workingDirectory: string
  ) {}

  public async isRepository(): Promise<boolean> {
    try {
      await execFileAsync(
        "git",
        [
          "rev-parse",
          "--is-inside-work-tree"
        ],
        {
          cwd: this.workingDirectory
        }
      );

      return true;
    } catch {
      return false;
    }
  }

  public async hasCommits(): Promise<boolean> {
    try {
      await execFileAsync(
        "git",
        [
          "rev-parse",
          "--verify",
          "HEAD"
        ],
        {
          cwd: this.workingDirectory
        }
      );

      return true;
    } catch {
      return false;
    }
  }

  public async getCurrentBranch(): Promise<string> {
    const { stdout } =
      await execFileAsync(
        "git",
        [
          "branch",
          "--show-current"
        ],
        {
          cwd: this.workingDirectory
        }
      );

    const branch =
      stdout.trim();

    if (branch.length > 0) {
      return branch;
    }

    const { stdout: shortHash } =
      await execFileAsync(
        "git",
        [
          "rev-parse",
          "--short",
          "HEAD"
        ],
        {
          cwd: this.workingDirectory
        }
      );

    return `detached-${shortHash.trim()}`;
  }

  public async branchExists(
    branch: string
  ): Promise<boolean> {
    try {
      await execFileAsync(
        "git",
        [
          "show-ref",
          "--verify",
          "--quiet",
          `refs/heads/${branch}`
        ],
        {
          cwd: this.workingDirectory
        }
      );

      return true;
    } catch {
      return false;
    }
  }
  public async *streamHistory(
    branch?: string
  ): AsyncGenerator<string> {
    const args =
      this.createLogArguments(
        branch
      );

    const git =
      spawn(
        "git",
        args,
        {
          cwd:
            this.workingDirectory,
          stdio: [
            "ignore",
            "pipe",
            "pipe"
          ]
        }
      );

    let stderr = "";

    git.stderr.setEncoding(
      "utf8"
    );

    git.stderr.on(
      "data",
      (chunk: string) => {
        stderr += chunk;
      }
    );

    const exitPromise =
      new Promise<number | null>(
        (
          resolve,
          reject
        ) => {
          git.on(
            "error",
            reject
          );

          git.on(
            "close",
            resolve
          );
        }
      );

    git.stdout.setEncoding(
      "utf8"
    );

    for await (
      const chunk
      of git.stdout
    ) {
      yield chunk;
    }

    const exitCode =
      await exitPromise;

    if (exitCode !== 0) {
      throw new Error(
        stderr ||
          `Git exited with code ${exitCode}.`
      );
    }
  }

  private createLogArguments(
    branch?: string
  ): string[] {
    const args = [
      "log",
      "--format=%H%x1f%an%x1f%ae%x1f%aI%x1f%s",
      "--numstat"
    ];

    if (branch !== undefined) {
      args.push(
        `refs/heads/${branch}`
      );
    }

    return args;
  }
}