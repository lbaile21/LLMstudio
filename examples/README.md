# LLMstudio Examples

This directory contains a collection of notebooks that demonstrate how to use LLMstudio in different scenarios. Each example is self-contained and can be run independently.

## Getting Started

1. [Introduction to LLMstudio](https://github.com/TensorOpsAI/LLMstudio/blob/main/examples/01_intro_to_llmstudio.ipynb) — get to know how LLMstudio works.
2. [Compare LLM performances](https://github.com/TensorOpsAI/LLMstudio/blob/main/examples/02_llm_compare.ipynb) — compare multiple LLM performances based on the expected output, including latency and similarity.

## Prerequisites

- Python 3.9 or newer
- A working Jupyter installation (`pip install notebook` if needed)
- API keys for the providers you intend to use (e.g. OpenAI, Anthropic, VertexAI)

## Running the Examples

Make sure LLMstudio is installed and that the required API keys are exported in your shell before launching Jupyter:

```bash
pip install llmstudio
export OPENAI_API_KEY="your-key-here"
jupyter notebook
```

If you prefer to keep credentials out of your shell history, place them in a
`.env` file at the repository root and load it with `python-dotenv` from inside
the notebook:

```python
from dotenv import load_dotenv
load_dotenv()
```

Make sure the `.env` file is listed in your `.gitignore` so secrets are not
committed by accident.

## Verifying Your Setup

Before running the example notebooks, you can quickly confirm that LLMstudio
is installed and your API key is reachable from Python:

```python
import os
import llmstudio

assert os.environ.get("OPENAI_API_KEY"), "OPENAI_API_KEY is not set"
print("llmstudio version:", getattr(llmstudio, "__version__", "unknown"))
```

If this snippet runs without errors, you are ready to open the notebooks.

## Troubleshooting

- **`AuthenticationError`**: double-check that the relevant `*_API_KEY`
  environment variable is set in the same shell session used to launch Jupyter.
  On Windows, use `set` (cmd) or `$Env:` (PowerShell) instead of `export`.
  In PowerShell, set the variable with `$Env:OPENAI_API_KEY = "your-key-here"`
  (no `export` keyword); note that it only persists for the current session.
  Be aware that quoting the value with single quotes in PowerShell will
  include the quotes as part of the key, which will then fail authentication.
- **`ModuleNotFoundError: llmstudio`**: ensure you launched Jupyter from the
  same virtual environment where `llmstudio` was installed. Running
  `which jupyter` (or `where jupyter` on Windows) can help confirm this.
- **Slow first request**: the initial call may take longer while the provider
  client warms up; subsequent calls in the same notebook should be faster.
- **Rate limit errors**: if you hit provider rate limits while iterating, try
  reducing the number of parallel requests or adding a short backoff between
  calls.
- **Kernel can't find new packages**: after `pip install`-ing a dependency,
  restart the Jupyter kernel so the updated environment is picked up.
- **Stale API key after rotation**: if you rotated a key but still see auth
  errors, confirm the new value is exported in the current shell and restart
  the Jupyter kernel — notebooks cache `os.environ` values read at import time.
- **Trailing whitespace in keys**: keys copied from web dashboards sometimes
  include a trailing newline or space. Strip the value (e.g. with
  `OPENAI_API_KEY=$(echo -n "$OPENAI_API_KEY" | tr -d '[:space:]')`) before
  exporting it to avoid hard-to-debug 401 responses.
