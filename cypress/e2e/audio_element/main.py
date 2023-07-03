import chainlit as cl


@cl.on_chat_start
async def start():
    elements = [cl.Audio(name="audio", path="../../fixtures/example.mp3", display="inline")]

    await cl.Message(content="This message has an audio", elements=elements).send()
