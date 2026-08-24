import { spawn } from "node:child_process";
import { platform } from "node:os";

export class AudioPlayer {
  public async play(
    filePath: string
  ): Promise<void> {
    const currentPlatform =
      platform();

    switch (currentPlatform) {
      case "win32":
        this.playDetached(
          "explorer.exe",
          [filePath]
        );
        return;

      case "darwin":
        this.playDetached(
          "open",
          [filePath]
        );
        return;

      case "linux":
        this.playDetached(
          "xdg-open",
          [filePath]
        );
        return;

      default:
        throw new Error(
          `Unsupported platform: ${currentPlatform}`
        );
    }
  }

  private playDetached(
    command: string,
    args: string[]
  ): void {
    const player =
      spawn(
        command,
        args,
        {
          detached: true,
          stdio: "ignore"
        }
      );

    player.unref();
  }
}