import React, { useState } from "react";
import { depositLiquidity, withdrawLiquidity } from "../utils/chain";

function LiquidityPage({ defaultAccount }) {
  const [operation, setOperation] = useState("depositLiquidity"); // Default operation
  const [formData, setFormData] = useState({
    asset1: "",
    asset2: "",
    amount1: "",
    amount2: "",
  });

  const [statusMessage, setStatusMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle dropdown change
  const handleOperationChange = (e) => {
    setOperation(e.target.value);
    setStatusMessage(""); // Reset message when changing operation
  };

  const formatTransactionMessage = (operationName, txResult) => {
    if (!txResult) return `⚠️ ${operationName} submitted, but no confirmation received.`;

    if (txResult.status === "success") {
      return `✅ ${operationName} Successful! TX Hash: ${txResult.txHash}`;
    } else if (txResult.status === "failed") {
      return `❌ ${operationName} Failed! TX Hash: ${txResult.txHash}, Reason: ${txResult.reason}`;
    } else {
      return `⚠️ ${operationName} status unknown. TX Hash: ${txResult.txHash}`;
    }
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!defaultAccount) {
      setStatusMessage("❌ Wallet not connected!");
      return;
    }

    try {
      setStatusMessage("🚀 Processing transaction...");

      let response;
      switch (operation) {
        case "depositLiquidity":
          response = await depositLiquidity(
            formData.asset1,
            formData.asset2,
            formData.amount1,
            formData.amount2,
            defaultAccount
          );
          break;

        case "withdrawLiquidity":
          response = await withdrawLiquidity(
            formData.asset1,
            formData.asset2,
            formData.amount1,
            formData.amount2,
            defaultAccount
          );
          break;

        default:
          setStatusMessage("❌ Invalid operation selected!");
          return;
      }

      setStatusMessage(formatTransactionMessage(operation, response));
    } catch (error) {
      setStatusMessage("❌ Transaction failed! See console for details.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white text-gray-900 rounded-lg shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-center">Liquidity Management</h2>

      {/* Operation Selection */}
      <select
        value={operation}
        onChange={handleOperationChange}
        className="w-full p-3 border rounded bg-gray-100 text-gray-900"
      >
        <option value="">Select Operation</option>
        <option value="depositLiquidity">Deposit Liquidity</option>
        <option value="withdrawLiquidity">Withdraw Liquidity</option>
      </select>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {/* Asset 1 */}
        <input
          type="text"
          name="asset1"
          placeholder="Asset 1 ID"
          value={formData.asset1}
          onChange={handleChange}
          className="w-full p-3 border rounded bg-gray-100 text-gray-900"
          required
        />

        {/* Asset 2 */}
        <input
          type="text"
          name="asset2"
          placeholder="Asset 2 ID"
          value={formData.asset2}
          onChange={handleChange}
          className="w-full p-3 border rounded bg-gray-100 text-gray-900"
          required
        />

        {/* Amount Fields */}
        <input
          type="text"
          name="amount1"
          placeholder="Amount 1"
          value={formData.amount1}
          onChange={handleChange}
          className="w-full p-3 border rounded bg-gray-100 text-gray-900"
          required
        />

        <input
          type="text"
          name="amount2"
          placeholder="Amount 2"
          value={formData.amount2}
          onChange={handleChange}
          className="w-full p-3 border rounded bg-gray-100 text-gray-900"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded transition"
        >
          Execute {operation.replace(/([A-Z])/g, " $1")}
        </button>
      </form>

      {statusMessage && (
        <p className="mt-4 text-center text-sm text-gray-700 break-all font-mono">
          {statusMessage}
        </p>
      )}
    </div>
  );
}

export default LiquidityPage;
