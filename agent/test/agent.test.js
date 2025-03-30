import { expect } from "chai"; // Assuming you are using Chai for assertions
import initializeAgent from "../aiAgent/agentInitialization.js";

describe("Agent Initialization", () => {
  it("should initialize the agent successfully", async () => {
    try {
      const { agent } = await initializeAgent();
      expect(agent).to.exist; // Check if agent is defined
      expect(agent).to.have.property("tools"); // Check if agent has a tools property
    } catch (error) {
      throw new Error(`Failed to initialize agent: ${error.message}`);
    }
  });
});
