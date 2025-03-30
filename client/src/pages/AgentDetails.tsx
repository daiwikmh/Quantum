import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePrivy, useWallets } from "@privy-io/react-auth";

// Add proper type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

// Add SpeechRecognition interface
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult[];
  length: number;
  item(index: number): SpeechRecognitionResult[];
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

import { StakingAssetsCard, ProvidersCard, AgentDetailsCard, AgentsListCard, EthereumMetricsCard, ErrorCard, TravelTicketCard, HotelBookingCard } from "../components/ui/AgentCards";
import { Message } from "../types/AgentInterfaces";
// import { StakingCard } from "../components/ui/StakingCard";
import { LidoSDK, LidoSDKCore } from "@lidofinance/lido-ethereum-sdk";
import { createPublicClient, http } from "viem";
import { holesky } from "viem/chains"; 
const PLUTUS_ASCII = `
██████╗ ██╗     ██╗   ██╗████████╗██╗   ██╗███████╗
██╔══██╗██║     ██║   ██║╚══██╔══╝██║   ██║██╔════╝
██████╔╝██║     ██║   ██║   ██║   ██║   ██║███████╗
██╔═══╝ ██║     ██║   ██║   ██║   ██║   ██║╚════██║
██║     ███████╗╚██████╔╝   ██║   ╚██████╔╝███████║
╚═╝     ╚══════╝ ╚═════╝    ╚═╝    ╚═════╝ ╚══════╝
`;
type PoolOption = {
  name: string;
  address: string;
};

