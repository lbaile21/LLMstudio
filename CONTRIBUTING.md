# LLMstudio Contribution Guide

## Contribution Guidelines

Thank you for expressing your interest in contributing to LLMstudio. To ensure that your contribution aligns with our guidelines, please carefully review the following considerations before proceeding:

1. For feature requests, we recommend creating a [GitHub Issue](https://github.com/tensoropsai/llmstudio/issues) on our repository. If it's your first time contributing, maybe start with a [good first issue](https://github.com/tensoropsai/llmstudio/labels/good%20first%20issue)
2. Clone the repo and make your changes on a local branch
3. Follow our repo guidelines
   - Ensure that you update any relevant docstrings and comments within your code
   - Run `pre-commit run --all-files` to lint your code
   - For performance-sensitive changes, include benchmark numbers (before/after) in the PR description

## Performance Considerations

When submitting changes that may affect runtime performance (latency, throughput,
memory usage, or token cost), please include the following in your PR:

- A short description of the workload used to measure performance.
- Before/after numbers for the relevant metric (e.g. p50/p95 latency, tokens/sec,
  peak RSS). Include the hardware and Python version when relevant.
- The command or script used to reproduce the benchmark, so reviewers can verify
  the results locally.

For micro-benchmarks, prefer `pytest-benchmark` or a small standalone script
committed under `benchmarks/`. Avoid relying on a single run — report the median
of at least 5 runs to reduce noise.

## Branches

- All development happens in per-feature branches prefixed by contributor's
  initials. For example `feat/feature_name`.
- Approved PRs are merged to the `main` branch.
