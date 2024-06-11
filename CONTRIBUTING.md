# LLMstudio Contribution Guide

## Contribution Guidelines

Thank you for expressing your interest in contributing to LLMstudio. To ensure that your contribution aligns with our guidelines, please carefully review the following considerations before proceeding:

1. For feature requests, we recommend creating a [GitHub Issue](https://github.com/tensoropsai/llmstudio/issues) on our repository. If it's your first time contributing, maybe start with a [good first issue](https://github.com/tensoropsai/llmstudio/labels/good%20first%20issue)
2. Clone the repo and make your changes on a local branch
3. Follow our repo guidelines
   - Ensure that you update any relevant docstrings and comments within your code
   - Run `pre-commit run --all-files` to lint your code
   - Add or update tests covering your changes when applicable
   - For performance-sensitive changes, include benchmark numbers (before/after) in the PR description

## Reporting Bugs

When filing a bug report, please include enough context for a maintainer to
reproduce the issue without back-and-forth:

- LLMstudio version (`pip show llmstudio`) and Python version.
- The provider and model involved, and whether the issue is reproducible with
  a different provider/model.
- A minimal code snippet that triggers the bug. Redact API keys and any
  sensitive prompt content before sharing.
- The full traceback or error message, not just the final line.
- Observed vs. expected behavior, and how often the issue reproduces
  (always, intermittently, only under load, etc.).
- The operating system and, if relevant, the shell or terminal you're using.

If the bug only appears under concurrency or with streaming responses, please
call that out explicitly — those code paths are easy to regress and hard to
diagnose from a static snippet alone.

## Performance Considerations

When submitting changes that may affect runtime performance (latency, throughput,
memory usage, or token cost), please include the following in your PR:

- A short description of the workload used to measure performance, including
  the model/provider, prompt size, and concurrency level.
- Before/after numbers for the relevant metric (e.g. p50/p95 latency, tokens/sec,
  peak RSS). Include the hardware (CPU/GPU, RAM) and Python version when relevant.
- The command or script used to reproduce the benchmark, so reviewers can verify
  the results locally.
- Any caveats: warm vs. cold runs, network variability when hitting remote
  providers, and whether caching was enabled.

For micro-benchmarks, prefer `pytest-benchmark` or a small standalone script
committed under `benchmarks/`. Report the median of at least 5 runs to reduce
noise, and discard the first run when measuring steady-state behavior (it often
includes import/JIT warmup costs).

When in doubt, err on the side of including more context: a reviewer should be
able to reproduce your numbers without having to ask follow-up questions.

## Branches

- All development happens in per-feature branches prefixed by contributor's
  initials. For example `feat/feature_name`.
- Approved PRs are merged to the `main` branch.
