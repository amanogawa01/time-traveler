import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class GitRepository {
  public constructor(
    private readonly workingDirectory: string
  ) {}

  public async isRepository(): Promise<boolean> {
    try {
      await execFileAsync(
        "git",
        ["rev-parse", "--is-inside-work-tree"],
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
    const { stdout } = await execFileAsync(
      "git",
      ["branch", "--show-current"],
      {
        cwd: this.workingDirectory
      }
    );

    return stdout.trim();
  }

  public async getRawHistory(): Promise<string> {
    const { stdout } = await execFileAsync(
      "git",
      [
        "log",
        "--format=%H%x1f%an%x1f%ae%x1f%aI%x1f%s",
        "--numstat"
      ],
      {
        cwd: this.workingDirectory,
        maxBuffer: 10 * 1024 * 1024
      }
    );

    return stdout;
  }
}