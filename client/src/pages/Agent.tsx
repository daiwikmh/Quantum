import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface WebSocketMessage {
  type: string;
  content: string;
  timestamp: string;
}

const AGENT_ASCII = `
 ██████  ██    ██ ██████  ██ ████████ 
██    ██ ██    ██ ██   ██ ██    ██    
██    ██ ██    ██ ██████  ██    ██    
██ ▄▄ ██ ██    ██ ██   ██ ██    ██    
 ██████   ██████  ██████  ██    ██    
    ▀▀
`; // ASCII art remains unchanged

const Agent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3000");

    ws.current.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;

        if (data.type === "message") {
          const newMessage: Message = {
            type: "ai",
            content: data.content,
            timestamp: new Date(data.timestamp),
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleSendMessage = (): void => {
    if (!input.trim() || !ws.current) return;

    setIsLoading(true);

    const newMessage: Message = {
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      ws.current.send(JSON.stringify({ content: input }));
    } catch (error) {
      console.error("Failed to send message:", error);
    }

    setInput("");
    setIsLoading(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <pre className="text-black text-xs font-mono whitespace-pre overflow-hidden">
          {AGENT_ASCII}
        </pre>
      </div>

      {/* Chat Area - takes remaining height */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Start chatting with the Quantum Agent
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.type === "user"
                    ? "bg-black text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <div
                  className={`text-xs mt-2 ${
                    msg.type === "user" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - fixed at bottom */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-black transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Agent;
