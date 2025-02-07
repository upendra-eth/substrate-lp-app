import React from "react";

function Navbar({ defaultAccount, connectWalletHandler, disconnectWalletHandler }) {
  const handleConnect = () => {
    if (defaultAccount) {
      disconnectWalletHandler();
    } else {
      connectWalletHandler();      
    }
  };

  // Format Ethereum address (shortened)
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="w-full bg-gray-900 text-white flex items-center justify-between py-4 px-8 shadow-md">
      {/* Logo or Title (Left) */}
      <div className="text-xl font-semibold">Liquidity Management App</div>

      {/* Right Section - Wallet Address & Connect Button */}
      <div className="flex items-center space-x-4 ml-auto">
        {defaultAccount && (
          <div className="text-sm text-gray-300 hidden md:block">
            {formatAddress(defaultAccount)}
          </div>
        )}
        
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-transform transform hover:scale-105"
          onClick={handleConnect}
        >
          {defaultAccount ? "Disconnect" : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
