# Time Traveler

[![CI](https://github.com/amanogawa01/time-traveler/actions/workflows/ci.yml/badge.svg)](https://github.com/amanogawa01/time-traveler/actions/workflows/ci.yml)

Turn your Git history into music.

Time Traveler is a command-line tool that analyzes the history of a Git repository and transforms its development activity into a deterministic musical soundscape.

Instead of generating music with AI or randomly assigning notes, Time Traveler maps real repository data — commits, code changes, file activity, timestamps, and development patterns — directly to musical properties.

## Features

- Analyze the history of any local Git repository
- Convert repository activity into a musical profile
- Generate melody, bass, and pad layers
- Export the result as a stereo WAV file
- Play generated soundscapes directly from the CLI
- Analyze or export specific Git branches
- Handle repositories ranging from a few commits to more than a million
- Stream large Git histories without loading the entire raw Git log into memory
- Adaptively aggregate enormous repositories while preserving their overall history
- Produce deterministic output from repository data
- No AI-generated music
- No external audio libraries required for synthesis

## How It Works

Time Traveler reads Git history and maps development activity to musical characteristics.

Repository-wide statistics influence the overall musical profile:

| Git data | Musical property |
| --- | --- |
| Commits per day | Tempo |
| Average lines changed | Intensity |
| Deletion/churn ratio | Dissonance and scale |
| Average files changed | Note density |
| Busiest commit hour | Root note |
| Code-change intensity | Waveform |

Individual commits influence the composition:

| Commit data | Musical property |
| --- | --- |
| Insertions and files changed | Scale degree |
| Deletion ratio | Harmonic tension |
| Files changed | Note duration |
| Commit size | Amplitude |
| Commit time | Octave |
| Time between commits | Event spacing |

Each musical commit produces five events:

- 1 melody voice
- 1 bass voice
- 3 pad voices forming a chord

The synthesizer then renders those events into stereo PCM audio and writes a WAV file.

## Large Repositories

Repositories with up to 1,000 commits are represented commit-by-commit.

For larger histories, Time Traveler automatically groups neighboring commits into chronological buckets. Each bucket combines the activity of the commits it represents.

This prevents extremely large repositories from producing millions of simultaneous music events while still representing the complete repository history.

Time Traveler has been stress-tested against repositories including:

- Linux kernel — more than 1.4 million commits processed
- LLVM — more than 590,000 commits processed

## Requirements

- Node.js 20 or newer
- Git

## Installation

```bash
npm i -g @summer_icicle/time-traveler
```


or, alternatively, you can install it from github and build it yourself. 

Clone the repository:

```bash
git clone https://github.com/amanogawa01/time-traveler.git
cd time-traveler
```

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

Link the CLI globally:

```bash
npm link
```

You can then use `time-traveler` from inside any Git repository.

## Usage

### Analyze a repository

Run:

```bash
time-traveler analyze
```

Example output:

```text
Time Traveler
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository
  Branch: main
  Commits: 18
  Age: 5.1 days

Code Activity
  Lines added: 7,279
  Lines deleted: 1,142
  Total lines changed: 8,421
  Files changed: 86
  Churn ratio: 13.6%

Commit Activity
  Commits/day: 3.50
  Avg lines/commit: 467.8
  Busiest hour: 3:00 PM

Musical Profile
  Tempo: 85 BPM
  Root note: G
  Scale: major
  Waveform: triangle
  Intensity: 0.47
  Dissonance: 0.14
  Note density: 0.24
```

### Export a WAV file

```bash
time-traveler export
```

The default filename contains the repository name, branch, and latest commit hash:

```text
time-traveler-main-abcdef1.wav
```

Specify a custom filename with:

```bash
time-traveler export --output my-history.wav
```

or:

```bash
time-traveler export -o my-history.wav
```

### Play the repository

```bash
time-traveler play
```

Time Traveler generates the composition and opens it using the operating system's default audio player.

### Use a specific branch

All repository commands support a local branch with `--branch` or `-b`.

```bash
time-traveler analyze --branch develop
```

```bash
time-traveler export --branch develop
```

```bash
time-traveler play --branch develop
```

## Development

Run the CLI directly from TypeScript:

```bash
npm run dev -- analyze
```

Type-check the project:

```bash
npm run typecheck
```

Run the test suite:

```bash
npm test
```

Build:

```bash
npm run build
```

## Testing

Time Traveler includes unit and integration coverage for:

- Git history parsing
- Real temporary Git repositories
- Repository and branch detection
- Streaming Git history
- Musical profile mapping
- Layered composition
- Large-history aggregation
- Deterministic composition
- WAV encoding and stereo PCM output

The project is also manually stress-tested against very large real-world Git repositories.

GitHub Actions automatically runs type checking, tests, and the production build on pushes and pull requests.

## Architecture

```text
Git Repository
      │
      ▼
GitRepository
      │
      ▼
GitHistoryParser
      │
      ▼
GitCommit[]
      │
      ├──────────────► GitHistoryAnalyzer
      │                       │
      │                       ▼
      │                GitHistoryStats
      │                       │
      │                       ▼
      │                  MusicMapper
      │                       │
      │                       ▼
      │                  MusicProfile
      │
      ▼
MusicComposer
      │
      ▼
MusicEvent[]
      │
      ▼
Synthesizer
      │
      ▼
StereoBuffer
      │
      ▼
WavEncoder
      │
      ▼
WAV file
```

## Audio Engine

Time Traveler implements its own lightweight synthesis pipeline.

The generated soundscape uses:

- melody, bass, and pad layers
- ADSR envelopes
- sine, triangle, square, and sawtooth waveforms
- layer-specific timbre blending
- low-pass filtering
- stereo panning
- equal-power stereo mixing
- soft clipping
- 44.1 kHz 16-bit stereo PCM WAV output

## Philosophy

Time Traveler is not intended to make Git history sound like a conventional song.

The goal is to create an audible representation of how a repository developed.

Two repositories with different development patterns should produce different musical profiles, while running Time Traveler repeatedly on the same history should produce the same composition.

The repository itself is the score.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Please also read the [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md).

## License

Time Traveler is released under the MIT License. See [LICENSE](LICENSE).