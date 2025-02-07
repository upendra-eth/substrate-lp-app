import React, { useState } from "react";
import { transferAsset, mintAsset, createAsset } from "../utils/chain";

function AssetPage({ defaultAccount }) {
  const [operation, setOperation] = useState("createAsset"); // Default operation
  const [formData, setFormData] = useState({
    toAddress: "",
    amount: "",
    assetId: "",
    adminAddress: "",
    minBalance: "",
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
        case "transferAsset":
          response = await transferAsset(formData.assetId, formData.toAddress, formData.amount, defaultAccount);
          break;

        case "mintAsset":
          response = await mintAsset(formData.assetId, formData.toAddress, formData.amount, defaultAccount);
          break;

        case "createAsset":
          response = await createAsset(formData.assetId, formData.adminAddress, formData.minBalance, defaultAccount);
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
      <h2 className="text-2xl font-bold mb-6 text-center"> Asset Management</h2>

      {/* Operation Selection */}
      <select
        value={operation}
        onChange={handleOperationChange}
        className="w-full p-3 border rounded bg-gray-100 text-gray-900"
      >
        <option value="">Select Operation</option>
        <option value="transferAsset">Transfer Asset</option>
        <option value="mintAsset">Mint Asset</option>
        <option value="createAsset">Create Asset</option>
      </select>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {/* Common Fields for Transfer and Mint */}
        {(operation === "transferAsset" || operation === "mintAsset") && (
          <input
            type="text"
            name="toAddress"
            placeholder="To Address"
            value={formData.toAddress}
            onChange={handleChange}
            className="w-full p-3 border rounded bg-gray-100 text-gray-900"
            required
          />
        )}

        {/* Asset ID (Required for Transfer, Mint, Create) */}
        {operation !== "" && (
          <input
            type="text"
            name="assetId"
            placeholder="Asset ID"
            value={formData.assetId}
            onChange={handleChange}
            className="w-full p-3 border rounded bg-gray-100 text-gray-900"
            required
          />
        )}

        {/* Amount Field (Required for all except Create Asset) */}
        {operation !== "createAsset" && operation !== "" && (
          <input
            type="text"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-3 border rounded bg-gray-100 text-gray-900"
            required
          />
        )}

        {/* Create Asset Fields */}
        {operation === "createAsset" && (
          <>
            <input
              type="text"
              name="adminAddress"
              placeholder="Admin Address"
              value={formData.adminAddress}
              onChange={handleChange}
              className="w-full p-3 border rounded bg-gray-100 text-gray-900"
              required
            />

            <input
              type="text"
              name="minBalance"
              placeholder="Minimum Balance"
              value={formData.minBalance}
              onChange={handleChange}
              className="w-full p-3 border rounded bg-gray-100 text-gray-900"
              required
            />
          </>
        )}

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

export default AssetPage;
