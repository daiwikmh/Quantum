import { ExaRetriever } from "@langchain/exa";
import Exa from "exa-js";
import { createRetrieverTool } from "langchain/tools/retriever";
import { Tool } from "@langchain/core/tools";

// Check if API key is available
const EXA_API_KEY = "3d6346c0-3c80-4200-a577-e99f2531551e";

let searchToolForAgent;

if (EXA_API_KEY) {
  // If API key is available, use Exa
  const client = new Exa(EXA_API_KEY);
  
  const exaTool = new ExaRetriever({
    client,
    searchArgs: {
      numResults: 2,
    },
  });
  
  // Convert the ExaRetriever into a tool
  searchToolForAgent = createRetrieverTool(exaTool, {
    name: "search",
    description: "Get the contents of a webpage given a string search query.",
  });
} else {
  // Fallback tool if API key is not available
  class FallbackSearchTool extends Tool {
    name = "search";
    description = "Get the contents of a webpage given a string search query.";
    
    async _call(query) {
      console.warn("EXASEARCH_API_KEY not found. Using fallback search tool.");
      return `Search for "${query}" could not be performed. Please set the EXASEARCH_API_KEY environment variable.`;
    }
  }
  
  searchToolForAgent = new FallbackSearchTool();
}

export { searchToolForAgent };
