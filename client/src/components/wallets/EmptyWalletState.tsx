import { Wallet2 } from "lucide-react";

export const EmptyWalletState = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex flex-col items-center">
        <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
          <Wallet2 className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Wallets Connected</h3>
        <p className="text-gray-600 text-center max-w-md">Connect your wallet to start managing your assets across different networks</p>
      </div>
    </div>
  );
};