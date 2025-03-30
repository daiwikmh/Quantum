import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { getCurrentEmail } from "../index.js";

class WalletResolutionTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "WalletResolutionTool",
      description: `A tool for resolving wallet names to their associated Aptos addresses.
      Input should contain:
      - name: friendly name of the wallet (e.g., "dev", "alice")
      Example: {"name": "dev"}`,
      schema: z.object({
        name: z.string(),
      }),
    });
    this.API_URL = "http://localhost:3001";
  }

  async #resolveWalletAddress(name) {
    try {
      const email = getCurrentEmail();
      if (!email) {
        throw new Error("Email not set");
      }

      const response = await fetch(
        `${this.API_URL}/api/saved-wallets/goutamkumar.sharmq@gmail.com`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch saved wallets");
      }

      const data = await response.json();

      // Access the wallets array from the response data
      const wallets = data.wallets;

      if (!Array.isArray(wallets)) {
        throw new Error("Invalid wallet data received");
      }

      // Find the wallet with matching nickname
      const wallet = wallets.find(
        (w) => w.nickname.toLowerCase() === name.toLowerCase()
      );

      if (!wallet) {
        throw new Error(`No wallet found with name: ${name}`);
      }

      return wallet.address;
    } catch (error) {
      throw new Error(`Error resolving wallet address: ${error.message}`);
    }
  }

  async _call(args) {
    try {
      const address = await this.#resolveWalletAddress(args.name);

      return {
        type: "wallet_resolution",
        status: "success",
        message: `Found address for ${args.name}`,
        data: {
          name: args.name,
          address: address,
        },
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  }
}

const walletResolutionTool = new WalletResolutionTool();
export default walletResolutionTool;
