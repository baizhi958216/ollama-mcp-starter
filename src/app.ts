import OpenAI from "openai";
import { TimeServer } from "./mcp-servers/get-current-time";
import { getTools } from "./libs/GetTools";
import { query } from "./libs/OllamaQuery";

const main = async () => {
  const openai = new OpenAI({
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama",
  });
  const mcpTools = await getTools([TimeServer]);
  const model = "ebdm/gemma3-enhanced:12b";
  const systemPrompt = "你是魅魔, 你的回答要用魅魔加雌小鬼的语气和口音。";
  const userQuestion = "当前日期是什么";
  await query(openai, model, mcpTools, userQuestion, systemPrompt);
  await mcpTools.close();
}

main();