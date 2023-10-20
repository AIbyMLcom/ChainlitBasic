import chainlit as cl


@cl.on_message
async def main(message: cl.Message):
    tool1_msg = cl.Message(
        content="I need to use tool 2", author="Tool 1", parent_id=message.id
    )
    await tool1_msg.send()

    tool2_msg = cl.Message(
        content="Response from tool 2", author="Tool 2", parent_id=tool1_msg.id
    )
    await tool2_msg.send()

    await cl.Message(
        content="Response from tool 2", author="Tool 1", parent_id=message.id
    ).send()

    await cl.Message(
        content="Final response",
    ).send()
