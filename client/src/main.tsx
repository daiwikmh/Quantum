import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PrivyProvider } from "@privy-io/react-auth";

import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import ErrorBoundary from "./ErrorBoundary.tsx";
import { Toaster } from "sonner";
import { BrowserRouter } from "react-router";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  shouldAutoConnect: true,
});

const opts = {
  redirectUri: "http://localhost:5173/redirect",
  referralCode: "PARTNER6",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PrivyProvider
        appId="cm8uzk1ce01umghbgnzuxmqn5"
        config={{
          externalWallets: {
            solana: {
              connectors: solanaConnectors,
            },
          },
          loginMethods: ["email"],
          appearance: {
            theme: "light",
            accentColor: "#676FFF",
            walletList: [
              "metamask",
              "coinbase_wallet",
              "rainbow",
              "wallet_connect",
              "phantom",
              "safe",
              "detected_wallets",
            ],
          },
        }}
      >
          <BrowserRouter>
            <AptosWalletAdapterProvider>
              <App />
            </AptosWalletAdapterProvider>

          </BrowserRouter>

        <Toaster />
      </PrivyProvider>
    </ErrorBoundary>
  </StrictMode>
);
