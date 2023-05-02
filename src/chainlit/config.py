import os
import sys
from typing import Optional, Literal, Any, Callable, List, Dict
import tomli
from chainlit.types import Action
from pydantic.dataclasses import dataclass
from importlib import machinery
import click
import logging

# Get the directory the script is running from
root = os.getcwd()

config_dir = os.path.join(root, ".chainlit")
config_file = os.path.join(config_dir, "config.toml")

# Default config file created if none exists
DEFAULT_CONFIG_STR = """[project]
# Name of the app and chatbot.
name = "Chatbot"

# If true (default), the app will be available to anonymous users (once deployed).
# If false, users will need to authenticate and be part of the project to use the app.
public = true

# The project ID (found on https://cloud.chainlit.io).
# If provided, all the message data will be stored in the cloud.
# The project ID is required when public is set to false.
#id = ""

# List of environment variables to be provided by each user to use the app.
user_env = []

# Hide the chain of thought details from the user in the UI.
hide_cot = false

# Limit the number of requests per user.
#request_limit = "10 per day"
"""

# Set environment and server URL
chainlit_env = os.environ.get("CHAINLIT_ENV") or "development"
if chainlit_env == "development":
    # chainlit_server = "http://localhost:3000"
    chainlit_server = "https://cloud.chainlit.io"
else:
    chainlit_server = "https://cloud.chainlit.io"


@dataclass()
class ChainlitConfig:
    chainlit_env: Literal['development', 'production']
    # Chainlit server URL. Used only for cloud features
    chainlit_server: str
    # Name of the app and chatbot. Used as the default message author.
    chatbot_name: str
    # Whether the app is available to anonymous users or only to team members.
    public: bool
    # List of environment variables to be provided by each user to use the app. If empty, no environment variables will be asked to the user.
    user_env: List[str]
    # Hide the chain of thought details from the user in the UI.
    hide_cot: bool
    # Path to the local langchain cache database
    lc_cache_path: str
    # Developer defined callbacks for each action. Key is the action name, value is the callback function.
    action_callbacks: Dict[str, Callable[[Action], Any]]
    # Directory where the Chainlit project is located
    root = root
    # Limit the number of requests per user.
    request_limit: Optional[str] = None
    # Enables Cloud features if provided
    project_id: Optional[str] = None
    # Name of the module (python file) used in the run command
    module_name: Optional[str] = None
    # Module object loaded from the module_name
    module: Any = None
    # Bunch of callbacks defined by the developer
    on_stop: Optional[Callable[[], Any]] = None
    on_chat_start: Optional[Callable[[], Any]] = None
    on_message: Optional[Callable[[str], Any]] = None
    lc_run: Optional[Callable[[Any, str], Any]] = None
    lc_postprocess: Optional[Callable[[Any], Any]] = None
    lc_factory: Optional[Callable[[], Any]] = None
    lc_rename: Optional[Callable[[str], str]] = None


def init_config(log=False):
    """Initialize the configuration file if it doesn't exist."""
    if not os.path.exists(config_file):
        os.makedirs(config_dir, exist_ok=True)
        with open(config_file, 'w', encoding="utf-8") as f:
            f.write(DEFAULT_CONFIG_STR)
            logging.info(f"Created default config file at {config_file}")
    elif log:
        logging.info(f"Config file already exists at {config_file}")


def load_module(target: str):
    """Load the specified module."""

    # Get the target's directory
    target_dir = os.path.dirname(os.path.abspath(target))

    # Add the target's directory to the Python path
    sys.path.insert(0, target_dir)

    loader = machinery.SourceFileLoader(target, target)
    config.module = loader.load_module()

    # Remove the target's directory from the Python path
    sys.path.pop(0)


def load_config():
    """Load the configuration from the config file."""
    init_config()
    with open(config_file, "rb") as f:
        toml_dict = tomli.load(f)

        # Load project settings
        project_settings = toml_dict.get("project", {})
        chatbot_name = project_settings.get("name")
        project_id = project_settings.get("id")
        public = project_settings.get("public")
        user_env = project_settings.get("user_env")
        hide_cot = project_settings.get("hide_cot", False)
        request_limit = project_settings.get("request_limit", "")

        if not public and not project_id:
            raise ValueError(
                "Project ID is required when public is set to false.")

        # Set cache path
        lc_cache_path = os.path.join(config_dir, ".langchain.db")

        config = ChainlitConfig(
            action_callbacks={},
            request_limit=request_limit,
            hide_cot=hide_cot,
            chainlit_env=chainlit_env,
            chainlit_server=chainlit_server,
            chatbot_name=chatbot_name,
            public=public,
            user_env=user_env,
            lc_cache_path=lc_cache_path,
            project_id=project_id,
        )

    return config


config = load_config()
