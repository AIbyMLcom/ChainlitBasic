import os
from typing import Optional

from chainlit.data.base import BaseDataLayer
from chainlit.data.chainlit import ChainlitDataLayer
from chainlit.data.mongodb import MongoDBDataLayer


_data_layer: Optional[BaseDataLayer] = None

if api_key := os.environ.get("LITERAL_API_KEY"):
    server = os.environ.get("LITERAL_SERVER")
    _data_layer = ChainlitDataLayer(api_key=api_key, server=server)


def get_data_layer():
    return _data_layer
