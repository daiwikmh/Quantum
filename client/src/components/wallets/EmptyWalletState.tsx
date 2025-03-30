import { Wallet2 } from "lucide-react";

export const EmptyWalletState = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted rounded-xl border-2 border-dashed border-border">
      <Wallet2 className="w-12 h-12 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium text-foreground mb-1">No Wallets Connected</h3>
      <p className="text-muted-foreground">Connect a wallet to get started</p>
    </div>
  );
};