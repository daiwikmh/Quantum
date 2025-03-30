import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { GraphQLClient, gql } from "graphql-request";

class StakingRewardsTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "StakingRewardsAPI",
      description: `A tool to fetch staking rewards data from the StakingRewards GraphQL API. Available operations:
        - getTopAssets: Get top assets with their reward rates (step1)
        - getAaveMetrics: Get Aave-specific staking metrics (step2)
        - getProviders: List top staking providers (step3)
        - getCosmosProviders: Get Cosmos-specific providers (step4)
        - getLiquidStakingOptions: Get Ethereum 2.0 liquid staking options (step5)
        - getValidatorMetrics: Get detailed validator metrics (step6)
        - getAllMetrics: Get all available metrics (step7)`,
      schema: z.object({
        operation: z.enum([
          "getTopAssets",
          "getAaveMetrics",
          "getProviders",
          "getCosmosProviders",
          "getLiquidStakingOptions",
          "getValidatorMetrics",
          "getAllMetrics",
        ]),
      }),
    });

    // Define GraphQL queries
    this.queries = {
      getTopAssets: gql`
        {
          assets(limit: 10) {
            id
            slug
            logoUrl
            metrics(where: { metricKeys: ["reward_rate"] }, limit: 1) {
              defaultValue
            }
          }
        }
      `,
      getAaveMetrics: gql`
        {
          assets(where: { slugs: ["aave"] }, limit: 1) {
            id
            slug
            logoUrl
            metrics(
              where: { metricKeys: ["reward_rate"], createdAt_lt: "2023-06-28" }
              limit: 10
              order: { createdAt: desc }
            ) {
              defaultValue
              createdAt
            }
          }
        }
      `,
      getProviders: gql`
        {
          providers(limit: 10) {
            name
            logoUrl
            metrics(
              where: { metricKeys: ["assets_under_management"] }
              limit: 1
            ) {
              defaultValue
            }
          }
        }
      `,
      getCosmosProviders: gql`
        {
          providers(
            where: { rewardOptions: { inputAsset: { slugs: ["cosmos"] } } }
            isVerified: true
            order: { metricKey_desc: "assets_under_management" }
            limit: 10
          ) {
            slug
            rewardOptions(where: { inputAsset: { slugs: ["cosmos"] } }) {
              metrics(where: { metricKeys: ["reward_rate"] }, limit: 1) {
                defaultValue
              }
            }
          }
        }
      `,
      getLiquidStakingOptions: gql`
        {
          rewardOptions(
            where: {
              inputAsset: { slugs: ["ethereum-2-0"] }
              typeKeys: ["liquid-staking"]
            }
            limit: 5
            order: { metricKey_desc: "staked_tokens" }
          ) {
            providers(limit: 1) {
              name
              slug
              logoUrl
              isVerified
            }
            metrics(
              where: {
                metricKeys: [
                  "commission"
                  "staking_wallets"
                  "staked_tokens"
                  "reward_rate"
                  "staking_share"
                  "net_staking_flow_7d"
                ]
              }
              limit: 6
            ) {
              label
              metricKey
              defaultValue
            }
          }
        }
      `,
      getValidatorMetrics: gql`
        {
          rewardOptions(
            where: { providers: { slugs: ["allnodes"] } }
            limit: 5
            order: { metricKey_desc: "reward_rate" }
          ) {
            inputAssets(limit: 1) {
              slug
            }
            metrics(where: { metricKeys: ["reward_rate"] }, limit: 1) {
              defaultValue
            }
            validators(limit: 500) {
              address
              metrics(
                where: {
                  metricKeys: [
                    "commission"
                    "staking_wallets"
                    "self_staked_tokens"
                    "staked_tokens"
                    "reward_rate"
                    "staking_share"
                    "net_staking_flow_7d"
                  ]
                }
                limit: 7
              ) {
                label
                metricKey
                defaultValue
              }
            }
          }
        }
      `,
      getAllMetrics: gql`
        {
          metrics(limit: 20) {
            label
            metricKey
            defaultValue
          }
        }
      `,
    };
  }

  async callQuery(query) {
    const response = await fetch(
      "https://api.stakingrewards.com/public/query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.STAKING_REWARDS_API_KEY,
        },
        body: JSON.stringify({ query }),
      }
    );

    // Parse the JSON from the response
    const json = await response.json();

    // Return the inner data object
    return json;
  }
  async _call(args) {
    try {
      console.log("StakingRewardsTool called with args:", args);

      // if (!process.env.STAKING_REWARDS_API_KEY) {
      //   console.log("API key hee nhi");
      // }

      const query = this.queries[args.operation];
      if (!query) {
        throw new Error(`Unknown operation: ${args.operation}`);
      }

      // Make the GraphQL request
      const response = await this.callQuery(query);
      console.log("GraphQL response:", response);

      if (!response || !response.data) {
        throw new Error("Invalid response from GraphQL API");
      }

      // Format the response, passing the data property
      const formattedResponse = this.formatResponse(
        args.operation,
        response.data
      );
      console.log("Formatted response:", formattedResponse);

      return formattedResponse;
    } catch (error) {
      console.error(`StakingRewardsTool error:`, error);
      return {
        error: true,
        message: `Error fetching staking data: ${error.message}`,
        operation: args.operation,
        data: null,
      };
    }
  }

  formatResponse(operation, data) {
    try {
      switch (operation) {
        case "getTopAssets":
          if (!data.assets || !Array.isArray(data.assets)) {
            throw new Error("Invalid assets data structure");
          }
          return {
            type: "assets",
            items: data.assets
              .filter(
                (asset) => asset.metrics && asset.metrics[0]?.defaultValue
              ) // Filter out null metrics
              .map((asset) => ({
                name: asset.slug,
                rewardRate: asset.metrics[0].defaultValue.toFixed(2),
                logo: asset.logoUrl,
                type: "asset",
              })),
          };

        case "getAaveMetrics":
          const aaveAsset = data.assets?.[0];
          if (!aaveAsset) {
            throw new Error("Aave data not found");
          }
          return {
            type: "metrics",
            protocol: "Aave",
            currentRate:
              aaveAsset.metrics?.[0]?.defaultValue?.toFixed(2) || "N/A",
            historicalRates:
              aaveAsset.metrics?.map((metric) => ({
                rate: metric.defaultValue?.toFixed(2) || "N/A",
                date: metric.createdAt,
              })) || [],
          };

        case "getProviders":
          if (!data.providers || !Array.isArray(data.providers)) {
            throw new Error("Invalid providers data structure");
          }
          return {
            type: "providers",
            items: data.providers
              .filter(
                (provider) =>
                  provider.metrics && provider.metrics[0]?.defaultValue
              )
              .map((provider) => ({
                name: provider.name,
                aum: provider.metrics[0].defaultValue.toFixed(2),
                logo: provider.logoUrl,
                type: "provider",
              })),
          };

        case "getCosmosProviders":
          if (!data.providers || !Array.isArray(data.providers)) {
            throw new Error("Invalid Cosmos providers data structure");
          }
          return {
            type: "providers",
            network: "Cosmos",
            items: data.providers
              .filter(
                (provider) =>
                  provider.rewardOptions?.[0]?.metrics?.[0]?.defaultValue
              )
              .map((provider) => ({
                name: provider.slug,
                rewardRate:
                  provider.rewardOptions[0].metrics[0].defaultValue.toFixed(2),
                type: "provider",
              })),
          };

        case "getLiquidStakingOptions":
          if (!data.rewardOptions || !Array.isArray(data.rewardOptions)) {
            throw new Error("Invalid liquid staking options data structure");
          }
          return {
            type: "liquid_staking",
            items: data.rewardOptions.map((option) => {
              const metrics = option.metrics.reduce((acc, metric) => {
                acc[metric.metricKey] =
                  metric.defaultValue?.toFixed(2) || "N/A";
                return acc;
              }, {});

              return {
                provider: option.providers[0]?.name || "Unknown",
                providerSlug: option.providers[0]?.slug,
                logo: option.providers[0]?.logoUrl,
                isVerified: option.providers[0]?.isVerified,
                commission: metrics.commission || "N/A",
                stakingWallets: metrics.staking_wallets || "N/A",
                stakedTokens: metrics.staked_tokens || "N/A",
                rewardRate: metrics.reward_rate || "N/A",
                stakingShare: metrics.staking_share || "N/A",
                netStakingFlow: metrics.net_staking_flow_7d || "N/A",
                type: "liquid_staking_option",
              };
            }),
          };

        case "getValidatorMetrics":
          if (!data.rewardOptions || !Array.isArray(data.rewardOptions)) {
            throw new Error("Invalid validator metrics data structure");
          }
          return {
            type: "validator_metrics",
            items: data.rewardOptions.map((option) => ({
              asset: option.inputAssets[0]?.slug || "Unknown",
              rewardRate: option.metrics[0]?.defaultValue?.toFixed(2) || "N/A",
              validators: option.validators.map((validator) => {
                const metrics = validator.metrics.reduce((acc, metric) => {
                  acc[metric.metricKey] =
                    metric.defaultValue?.toFixed(2) || "N/A";
                  return acc;
                }, {});

                return {
                  address: validator.address,
                  commission: metrics.commission,
                  stakingWallets: metrics.staking_wallets,
                  selfStaked: metrics.self_staked_tokens,
                  totalStaked: metrics.staked_tokens,
                  rewardRate: metrics.reward_rate,
                  stakingShare: metrics.staking_share,
                  netFlow: metrics.net_staking_flow_7d,
                  type: "validator",
                };
              }),
            })),
          };

        case "getAllMetrics":
          if (!data.metrics || !Array.isArray(data.metrics)) {
            throw new Error("Invalid metrics data structure");
          }
          return {
            type: "all_metrics",
            items: data.metrics.map((metric) => ({
              label: metric.label,
              key: metric.metricKey,
              value: metric.defaultValue?.toFixed(2) || "N/A",
            })),
          };

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      console.error("Error formatting response:", error);
      return {
        error: true,
        message: `Error formatting response: ${error.message}`,
        operation: operation,
        data: null,
      };
    }
  }
}

// Create and export a single instance
const stakingRewardsTool = new StakingRewardsTool();
export default stakingRewardsTool;

