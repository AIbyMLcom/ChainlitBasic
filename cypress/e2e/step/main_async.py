import chainlit as cl


async def tool_3():
    async with cl.Step(name="Tool 3", type="TOOL") as s:
        await cl.sleep(2)
        s.output = "Response from tool 3"


@cl.step
async def tool_2():
    await tool_3()
    await cl.Message(content="Message from tool 2").send()
    return "Response from tool 2"


@cl.step(name="Tool 1", type="TOOL")
async def tool_1():
    await tool_2()
    return "Response from tool 1"


@cl.on_message
async def main(message: cl.Message):
    await tool_1()