// Add this constant after PLUTUS_ASCII
const POOL_OPTIONS: PoolOption[] = [
  { name: "Amnis Aptos Coin", address: "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::amapt_token::AmnisApt*" },
  { name: "Wrapped Ether", address: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH" },
  { name: "Tether USDt", address: "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b" },
  { name: "USDC", address: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b" },
  { name: "lzUSD", address: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC" },
  { name: "lzUSDT", address: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" },
  // Add more pools as needed
];
const AgentDetails: React.FC = () => {
  const { authenticated, user } = usePrivy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [waveform, setWaveform] = useState<number[]>(Array(40).fill(0));
  const [showTrading, setShowTrading] = useState(false);
  const [selectedPool, setSelectedPool] = useState<string>("");

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const { wallets } = useWallets();
  const chainId = 17000;
  const embeddedWallet =
    wallets.find((wallet) => wallet.walletClientType === "privy") || wallets[0];
  const [votingPower, setVotingPower] = useState<string>("0");
  const [canVote, setCanVote] = useState<boolean>(false);
  const RPC_URL = "https://ethereum-holesky.publicnode.com";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
  if (
    (typeof window !== "undefined" && "SpeechRecognition" in window) ||
    "webkitSpeechRecognition" in window
  ) {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognitionRef.current = new SpeechRecognitionConstructor();
    
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = "en-In";

      speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInput(transcript);

        // Reset silence timeout on speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Set new silence timeout
        silenceTimeoutRef.current = setTimeout(() => {
          if (transcript.trim() !== "") {
            handleSendMessage(transcript);
            setInput("");
          }
        }, 1500); // Detect 1.5 seconds of silence
      };

      speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    } else {
      console.warn("Speech recognition not supported in this browser");
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      stopListening();
    };
    }}, []);
  // Set provider
  useEffect(() => {
    const setProvider = async () => {
      if (embeddedWallet) {
        try {
          const response = await fetch(
            "http://localhost:3000/api/set-provider",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                provider: LidoSDKCore.createWeb3Provider(
                  chainId,
                  window.ethereum
                ),
                address: user?.wallet?.address,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to set provider");
          }

          console.log("Provider set successfully");
        } catch (error) {
          console.error("Error setting provider:", error);
        }
      }
    };

    setProvider();
  }, [embeddedWallet]);

  // WebSocket connection
  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket("ws://localhost:3000");

    ws.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("data", data);

      switch (data.type) {
        case "message":
          const newMessage: Message = {
            type: "ai",
            content: data.content,
            timestamp: new Date(data.timestamp),
          };

          setMessages((prev) => [...prev, newMessage]);

          // Speak the response if in voice mode and audio is enabled
          if (voiceMode && audioEnabled) {
            speakText(data.content);
          }
          break;

        case "tools":
          try {
            // Parse the tool response content
            const toolData = JSON.parse(data.content);
            console.log("Parsed tool data:", toolData);

            if (toolData.error) {
              console.error("Tool error:", toolData.message);
              return;
            }

            // Handle different tool responses
            if (toolData.type === "assets") {
              setCurrentCard({
                type: "assets",
                items: toolData.items.map((asset: any) => ({
                  name: asset.name,
                  rewardRate: asset.rewardRate,
                  logo: asset.logo,
                  type: "asset",
                })),
              });
            } else if (
              toolData.status === "success" &&
              toolData.data.booking_id
            ) {
              // Hotel booking response
              setCurrentCard({
                type: "hotel_booking",
                data: toolData.data,
              });
            } else if (
              toolData.status === "success" &&
              toolData.data.ticket_number
            ) {
              // Ticket booking response
              setCurrentCard({
                type: "ticket_booking",
                data: toolData.data,
              });
            }
          } catch (error) {
            console.error("Error parsing tool response:", error);
          }
          break;

        case "error":
          console.error("Server error:", data.content);
          break;
      }
    };
    return () => ws.current?.close();
  }, [voiceMode, audioEnabled]);

  // Check voting power
  useEffect(() => {
    const checkVotingPower = async () => {
      if (authenticated && embeddedWallet && user?.wallet?.address) {
        try {
          const rpcProvider = createPublicClient({
            chain: holesky,
            transport: http(RPC_URL),
          });
          const provider = LidoSDKCore.createWeb3Provider(
            chainId,
            window.ethereum
          );
          const lidoSDK = new LidoSDK({
            chainId: chainId,
            rpcProvider,
            web3Provider: provider,
          });

          const stakedBalance = await lidoSDK.shares.balance(
            user.wallet.address as `0x${string}`
          );

          const hasVotingPower = Number(stakedBalance) >= 1e18; // 1 ETH in wei
          setVotingPower(stakedBalance.toString());
          setCanVote(hasVotingPower);
        } catch (error) {
          console.error("Error checking voting power:", error);
        }
      }
    };

    checkVotingPower();
  }, [authenticated, embeddedWallet, user?.wallet?.address]);

  // Audio visualization when in voice mode
  useEffect(() => {
    if (!voiceMode) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    let animationFrame: number;

    const setupAudioContext = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
        }

        if (!mediaStreamRef.current && isListening) {
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const source = audioContextRef.current.createMediaStreamSource(
            mediaStreamRef.current
          );
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 128;
          source.connect(analyserRef.current);

          const updateWaveform = () => {
            if (!analyserRef.current) return;

            const dataArray = new Uint8Array(
              analyserRef.current.frequencyBinCount
            );
            analyserRef.current.getByteFrequencyData(dataArray);

            // Create a normalized waveform
            const normalizedData = Array.from(dataArray.slice(0, 40)).map(
              (value) => value / 255
            );

            setWaveform(normalizedData);
            animationFrame = requestAnimationFrame(updateWaveform);
          };

          updateWaveform();
        }
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    if (isListening) {
      setupAudioContext();
    } else if (isSpeaking) {
      // Generate random waveform for speaking animation
      const speakingAnimation = () => {
        const randomWaveform = Array(40)
          .fill(0)
          .map(() => Math.random() * 0.8);
        setWaveform(randomWaveform);
        animationFrame = requestAnimationFrame(speakingAnimation);
      };

      speakingAnimation();
    } else {
      // Flat waveform when idle
      setWaveform(Array(40).fill(0.05));
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [voiceMode, isListening, isSpeaking]);

  const handlePoolSubmit = () => {
    const pool = POOL_OPTIONS.find((p) => p.name === selectedPool);
    if (pool && ws.current) {
      const query = `get pool details for ${pool.address}`;
      handleSendMessage(query);
    }
  };
  // Toggle voice mode
  const toggleVoiceMode = () => {
    const newVoiceMode = !voiceMode;
    setVoiceMode(newVoiceMode);

    if (newVoiceMode) {
      startListening();
    } else {
      stopListening();
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Start speech recognition
  const startListening = () => {
    if (speechRecognitionRef.current && !isListening) {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (speechRecognitionRef.current && isListening) {
      try {
        speechRecognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  };

  // Text-to-speech function
  const speakText = (text: string) => {
    if (!audioEnabled) return;

    if (window.speechSynthesis) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current = utterance;

      // Get available voices and select a good one (prefer natural sounding voices)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Neural") ||
          voice.name.includes("Premium")
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Set voice properties for a natural sound
      utterance.rate = 1.0; // Normal speaking rate
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0;

      // Events
      utterance.onstart = () => {
        setIsSpeaking(true);
        stopListening(); // Don't listen while speaking
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Restart listening after speaking
        if (voiceMode) {
          setTimeout(() => startListening(), 300);
        }
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        if (voiceMode) {
          startListening();
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);

    if (audioEnabled && speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }
  };

  // Send message function
  const handleSendMessage = (messageText?: string) => {
    const message = messageText || input;
    if (!message.trim() || !ws.current) return;

    setIsLoading(true);

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        type: "user" as const,
        content: message,
        timestamp: new Date(),
      },
    ]);

    // Send message through WebSocket
    ws.current.send(
      JSON.stringify({
        content: message,
      })
    );

    setInput("");
    setIsLoading(false);
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderCard = () => {
    if (!currentCard) return null;

    try {
      switch (currentCard.type) {
        case "assets":
          return <StakingAssetsCard assets={currentCard.items} />;

        case "providers":
          return <ProvidersCard providers={currentCard.items} />;

        case "agent_details":
          return <AgentDetailsCard data={currentCard} />;

        case "agents_list":
          return <AgentsListCard agents={currentCard.items} />;

        case "metrics":
          return <EthereumMetricsCard data={currentCard} />;

        case "ticket_booking":
          return <TravelTicketCard data={currentCard.data} />;

        case "hotel_booking":
          return <HotelBookingCard data={currentCard.data} />;

        default:
          return <ErrorCard message="Unknown card type" />;
      }
    } catch (error) {
      return (
        <ErrorCard
          message={error instanceof Error ? error.message : "An error occurred"}
        />
      );
    }
  };

  const renderMessage = (msg: Message) => {
    if (msg.type === "user") {
      return (
        <div className="font-mono text-black/90">
          <span className="text-black/30">user@plutus</span>
          <span className="text-black/70">:~$</span>
          <span className="ml-2">{msg.content}</span>
        </div>
      );
    } else {
      return (
        <div className="font-mono">
          <span className="text-black/70">plutus@ai</span>
          <span className="text-black/30">:~$</span>
          <div className="mt-1 text-black/90 pl-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="whitespace-pre-wrap"
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        </div>
      );
    }
  };

  // Render waveform visualization
  const renderWaveform = () => {
    return (
      <div className="flex items-center justify-center h-20 my-4">
        <div className="flex items-center space-x-1 h-full">
          {waveform.map((amplitude, index) => (
            <div
              key={index}
              className="w-1 bg-black rounded-full transform transition-all duration-75"
              style={{
                height: `${Math.max(5, amplitude * 60)}px`,
                opacity: Math.max(0.2, amplitude),
              }}
            ></div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-black/20">
        <pre
          className="text-black text-xs font-mono whitespace-pre select-none"
          style={{ textShadow: "0 0 1px rgba(0, 0, 0, 0.2)" }}
        >
          {PLUTUS_ASCII}
        </pre>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="voice-mode"
              checked={voiceMode}
              onCheckedChange={toggleVoiceMode}
            />
            <Label htmlFor="voice-mode" className="text-xs">
              Voice Mode
            </Label>
          </div>
          {voiceMode && (
            <Button
              variant="ghost"
              size="sm"
              className="text-black/70 hover:text-black hover:bg-black/10 rounded-full h-8 w-8 p-0"
              onClick={toggleAudio}
            >
              {audioEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-black/70 hover:text-black hover:bg-black/10 rounded-full h-8 w-8 p-0"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white px-4 py-3 text-sm font-mono border-b border-black/20 flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`h-3 w-3 rounded-full ${
              isListening || isSpeaking ? "bg-green-500" : "bg-black"
            } mr-2 animate-pulse`}
          ></div>
          <span className="text-black/70">
            Terminal connected •{" "}
            {voiceMode
              ? isListening
                ? "Listening..."
                : isSpeaking
                ? "Speaking..."
                : "Voice mode active"
              : "Type your message to interact"}
          </span>
        </div>
      </div>

      {/* Chat Messages Area - Full Width */}
      <ScrollArea className="flex-1 p-4 font-mono">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="text-black/50 font-mono text-sm mb-2">
                No messages yet
              </div>
              <div className="text-black/30 font-mono text-xs">
                {voiceMode
                  ? "Say something to interact with Plutus AI"
                  : "Start typing to interact with Plutus AI"}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`terminal-line ${
                msg.type === "ai" ? "pl-0" : "pl-0"
              } `}
            >
              {renderMessage(msg)}
              <span className="text-xs text-black/30 mt-1 block">
                {formatTimestamp(msg.timestamp)}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Floating Input Area */}
      <div className="relative pb-6">
        {voiceMode ? (
          <div className="max-w-3xl mx-auto w-full px-4">
            {renderWaveform()}
            <div className="flex justify-center mt-2">
              <Button
                onClick={() =>
                  isListening ? stopListening() : startListening()
                }
                className={`${
                  isListening
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-black hover:bg-black/90"
                } text-white rounded-full px-6`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Listening
                  </>
                )}
              </Button>
            </div>
            {input && (
              <div className="mt-4 p-3 border border-black/20 rounded-lg bg-gray-50 font-mono text-sm">
                {input}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full px-4">
            <div className="flex items-center gap-2 font-mono text-black bg-white rounded-xl p-3 border-2 border-black/20 shadow-lg focus-within:border-black transition-colors">
              <span className="text-black font-bold">user@plutus</span>
              <span className="text-black/70">:~$</span>
              <Input
                placeholder="Type your command..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none text-black placeholder:text-black/30 focus:outline-none focus:ring-0 font-mono"
              />
              <Button
                onClick={() => handleSendMessage()}
                size="icon"
                disabled={isLoading}
                className="bg-black text-white hover:bg-black/90 rounded-md h-8 w-8"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetails;