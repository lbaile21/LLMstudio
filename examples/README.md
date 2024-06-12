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

## Troubleshooting

- **`AuthenticationError`**: double-check that the relevant `*_API_KEY`
  environment variable is set in the same shell session used to launch Jupyter.
  On Windows, use `set` (cmd) or `$Env:` (PowerShell) instead of `export`.
  Note that PowerShell uses `$Env:OPENAI_API_KEY = "your-key-here"` (no
  `export` keyword), and the variable only persists for the current session.
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
