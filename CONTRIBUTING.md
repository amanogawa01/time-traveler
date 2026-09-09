# Contributing

Thanks for your interest in contributing to Time Traveler.

Contributions are welcome, including bug fixes, tests, documentation improvements, performance improvements, and new ideas that fit the project.

## Getting Started

Clone the repository:

git clone [https://github.com/amanogawa01/time-traveler.git](https://github.com/amanogawa01/time-traveler.git)
cd time-traveler

Install dependencies:

npm install

Build the project:

npm run build

Run the test suite:

npm test

Run the type checker:

npm run typecheck

## Development

Run the CLI directly from TypeScript:

npm run dev -- analyze

You can also test the built CLI locally with:

npm link

Then run:

time-traveler analyze

from inside a Git repository.

## Before Submitting a Pull Request

Please make sure all of the following succeed:

npm run typecheck
npm test
npm run build

New behavior should include tests when practical.

Changes that affect repository parsing, musical mapping, synthesis, or large-repository behavior should be tested carefully because those areas directly affect deterministic output.

## Code Style

* Use TypeScript
* Follow the existing formatting and naming conventions
* Prefer small, focused functions
* Keep behavior deterministic unless randomness is explicitly part of a future design
* Avoid unnecessary dependencies
* Keep platform-specific behavior isolated where possible

## Issues

Bug reports should include:

* What you expected to happen
* What actually happened
* Steps to reproduce the problem
* Operating system
* Node.js version
* Git version
* Relevant command output or error messages

Feature requests should explain the problem the feature would solve and how it fits the project.

## Security

Do not report security vulnerabilities through public issues.

See [SECURITY.md](SECURITY.md) for the private reporting process.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
