import { ApiPromise, HttpProvider } from "@polkadot/api";
import { BN } from "@polkadot/util"; // Import BN for handling large numbers

const NODE_URL = "http://127.0.0.1:9944"; // Update if needed

async function getApi() {
    const provider = new HttpProvider(NODE_URL);
    return await ApiPromise.create({ provider });
}

async function signAndSendExtrinsic(extrinsic, defaultAccount, operationName) {
    // Ensure the signer exists before proceeding
    if (!defaultAccount || !defaultAccount.signer) {
        console.error(`❌ Wallet not connected or signer missing for ${operationName}.`);
        return { status: "error", message: "Wallet not connected or signer missing." };
    }

    try {
        console.log(`📜 Signing and sending ${operationName} transaction...`);

        // Sign and send transaction
        const txHash = await extrinsic.signAndSend(defaultAccount.address, { signer: defaultAccount.signer });
        console.log(`🔹 Transaction Hash for ${operationName}: ${txHash.toHex()}`);

        // Check transaction status
        const txResult = await checkTransactionStatus(txHash);

        if (txResult) {
            console.log(`✅ ${operationName} status:`, txResult);
            return { status: txResult.status, txHash: txHash.toHex() }; // Return transaction hash instead of block hash
        } else {
            console.warn(`⚠️ ${operationName} submitted but no confirmation received.`);
            return { status: "unknown", txHash: txHash.toHex(), message: "Transaction status unknown" };
        }

    } catch (error) {
        console.error(`❌ Error during ${operationName}:`, error);
        return { status: "error", message: error.toString() };
    }
}


/**
 * Check transaction status in a loop (retries up to 30 times)
 */
