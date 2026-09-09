# Changelog

All notable changes to Time Traveler will be documented in this file.

The format is based on Keep a Changelog, and this project follows semantic versioning.

## [0.1.0] - 2026-09-09

### Added

- CLI commands for analyzing, exporting, and playing Git repository soundscapes
- Support for analyzing specific local Git branches
- Deterministic mapping from Git history to musical properties
- Melody, bass, and three-voice pad layers
- Stereo synthesis with layer-specific envelopes and timbres
- Low-pass filtering, stereo panning, and soft clipping
- 44.1 kHz 16-bit stereo WAV export
- Streaming Git history parsing for very large repositories
- Adaptive aggregation for repositories with more than 1,000 commits
- Detached HEAD handling
- Empty repository and invalid branch handling
- Automatic output filenames based on repository, branch, and commit hash
- Cross-platform playback support
- Unit and integration test suite
- GitHub Actions CI
- Open-source project documentation