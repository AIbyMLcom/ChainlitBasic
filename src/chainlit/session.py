from typing import Dict, TypedDict, Optional, Callable, Any, Union
from chainlit.client import BaseClient
from chainlit.types import AskResponse


class Session(TypedDict):
    id: str
    ask_user: Callable[[Any, Optional[int]], Union[AskResponse, None]]
    emit: Callable[[str, Any], None]
    conversation_id: Optional[str]
    agent: Any
    task: Optional[Any]
    user_env: Optional[Dict[str, str]]
    predict: Optional[Callable[[str], str]]
    process_response: Optional[Callable[[Any], str]]
    client: Optional[BaseClient]


sessions: Dict[str, Session] = {}
