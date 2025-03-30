import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";

class CookieAPITool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "CookieAPI",
      description: `A tool to interact with Cookie DAO API. Available operations:
        - getAgentByTwitter: Get agent details using Twitter username
        - getAgentByContract: Get agent details using contract address
        - getAgentsList: Get paginated list of agents
        - searchTweets: Search for tweets within a date range`,
      schema: z.object({
        operation: z.enum([
          "getAgentByTwitter",
          "getAgentByContract",
          "getAgentsList",
          "searchTweets",
        ]),
        params: z
          .object({
            username: z.string().optional(),
            address: z.string().optional(),
            interval: z.string().optional().default("_7Days"),
            page: z.number().optional().default(1),
            pageSize: z.number().optional().default(10),
            query: z.string().optional(),
            from: z.string().optional(),
            to: z.string().optional(),
          })
          .optional(),
      }),
    });

    this.API_BASE_URL = "https://api.cookie.fun";
    this.apiKey = process.env.COOKIE_DAO_API_KEY;
  }

  async apiClient(endpoint, params = {}, searchQuery = null) {
    try {
      const url = searchQuery
        ? `https://api.cookie.fun${endpoint.replace(
            ":searchQuery",
            encodeURIComponent(searchQuery)
          )}`
        : `https://api.cookie.fun${endpoint}`;

      const response = await axios.get(url, {
        headers: { "x-api-key": process.env.COOKIE_DAO_API_KEY},
        params,
      });

      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw error;
    }
  }

  async _call(args) {
    try {
      const { operation, params = {} } = args;

      switch (operation) {
        case "getAgentByTwitter": {
          const { username, interval = "_7Days" } = params;
          if (!username) throw new Error("Username is required");
          return await this.apiClient(
            `/v2/agents/twitterUsername/${username}`,
            { interval }
          );
        }

        case "getAgentByContract": {
          const { address, interval = "_7Days" } = params;
          if (!address) throw new Error("Contract address is required");
          return await this.apiClient(`/v2/agents/contractAddress/${address}`, {
            interval,
          });
        }

        case "getAgentsList": {
          const { interval = "_7Days", page = 1, pageSize = 10 } = params;
          return await this.apiClient("/v2/agents/agentsPaged", {
            interval,
            page,
            pageSize,
          });
        }

        case "searchTweets": {
          const { query, from, to } = params;
          if (!query || !from || !to) {
            throw new Error("Missing required parameters: query, from, to");
          }
          return await this.apiClient(
            "/v1/hackathon/search/:searchQuery",
            { from, to },
            query
          );
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      console.error(
        `CookieAPITool error for operation ${args.operation}:`,
        error
      );
      return {
        error: true,
        message: error.message,
        operation: args.operation,
      };
    }
  }
}

// Create and export a single instance
const cookieAPITool = new CookieAPITool();
export default cookieAPITool;
