import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AssetPage from "./components/AssetPage";
import LiquidityPage from "./components/LiquidityPage"; // Import LiquidityPage
import { getWalletBySource } from "@talismn/connect-wallets";

function App() {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const talismanWallet = getWalletBySource("talisman");

  const connectTalismanWallet = async () => {
    if (!talismanWallet) {
      alert("Talisman wallet not found! Please install it.");
      return;
    }

    try {
      await talismanWallet.enable("chain-abstraction");

      const unsubscribe = await talismanWallet.subscribeAccounts(
        (walletAccounts) => {
          setAccounts(walletAccounts);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error connecting to Talisman:", err);
    }
  };

  useEffect(() => {
    if (!accounts.length) return;
    setDefaultAccount(accounts[0]);
    console.log("All connected wallet accounts with our dapp:", accounts);
  }, [accounts]);

  const disconnectWalletHandler = () => {
    setDefaultAccount(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-10 pt-20">
      {/* Navbar */}
      <Navbar
        defaultAccount={defaultAccount?.address}
        connectWalletHandler={connectTalismanWallet}
        disconnectWalletHandler={disconnectWalletHandler}
      />

<div className="flex flex-col md:flex-row gap-10 justify-center">
  {/* Mint Page */}
  <div className="w-full md:w-4/5">
    <AssetPage defaultAccount={defaultAccount} />
  </div>

  {/* Liquidity Page */}
  <div className="w-full md:w-4/5">
    <LiquidityPage defaultAccount={defaultAccount} />
  </div>
</div>

    </div>
  );
}

export default App;
