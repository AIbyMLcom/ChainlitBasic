from typing import Any
from chainlit.lc.callbacks import (
    LangchainCallbackHandler,
    AsyncLangchainCallbackHandler,
    AsyncLangchainFinalIteratorCallbackHandler,
)
from chainlit.sync import make_async
from chainlit.context import emitter_var


async def run_langchain_agent(agent: Any, input_str: str, use_async: bool):
    async_langchain_callback_handler = AsyncLangchainFinalIteratorCallbackHandler()

    if hasattr(agent, "input_keys"):
        input_key = agent.input_keys[0]
        if use_async:
            raw_res = await agent.acall(
                {input_key: input_str},
                callbacks=[async_langchain_callback_handler],
            )
        else:
            raw_res = await make_async(agent.__call__)(
                {input_key: input_str}, callbacks=[LangchainCallbackHandler()]
            )
    else:
        if use_async:
            raw_res = await agent.acall(
                input_str,
                callbacks=[async_langchain_callback_handler],
            )
        else:
            raw_res = await make_async(agent.__call__)(
                input_str, callbacks=[LangchainCallbackHandler()]
            )

    if hasattr(agent, "output_keys"):
        output_key = agent.output_keys[0]
    else:
        output_key = None

    return (
        raw_res,
        output_key,
        async_langchain_callback_handler.has_streamed_final_answer,
    )
