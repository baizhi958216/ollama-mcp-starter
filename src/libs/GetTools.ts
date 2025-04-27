import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DirectServerTransport } from "./DirectTransport";
import { ChatCompletionTool } from "openai/resources/index.js";

export const getTools = async (servers: McpServer[]) => {
  const tools: ChatCompletionTool[] = [];
  const functionMap: Record<string, Client> = {};
  const clients: Client[] = [];
  for (const server of servers) {
    const mcpClient = new Client({
      name: "mcp-client-cli",
      version: "1.0.0",
    });
    // Connecting McpServer directly to McpClient
    const transport = new DirectServerTransport();
    server.connect(transport);
    await mcpClient.connect(transport.getClientTransport());

    clients.push(mcpClient);
    const toolsResult = await mcpClient.listTools();
    tools.push(
      ...toolsResult.tools.map((tool): ChatCompletionTool => {
        functionMap[tool.name] = mcpClient;
        return {
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        };
      })
    );
  }
  const close = () => {
    return Promise.all(
      clients.map(async (v) => {
        await v.close();
      })
    );
  };
  return { tools, functionMap, close };
};