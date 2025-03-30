import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import {
  LidoSDK,
  TransactionCallbackStage,
  SDKError,
} from "@lidofinance/lido-ethereum-sdk";
import { parseEther, formatEther } from "viem";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface StakingCardProps {
  web3Provider: any; // from Privy
  account: string;
}

// const INFURA_API_KEY = "00d918690e7246579fb6feabe829e5c8"; // Replace with your Infura API Key
// const network = "sepolia"; // or "goerli", "polygon", etc.

export const StakingCard: React.FC<StakingCardProps> = ({
  web3Provider,
  account,
}) => {
  console.log("web3Provider", web3Provider);
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [gasEstimate, setGasEstimate] = useState<string>("");
  const [stakingLimit, setStakingLimit] = useState<string>("0");
  const [stakedBalance, setStakedBalance] = useState<string>("0");

  // Initialize LidoSDK once using useMemo
  const lidoSDK = useMemo(() => {
    if (!web3Provider) return null;
    return new LidoSDK({
      rpcUrls: ["https://ethereum-holesky.publicnode.com"],
      chainId: 17000,
      web3Provider,
    });
  }, [web3Provider]);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!lidoSDK || !account) return;

      try {
        const [balanceETH, balanceShares] = await Promise.all([
          lidoSDK.core.balanceETH(account as `0x${string}`),
          lidoSDK.shares.balance(account as `0x${string}`),
        ]);

        setBalance(formatEther(balanceETH));
        setStakedBalance(formatEther(balanceShares));
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
  }, [lidoSDK, account]);

  useEffect(() => {
    const fetchStakingLimit = async () => {
      if (!lidoSDK) return;

      try {
        const limit = await lidoSDK.stake.getStakeLimitInfo();
        setStakingLimit(formatEther(limit.currentStakeLimit));
      } catch (error) {
        console.error("Error fetching staking limit:", error);
      }
    };

    fetchStakingLimit();
  }, [lidoSDK]);

  const estimateGas = async (type: "stake" | "withdraw") => {
    if (!amount || !lidoSDK || !account) return;

    try {
      const value = parseEther(amount.toString());

      let estimate;
      if (type === "stake") {
        estimate = await lidoSDK.stake.stakeEthEstimateGas({
          value: value,
          account: account as `0x${string}`,
        });
      } else {
        estimate =
          await lidoSDK.withdraw.request.requestWithdrawalEstimateGas(
            {
              amount: value,
              token: "stETH",
              account: account as `0x${string}`,
            }
          );
      }

      const estimateInEth = formatEther(estimate);
      setGasEstimate(estimateInEth);
      setStatus(`Estimated gas cost: ${estimateInEth} ETH`);
    } catch (error) {
      console.error("Error estimating gas:", error);
      setStatus(
        "Error calculating gas estimate. Make sure you have sufficient stETH balance."
      );
      setGasEstimate("");
    }
  };

  const handleCallback = ({
    stage,
    payload,
  }: {
    stage: TransactionCallbackStage;
    payload: unknown;
  }) => {
    switch (stage) {
      case TransactionCallbackStage.SIGN:
        setStatus("Please sign the transaction...");
        break;
      case TransactionCallbackStage.RECEIPT:
        setStatus("Transaction submitted. Waiting for confirmation...");
        setTxHash(payload as string);
        break;
      case TransactionCallbackStage.CONFIRMATION:
        setStatus("Transaction is being confirmed...");
        break;
      case TransactionCallbackStage.DONE:
        setStatus("Transaction successful! 🎉");
        break;
      case TransactionCallbackStage.ERROR:
        const error = payload as SDKError;
        setStatus(`Error: ${error.errorMessage}`);
        break;
      default:
        break;
    }
  };

  const handleStake = async () => {
    if (!amount || !lidoSDK || !account) return;

    setIsLoading(true);
    setStatus("Initializing stake...");

    try {
      const amountWei = parseEther(amount);
      const limitWei = parseEther(stakingLimit);

      if (amountWei > limitWei) {
        setStatus(
          `Error: Amount exceeds daily staking limit of ${stakingLimit} ETH`
        );
        return;
      }

      console.log("Staking amount:", amount, "ETH");
      console.log("Account:", account);

      const stakeTx = await lidoSDK.stake.stakeEth({
        value: amountWei,
        callback: handleCallback as any,
        account: account as `0x${string}`,
      });

      console.log("Stake transaction:", stakeTx);

      setStatus(
        `Stake completed! Received ${formatEther(
          stakeTx.result?.stethReceived || BigInt(0)
        )} stETH`
      );
    } catch (error) {
      console.error("Detailed stake error:", error);
      const sdkError = error as SDKError;
      setStatus(
        `Error: ${
          sdkError.errorMessage ||
          "Transaction failed. Please check if your wallet is properly connected and has sufficient funds."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !lidoSDK || !account) return;

    setIsWithdrawing(true);
    setStatus("Initializing withdrawal...");

    try {
      await estimateGas("withdraw");
      const withdrawTx =
        await lidoSDK.withdraw.request.requestWithdrawalWithPermit({
          amount: parseEther(amount.toString()),
          token: "stETH",
          callback: handleCallback as any,
          account: account as `0x${string}`,
        });

      setStatus(
        `Withdrawal request created! Request IDs: ${withdrawTx.result?.requests
          .map((r) => r.requestId)
          .join(", ")}`
      );
    } catch (error) {
      const sdkError = error as SDKError;
      setStatus(`Error: ${sdkError.errorMessage}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleEstimateGas = async (type: "stake" | "withdraw") => {
    if (!amount) {
      setStatus("Please enter an amount first");
      return;
    }

    setStatus(`Calculating ${type} gas estimate...`);
    await estimateGas(type);
    setStatus(
      `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } gas estimation complete: ${gasEstimate} ETH`
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white border-2 border-black rounded-xl">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-black"></div>
          <CardTitle className="text-black font-bold font-montserrat">
            Stake/Withdraw ETH with Lido
          </CardTitle>
        </div>
        <CardDescription className="text-black/70 font-montserrat">
          Stake your ETH to earn staking rewards or withdraw your staked ETH
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-montserrat text-black font-medium">
              Amount (ETH)
            </label>
            <div className="flex gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-sm text-black/70 font-montserrat">
                      Balance: {balance} ETH
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border-2 border-black text-black font-montserrat">
                    Your ETH Balance
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-sm text-black/70 font-montserrat">
                      Staked: {stakedBalance} stETH
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border-2 border-black text-black font-montserrat">
                    Your Staked ETH Balance
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading || isWithdrawing}
            min="0"
            step="0.01"
            className="bg-white border-2 border-black text-black font-montserrat placeholder:text-black/30 focus:border-black focus:ring-black/20"
          />
          <div className="text-sm text-black/70 font-montserrat">
            Daily Staking Limit: {stakingLimit} ETH
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => handleEstimateGas("stake")}
              variant="outline"
              disabled={!amount}
              className="w-full mb-2 border-2 border-black text-black hover:bg-gray-50 font-montserrat bg-white"
            >
              Estimate Stake Gas
            </Button>
            <Button
              onClick={() => handleEstimateGas("withdraw")}
              variant="outline"
              disabled={!amount}
              className="w-full border-2 border-black text-black hover:bg-gray-50 font-montserrat bg-white"
            >
              Estimate Withdraw Gas
            </Button>
          </div>
          {gasEstimate && (
            <div className="text-sm text-black/70 font-montserrat">
              Estimated Gas: {gasEstimate} ETH
            </div>
          )}
          {status && (
            <div className="p-3 rounded-xl bg-white border-2 border-black">
              <p className="text-sm text-black font-montserrat">{status}</p>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-black hover:underline font-montserrat mt-2 block"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={handleStake}
          disabled={isLoading || isWithdrawing || !amount}
          className="flex-1 bg-black text-white font-montserrat hover:bg-gray-900 transition-colors"
        >
          {isLoading ? "Staking..." : "Stake ETH"}
        </Button>
        <Button
          onClick={handleWithdraw}
          disabled={isLoading || isWithdrawing || !amount}
          variant="outline"
          className="flex-1 border-2 border-black text-black hover:bg-gray-50 font-montserrat bg-white"
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw ETH"}
        </Button>
      </CardFooter>
    </Card>
)};
