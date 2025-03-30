import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
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
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        setIsLoading(false);
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
      setIsLoading(false);
    }

    setInput("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSendMessage();
      }
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Bot className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Quantum Assistant</h1>
            <p className="text-sm text-gray-500">Your AI-powered chat companion</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
              <Bot className="h-16 w-16 text-gray-300" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-700">Welcome to Quantum Assistant</h2>
                <p className="text-gray-500 max-w-sm">
                  I'm here to help you with any questions or tasks you might have.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start gap-3 max-w-[80%] ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-shrink-0 rounded-full p-2 ${
                    msg.type === "user" ? "bg-blue-600" : "bg-gray-200"
                  }`}>
                    {msg.type === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-700" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      msg.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.type === "user" ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="flex-shrink-0 rounded-full p-2 bg-gray-200">
                  <Bot className="h-4 w-4 text-gray-700" />
                </div>
                <div className="rounded-2xl px-4 py-2 bg-white border border-gray-200">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none max-h-32 rounded-2xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-base leading-6"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default Agent;