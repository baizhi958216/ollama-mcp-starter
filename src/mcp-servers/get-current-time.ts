import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "关于日期的mcp服务, 其实这个名字跟tools的提示词没啥关系，只是知道这个服务是关于日期的，反正随便你怎么写，于是我就写了这么长，不会有人真的会用这个东西去写吧，哈哈，有点意思，快来打卡拉彼丘喵~",
  version: "1.0.0",
});

server.tool("get-current-time", "返回当前时间", async () => {
  return {
    content: [
      {
        type: "text",
        text: new Date().toLocaleString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      },
    ],
  };
});

export const TimeServer = server;