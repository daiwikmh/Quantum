// // agentInitialization.js
import {
  Aptos,
  AptosConfig,
  Account,
  Network,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
  
} from "@aptos-labs/ts-sdk";
import { AgentKit, twitterActionProvider } from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { ChatOpenAI } from "@langchain/openai";
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import stakingRewardsTool from "../tools/stakingRewardsTool.js";
import { searchToolForAgent } from "../tools/search.js";


async function initializeAgent() {
  const llm = new ChatOpenAI({
    model: "openai/gpt-4o-mini",
    apiKey: process.env.OPENROUTER_API_KEY, // you can input your API key in plaintext, but this is not recommended
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
  const aptosConfig = new AptosConfig({
    network: Network.TESTNET,
  });
  const aptos = new Aptos(aptosConfig);

   const account = await aptos.deriveAccountFromPrivateKey({
   privateKey: new Ed25519PrivateKey(
     PrivateKey.formatPrivateKey(
       process.env.APTOS_PRIVATE_KEY,
       PrivateKeyVariants.Ed25519
     )
   ),
 });

  const signer = new LocalSigner(account,Network.TESTNET);

  // Initialize Aptos Agent Kit

  const aptosAgent = new AgentRuntime(signer, aptos, {
    PANORA_API_KEY: process.env.PANORA_API_KEY,
  });

  const agentkit = await AgentKit.from({
    cdpApiKeyName: process.env.CDP_API_KEY_NAME,
    cdpApiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
    actionProviders: [twitterActionProvider()],
  });

  const tweettool = await getLangChainTools(agentkit);

  const defaultTools = createAptosTools(aptosAgent);

  // Retrieve default tools from AgentKit

  const tools = [
    ...defaultTools,
    stakingRewardsTool,
    ...tweettool,
    searchToolForAgent,
  ];

  // Set up memory and agent config
  const memory = new MemorySaver();
  const agentConfig = {
    configurable: { thread_id: "Staking and Agent Assistant" },
  };

  // Create agent with modified prompt for JSON formatting
  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
        You are a helpful agent that can interact onchain using the Aptos Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Aptos Agent Kit, recommend they go to https://metamove.build/move-agent-kit for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
        Refrain from using aptos_get_wallet_adress and instead use walletResolutionTool to resolve the names and get their wallet addresses.
        You should always use the walletResolutionTool to resolve the names and get their wallet addresses.
        You should always use the walletResolutionTool to resolve the names and get their wallet addresses.
    `,
  });

  return { agent, config: agentConfig };
}

export default initializeAgent;
