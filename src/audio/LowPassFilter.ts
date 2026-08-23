export class LowPassFilter {
  private previousOutput = 0;
  public process( input: number, cutoffFrequency: number, sampleRate: number ): number {
    const deltaTime = 1 / sampleRate;
    const rc = 1 /(2 * Math.PI * cutoffFrequency);
    const alpha = deltaTime / (rc + deltaTime);
    this.previousOutput = this.previousOutput + alpha * (input - this.previousOutput);
    return this.previousOutput;
  }
  public reset(): void {
    this.previousOutput = 0;
  }
}