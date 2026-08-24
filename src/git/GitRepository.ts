import { execFile, spawn } from "node:child_process";
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

    return stdout.trim();
  }

  public async branchExists(
    branch: string
  ): Promise<boolean> {
    try {
      await execFileAsync(
        "git",
        [
          "rev-parse",
          "--verify",
          branch
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

  public async getRawHistory(
    branch?: string
  ): Promise<string> {
    const args = [
      "log",
      "--format=%H%x1f%an%x1f%ae%x1f%aI%x1f%s",
      "--numstat"
    ];

    if (branch !== undefined) {
      args.push(branch);
    }

    return new Promise(
      (resolve, reject) => {
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

        const stdoutChunks:
          Buffer[] = [];

        const stderrChunks:
          Buffer[] = [];

        git.stdout.on(
          "data",
          (chunk: Buffer) => {
            stdoutChunks.push(
              chunk
            );
          }
        );

        git.stderr.on(
          "data",
          (chunk: Buffer) => {
            stderrChunks.push(
              chunk
            );
          }
        );

        git.on(
          "error",
          error => {
            reject(error);
          }
        );

        git.on(
          "close",
          code => {
            if (code !== 0) {
              const stderr =
                Buffer.concat(
                  stderrChunks
                ).toString(
                  "utf8"
                );

              reject(
                new Error(
                  stderr ||
                    `Git exited with code ${code}.`
                )
              );

              return;
            }

            const stdout =
              Buffer.concat(
                stdoutChunks
              ).toString(
                "utf8"
              );

            resolve(stdout);
          }
        );
      }
    );
  }
}