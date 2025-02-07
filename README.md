# 🚀 Liquidity Management App

A **Polkadot-based dApp** for **managing assets and liquidity**, supporting:  
👉 **Asset Management**: Create, transfer, and mint assets  
👉 **Liquidity Management**: Deposit and withdraw liquidity  

This dApp allows users to interact with a **Substrate-based blockchain** using the **Talisman Wallet**.

---

## 📌 Prerequisites

Before setting up, make sure you have:

- **Node.js** (v16+) → [Download](https://nodejs.org/)
- **Yarn** (or npm) → [Install Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
- **Talisman Wallet** (for Polkadot-based accounts) → [Install](https://talisman.xyz/)
- **Polkadot.js API**
- **Testnet tokens** to interact with the blockchain

---

## 🛠️ Setup & Installation

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/liquidity-management.git
cd liquidity-management
```

### 2️⃣ Install Dependencies
```sh
yarn install  # or use npm install
```

### 3️⃣ Setup Talisman Wallet & Create a Polkadot Address

#### **🦅 Install Talisman Wallet**
1. **Go to** [Talisman Wallet](https://talisman.xyz/) and install the browser extension.
2. Click on the **extension** in your browser.

#### **📝 Create a Polkadot Address**
1. Click **"Create New Account"**.
2. Choose **"Polkadot"** as the network type.
3. Save your **12-word seed phrase** (VERY IMPORTANT 🚨).
4. Set a **password** and complete the setup.

#### **📄 Copy Your Polkadot Address**
- Go to the **Accounts** section.
- Click on your new account and **copy the address** (starts with `5...`).

---

### 4️⃣ Fund Your Wallet with Testnet Tokens
To interact with the app, you need **testnet tokens**.

#### **💠 Get Free Testnet Tokens**
1. Visit the **Polkadot Testnet Faucet**:  
   [https://polkadot.js.org/apps/#/accounts](https://polkadot.js.org/apps/#/accounts)
2. Paste your **Polkadot address** and request test tokens.
3. Wait a few minutes and check your wallet.

---

## 🚀 Running the App
```sh
yarn start  # or npm start
```
- Open **http://localhost:3000**
- **Connect Talisman Wallet**
- **Start using Asset & Liquidity Management features**

---

## 🔗 Features & Usage

### ✅ **Asset Management**
**1. Create Asset**  
- Select **Create Asset** from the dropdown.
- Enter:
  - **Asset ID**
  - **Admin Address** (owner of the asset)
  - **Minimum Balance**
- Click **"Execute Create Asset"**.

**2. Transfer Asset**  
- Select **Transfer Asset**.
- Enter:
  - **Asset ID**
  - **Recipient Address**
  - **Amount**
- Click **"Execute Transfer Asset"**.

**3. Mint Asset**  
- Select **Mint Asset**.
- Enter:
  - **Asset ID**
  - **Beneficiary Address**
  - **Amount**
- Click **"Execute Mint Asset"**.

---

### ✅ **Liquidity Management**
**1. Deposit Liquidity**  
- Select **Deposit Liquidity** from the dropdown.
- Enter:
  - **Asset 1 ID**
  - **Asset 2 ID**
  - **Amount 1**
  - **Amount 2**
- Click **"Execute Deposit Liquidity"**.

**2. Withdraw Liquidity**  
- Select **Withdraw Liquidity**.
- Enter:
  - **Asset 1 ID**
  - **Asset 2 ID**
  - **Withdraw Amount 1**
  - **Withdraw Amount 2**
- Click **"Execute Withdraw Liquidity"**.

---

## 📝 Transaction Status & Hash
- After submitting a transaction, you’ll see:
  - ✅ **Success Message**
  - ❌ **Failure Message with Reason**
- The **Transaction Hash** will be displayed in full.

---

## ❓ Troubleshooting & FAQs
### ❌ **Talisman Wallet Not Connecting?**
👉 **Solution:**  
- Ensure you've enabled the wallet for **"chain-abstraction"**.  
- Try **restarting your browser**.  

### ❌ **Not Receiving Testnet Tokens?**
👉 **Solution:**  
- Try another faucet.  
- Wait a few minutes before retrying.  

### ❌ **Transaction Failing?**
👉 **Solution:**  
- Ensure you have enough **testnet tokens** for gas fees.  
- Double-check your **input values**.  

