import os

DEFAULT_MARKDOWN_STR = """# Welcome to Chainlit! 🚀🤖

Hi there, Developer! 👋 We're excited to have you on board. Chainlit is a powerful tool designed to help you prototype, debug and share applications built on top of LLMs.

## Useful Links 🔗

- **Documentation:** Get started with our comprehensive [Chainlit Documentation](https://chainlit-43.mintlify.app/) 📚
- **Discord Community:** Join our friendly [Chainlit Discord](https://discord.gg/ZThrUxbAYw) to ask questions, share your projects, and connect with other developers! 💬

We can't wait to see what you create with Chainlit! Happy coding! 💻😊

## Welcome screen

To modify the welcome screen, edit the `chainlit.md` file at the root of your project. If you do not want a welcome screen, just leave this file empty.
"""


def init_markdown(root: str):
    chainlit_md_file = os.path.join(root, "chainlit.md")

    if not os.path.exists(chainlit_md_file):
        with open(chainlit_md_file, 'w') as f:
            f.write(DEFAULT_MARKDOWN_STR)
            print(f"Created default chainlit markdown file at {chainlit_md_file}")


def get_markdown_str(root: str):
    chainlit_md_path = os.path.join(root, "chainlit.md")
    if os.path.exists(chainlit_md_path):
        with open(chainlit_md_path) as f:
            chainlit_md = f.read()
            return chainlit_md
    else:
        return None
