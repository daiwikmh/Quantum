import { WebSocketServer } from "ws";
import initializeAgent from "./aiAgent/agentInitialization.js";


export async function startWsServer(server) {
  const { agent, config } = await initializeAgent();
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", async (message) => {
      try {
        const { content, sessionId } = JSON.parse(message);
        console.log("Received query:", content);

        // Create a function to handle sending responses
        const sendResponse = (type, data) => {
          ws.send(
            JSON.stringify({
              type,
              ...data,
              timestamp: new Date().toISOString(),
            })
          );
        };

        const stream = await agent.stream(
          {
            messages: [{ role: "user", content, sessionId }],
          },
          config
        );

        for await (const chunk of stream) {
          console.log("Stream chunk:", chunk);

          if ("agent" in chunk) {
            const agentMsg = chunk.agent.messages[0];
            // If the agent message does NOT have any tool_calls, send it as a normal message.
            if (!agentMsg.tool_calls || agentMsg.tool_calls.length === 0) {
              if (agentMsg.content) {
                sendResponse("message", {
                  content: agentMsg.content,
                });
              }
            }
          } else if ("tools" in chunk) {
            // Send the raw tool message to the frontend (frontend will handle formatting).
            const toolMsg = chunk.tools.messages[0];
            if (toolMsg && toolMsg.content) {
              sendResponse("tools", {
                content: toolMsg.content,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            content: error.message,
            timestamp: new Date().toISOString(),
          })
        );
      }
    });
  });
}
