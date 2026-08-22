# Security Policy

## Supported Versions

Time Traveler is currently under active development.

Security updates are provided for the latest released version only.

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅ |
| < 0.1   | ❌ |

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

If you discover a vulnerability, report it privately through GitHub's
security advisory system for this repository.

When reporting a vulnerability, please include:

- A description of the issue
- Steps to reproduce it
- The potential impact
- Any relevant logs, screenshots, or proof-of-concept code
- Your environment, including operating system and Node.js version

Please allow a reasonable amount of time for the issue to be investigated
before publicly disclosing the vulnerability.

## Security Scope

Examples of issues that may be considered security vulnerabilities include:

- Arbitrary command execution
- Command injection through Git metadata or CLI arguments
- Unsafe handling of repository paths
- Path traversal
- Writing files outside of the requested output location
- Malicious Git repository content causing unintended system behavior
- Dependency vulnerabilities that directly affect Time Traveler

Regular bugs, crashes, feature requests, and unexpected musical output should
be reported through the normal GitHub issue tracker.

## Security Considerations

Time Traveler analyzes local Git repositories and may execute the local `git`
binary to retrieve repository history.

Users should avoid running Time Traveler on untrusted repositories until they
have reviewed the repository and understand the risks associated with local
development tools.

Time Traveler does not require network access to analyze a local repository.