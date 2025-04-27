import OpenAI from "openai";
import { ChatCompletionMessageParam, ChatCompletionContentPartText } from "openai/resources/index.js";
import { getTools } from "./GetTools";

export const query = async (
  openai: OpenAI,
  model: string,
  mcpTools: Awaited<ReturnType<typeof getTools>>,
  query: string,
  systemPrompt:string = "你讲中文"
) => {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: query,
    },
  ];

  const response = await openai.chat.completions.create({
    model,
    messages: messages,
    tools: mcpTools.tools,
  });

  for (const content of response.choices) {
    if (content.finish_reason === "tool_calls" && content.message.tool_calls) {
      await Promise.all(
        content.message.tool_calls.map(async (toolCall) => {
          const toolName = toolCall.function.name;
          const toolArgs = toolCall.function.arguments;
          const mcp = mcpTools.functionMap[toolName];
          if (!mcp) {
            throw new Error(`系不系没有写${toolName}工具捏？`);
          }

          const toolResult = await mcp.callTool({
            name: toolName,
            arguments: JSON.parse(toolArgs),
          });
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult.content as Array<ChatCompletionContentPartText>,
          });
        })
      );

      const response = await openai.chat.completions.create({
        model,
        messages,
        max_completion_tokens: 512,
        stream: true,
      });
      for await (const message of response) {
        process.stdout.write(message.choices[0].delta.content!);
      }
    } else {
      console.log(content.message.content);
    }
  }
};
