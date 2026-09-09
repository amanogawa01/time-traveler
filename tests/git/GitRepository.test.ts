import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it
} from "vitest";
import {
  mkdtemp,
  rm,
  writeFile
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { GitRepository } from "../../src/git/GitRepository.js";

const execFileAsync =
  promisify(execFile);

describe("GitRepository", () => {
  let temporaryDirectory: string;

  beforeEach(async () => {
    temporaryDirectory =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          "time-traveler-test-"
        )
      );
  });

  afterEach(async () => {
    await rm(
      temporaryDirectory,
      {
        recursive: true,
        force: true
      }
    );
  });

  async function runGit(
    args: string[]
  ): Promise<void> {
    await execFileAsync(
      "git",
      args,
      {
        cwd: temporaryDirectory
      }
    );
  }

  async function initializeRepository(): Promise<void> {
    await runGit([
      "init"
    ]);

    await runGit([
      "config",
      "user.name",
      "Test Author"
    ]);

    await runGit([
      "config",
      "user.email",
      "test@example.com"
    ]);
  }

  async function createCommit(): Promise<void> {
    const filePath =
      path.join(
        temporaryDirectory,
        "example.txt"
      );

    await writeFile(
      filePath,
      "hello world\n",
      "utf8"
    );

    await runGit([
      "add",
      "."
    ]);

    await runGit([
      "commit",
      "-m",
      "Initial commit"
    ]);
  }

  it("detects a Git repository", async () => {
    await initializeRepository();

    const repository =
      new GitRepository(
        temporaryDirectory
      );

    expect(
      await repository.isRepository()
    ).toBe(true);
  });

  it("returns false outside a Git repository", async () => {
    const repository =
      new GitRepository(
        temporaryDirectory
      );

    expect(
      await repository.isRepository()
    ).toBe(false);
  });

  it("detects when a repository has no commits", async () => {
    await initializeRepository();

    const repository =
      new GitRepository(
        temporaryDirectory
      );

    expect(
      await repository.hasCommits()
    ).toBe(false);
  });

  it("detects when a repository has commits", async () => {
    await initializeRepository();
    await createCommit();

    const repository =
      new GitRepository(
        temporaryDirectory
      );

    expect(
      await repository.hasCommits()
    ).toBe(true);
  });

  it("returns the current branch", async () => {
    await initializeRepository();
    await createCommit();

    const repository =
      new GitRepository(
        temporaryDirectory
      );

    const expectedBranch =
      (
        await execFileAsync(
          "git",
          [
            "branch",
            "--show-current"
          ],
          {
            cwd:
              temporaryDirectory
          }
        )
      ).stdout.trim();

    expect(
      await repository.getCurrentBranch()
    ).toBe(
      expectedBranch
    );
  });

  it("detects an existing local branch", async () => {
    await initializeRepository();
    await createCommit();

    await runGit([
      "branch",
      "test-branch"
    ]);

    const repository =
      new GitRepository(
        temporaryDirectory
      );

    expect(
      await repository.branchExists(
        "test-branch"
      )
    ).toBe(true);
  });

  it("returns false for a nonexistent branch", async () => {
    await initializeRepository();
    await createCommit();

    const repository =
      new GitRepository(
        temporaryDirectory
      );

    expect(
      await repository.branchExists(
        "does-not-exist"
      )
    ).toBe(false);
  });

  it("streams real Git history", async () => {
    await initializeRepository();
    await createCommit();

    const repository =
      new GitRepository(
        temporaryDirectory
      );

    let history = "";

    for await (
      const chunk
      of repository.streamHistory()
    ) {
      history += chunk;
    }

    expect(
      history
    ).toContain(
      "Initial commit"
    );

    expect(
      history
    ).toContain(
      "Test Author"
    );

    expect(
      history
    ).toContain(
      "example.txt"
    );
  });
});