async function checkTransactionStatus(txHash) {
    try {
        const api = await getApi();
        console.log("🔍 Checking transaction status for hash:", txHash.toHex());

        for (let i = 0; i < 30; i++) {
            const blockHash = await api.rpc.chain.getBlockHash();
            console.log(`🔎 Checking Block Hash: ${blockHash.toHex()} (Attempt ${i + 1}/30)`);

            // Get block details and events
            const block = await api.rpc.chain.getBlock(blockHash);
            const events = await api.query.system.events.at(blockHash);

            if (!block?.block?.extrinsics) {
                console.warn("⚠️ Block data is missing, retrying...");
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retrying
                continue;
            }

            // Find the transaction inside the block
            const extrinsicIndex = block.block.extrinsics.findIndex(tx => tx.hash.toHex() === txHash.toHex());
            if (extrinsicIndex !== -1) {
                console.log(`🎉 Transaction found in block: ${blockHash.toHex()}`);

                // Extract transaction details
                const extrinsic = block.block.extrinsics[extrinsicIndex];
                console.log("🔹 Extrinsic Details:", {
                    method: extrinsic.method.method,
                    section: extrinsic.method.section,
                    args: extrinsic.method.args.map(arg => arg.toHuman())
                });

                // Check for success or failure events
                const relatedEvents = events.filter(({ phase }) =>
                    phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(extrinsicIndex)
                );

                const successEvent = relatedEvents.find(({ event }) =>
                    event.section === "system" && event.method === "ExtrinsicSuccess"
                );

                const failureEvent = relatedEvents.find(({ event }) =>
                    event.section === "system" && event.method === "ExtrinsicFailed"
                );

                if (successEvent) {
                    console.log(`✅ Transaction successful! Confirmed in block: ${blockHash.toHex()}`);
                    return { blockHash: blockHash.toHex(), status: "success" };
                } else if (failureEvent) {
                    console.warn("❌ Transaction failed! Extracting failure reason...");

                    let errorMessage = "Unknown Error";
                    try {
                        const dispatchError = failureEvent.event.data[0];

                        if (dispatchError.isModule) {
                            const decoded = api.registry.findMetaError(dispatchError.asModule);
                            errorMessage = `${decoded.section}.${decoded.name}: ${decoded.documentation.join(" ")}`;
                        } else {
                            errorMessage = dispatchError.toString();
                        }
                    } catch (err) {
                        console.warn("⚠️ Error decoding failure reason:", err);
                    }

                    console.warn(`❌ Failure Reason: ${errorMessage}`);

                    return { blockHash: blockHash.toHex(), status: "failed", reason: errorMessage };
                } else {
                    console.warn("⚠️ Transaction status unknown.");
                    return { blockHash: blockHash.toHex(), status: "unknown" };
                }
            }

            console.warn(`⚠️ Transaction ${txHash.toHex()} not found in block. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retrying
        }

        console.warn(`❌ Transaction ${txHash.toHex()} not confirmed after 60 seconds.`);
        return null;

    } catch (error) {
        console.warn("⚠️ Error fetching transaction status:", error);
        return null;
    }
}

/**
 * Transfer assets using the `assets` pallet
 */
export async function transferAsset(assetId, recipient, amount, defaultAccount) {
    try {
        const api = await getApi();
        const amountBN = new BN(amount);

        console.log("\n🔹 Transferring Asset:");
        console.table({ "Asset ID": assetId, "Recipient": recipient, "Amount": amountBN.toString() });

        const extrinsic = api.tx.liquidityPallet.transferTokens(assetId, recipient, amountBN);

        return await signAndSendExtrinsic(extrinsic, defaultAccount, "Transfer Asset");

    } catch (error) {
        console.warn("⚠️ Error in asset transfer:", error);
        return null;
    }
}

/**
 * Mint assets using the `liquidityPallet`
 */
export async function mintAsset(assetId, beneficiary, amount, defaultAccount) {
    try {
        const api = await getApi();
        const amountBN = new BN(amount);

        console.log("\n🔹 Minting Asset:");
        console.table({ "Asset ID": assetId, "Beneficiary": beneficiary, "Amount (u128)": amountBN.toString() });

        if (amountBN.isNeg() || amountBN.isZero()) {
            console.warn("⚠️ Invalid amount: Must be a positive integer.");
            return null;
        }

        const extrinsic = api.tx.liquidityPallet.mintTokens(assetId, amountBN, beneficiary);

        return await signAndSendExtrinsic(extrinsic, defaultAccount, "Mint Asset");

    } catch (error) {
        console.warn("⚠️ Error in minting asset:", error);
        return null;
    }
}

/**
 * Create an asset using the `assets` pallet
 */
export async function createAsset(assetId, adminAddress, minBalance, defaultAccount) {
    try {
        const api = await getApi();
        const minBalanceBN = new BN(minBalance);

        console.log("\n🔹 Creating Asset:");
        console.table({ "Asset ID": assetId, "Admin Address": adminAddress, "Minimum Balance": minBalanceBN.toString() });

        const extrinsic = api.tx.aassets.create(assetId, adminAddress, minBalanceBN);

        return await signAndSendExtrinsic(extrinsic, defaultAccount, "Create Asset");

    } catch (error) {
        console.warn("⚠️ Error in creating asset:", error);
        return null;
    }
}





/**
 * Deposit liquidity using `liquidityPallet`
 */
export async function depositLiquidity(asset1, asset2, amount1, amount2, defaultAccount) {
    try {
        const api = await getApi();
        const amount1BN = new BN(amount1);
        const amount2BN = new BN(amount2);

        console.log("\n🔹 Depositing Liquidity:");
        console.table({
            "Asset 1 ID": asset1,
            "Asset 2 ID": asset2,
            "Amount 1": amount1BN.toString(),
            "Amount 2": amount2BN.toString()
        });

        if (amount1BN.isNeg() || amount1BN.isZero() || amount2BN.isNeg() || amount2BN.isZero()) {
            console.warn("⚠️ Invalid amounts: Must be positive integers.");
            return null;
        }

        const extrinsic = api.tx.liquidityPallet.depositLiquidity(asset1, asset2, amount1BN, amount2BN);

        return await signAndSendExtrinsic(extrinsic, defaultAccount, "Deposit Liquidity");

    } catch (error) {
        console.warn("⚠️ Error in deposit liquidity:", error);
        return null;
    }
}

/**
 * Withdraw liquidity using `liquidityPallet`
 */
export async function withdrawLiquidity(asset1, asset2, withdrawAmount1, withdrawAmount2, defaultAccount) {
    try {
        const api = await getApi();
        const withdrawAmount1BN = new BN(withdrawAmount1);
        const withdrawAmount2BN = new BN(withdrawAmount2);

        console.log("\n🔹 Withdrawing Liquidity:");
        console.table({
            "Asset 1 ID": asset1,
            "Asset 2 ID": asset2,
            "Withdraw Amount 1": withdrawAmount1BN.toString(),
            "Withdraw Amount 2": withdrawAmount2BN.toString()
        });

        if (withdrawAmount1BN.isNeg() || withdrawAmount1BN.isZero() || withdrawAmount2BN.isNeg() || withdrawAmount2BN.isZero()) {
            console.warn("⚠️ Invalid withdrawal amounts: Must be positive integers.");
            return null;
        }

        const extrinsic = api.tx.liquidityPallet.withdrawLiquidity(asset1, asset2, withdrawAmount1BN, withdrawAmount2BN);

        return await signAndSendExtrinsic(extrinsic, defaultAccount, "Withdraw Liquidity");

    } catch (error) {
        console.warn("⚠️ Error in withdraw liquidity:", error);
        return null;
    }
}
