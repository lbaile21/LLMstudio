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
diagnose from a static snippet alone. Likewise, flag bugs that only surface
after a retry or token-refresh, since those often point at state leaking
between requests.

## Testing

Before opening a PR, run the test suite locally and make sure it passes:

- `pytest` runs the full suite. For faster iteration, scope to a single module
  with `pytest tests/path/to/test_file.py` or a single test with `-k name`.
- Use `pytest -x` to stop at the first failure when debugging, and `-vv` for
  verbose assertion output.
- New code should ship with tests. Aim to cover both the happy path and at
  least one error/edge case (invalid input, provider error, empty response,
  etc.). Bug fixes should include a regression test that fails without the fix.
- Mock external providers in unit tests; reserve real network calls for
  integration tests that are clearly marked and skippable in CI.
- If your change touches streaming or async code, add a test that exercises
  the streaming path end-to-end — these regressions are otherwise easy to miss.

## Pull Request Checklist

Before requesting review, confirm that your PR:

- Has a descriptive title and a summary that explains the *why*, not just the
  *what*. Link any related issues with `Closes #123` or `Refs #123`.
- Keeps the change focused. Unrelated refactors, formatting churn, and
  dependency bumps belong in separate PRs so they can be reviewed and
  reverted independently.
- Updates user-facing documentation (README, `docs/`, docstrings) when
  behavior, configuration, or public APIs change.
- Passes `pre-commit run --all-files` and `pytest` locally.
- Notes any breaking changes prominently in the PR description, along with a
  suggested migration path for existing users.

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

### Avoiding common pitfalls

A few mistakes show up often enough in performance PRs that they're worth
calling out explicitly:

- **Benchmarking against a live provider without isolating network noise.**
  If you must hit a remote API, run the benchmark multiple times across
  different times of day, or mock the transport layer for the hot path you
  actually care about.
- **Comparing a warm cache against a cold one.** Either flush caches between
  runs, or report both warm and cold numbers separately.
- **Measuring wall-clock time on a busy machine.** Close other workloads, or
  use `time.perf_counter()` inside a tight loop and report CPU time alongside
  wall time when the distinction matters.
- **Optimizing a code path that isn't on the critical path.** Profile first
  (`cProfile`, `py-spy`, or `scalene`) and include a short note in the PR
  describing which function dominated before your change.
- **Reporting a single run.** One number is an anecdote, not a measurement.
  Always include at least the median and, ideally, a spread (min/max or stddev).
- **Forgetting to pin dependencies when benchmarking.** Provider SDK versions
  can materially affect latency; record the exact versions used (`pip freeze`
  excerpt is fine) alongside your numbers.

When in doubt, err on the side of including more context: a reviewer should be
able to reproduce your numbers without having to ask follow-up questions.

## Branches

- All development happens in per-feature branches prefixed with the change
  type and contributor's initials, e.g. `feat/ab_feature_name` or
  `fix/ab_bug_description`. Other accepted prefixes include `docs/`, `test/`,
  `refactor/`, and `chore/` for non-functional changes.
- Keep branches short-lived: rebase onto `main` regularly to avoid large,
  painful merges, and delete the branch after the PR is merged.
- Approved PRs are merged to the `main` branch via squash-merge. The squash
  commit message should follow the same convention as the branch prefix so
  the history reads cleanly.
