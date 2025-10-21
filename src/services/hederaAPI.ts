/**
 * Hedera REST API Service
 * 
 * This service provides interaction with Hedera network via REST API.
 * Documentation: https://docs.hedera.com/hedera/sdks-and-apis/rest-api
 * Mirror Node API: https://mainnet.mirrornode.hedera.com/api/v1/docs/
 */

const HEDERA_TESTNET_URL = "https://testnet.mirrornode.hedera.com/api/v1";
const HEDERA_MAINNET_URL = "https://mainnet.mirrornode.hedera.com/api/v1";

// Use testnet by default
const BASE_URL = HEDERA_TESTNET_URL;

export interface HederaToken {
  token_id: string;
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
  treasury_account_id: string;
  type: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
}

export interface HederaNFT {
  token_id: string;
  serial_number: number;
  account_id: string;
  metadata?: string;
}

export interface HederaAccount {
  account: string;
  balance: {
    balance: number;
    tokens: Array<{
      token_id: string;
      balance: number;
    }>;
  };
}

/**
 * Get account information
 */
export async function getAccount(accountId: string): Promise<HederaAccount> {
  const response = await fetch(`${BASE_URL}/accounts/${accountId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch account: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get token information
 */
export async function getToken(tokenId: string): Promise<HederaToken> {
  const response = await fetch(`${BASE_URL}/tokens/${tokenId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch token: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get NFT information
 */
export async function getNFT(tokenId: string, serialNumber: number): Promise<HederaNFT> {
  const response = await fetch(`${BASE_URL}/tokens/${tokenId}/nfts/${serialNumber}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NFT: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get all NFTs for an account
 */
export async function getAccountNFTs(accountId: string): Promise<HederaNFT[]> {
  const response = await fetch(`${BASE_URL}/accounts/${accountId}/nfts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch account NFTs: ${response.statusText}`);
  }
  const data = await response.json();
  return data.nfts || [];
}

/**
 * Get account token balances
 */
export async function getAccountTokens(accountId: string) {
  const response = await fetch(`${BASE_URL}/accounts/${accountId}/tokens`);
  if (!response.ok) {
    throw new Error(`Failed to fetch account tokens: ${response.statusText}`);
  }
  const data = await response.json();
  return data.tokens || [];
}

/**
 * Get transaction information
 */
export async function getTransaction(transactionId: string) {
  const response = await fetch(`${BASE_URL}/transactions/${transactionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Verify if a transaction was successful
 */
export async function verifyTransaction(transactionId: string): Promise<boolean> {
  try {
    const tx = await getTransaction(transactionId);
    return tx.result === "SUCCESS";
  } catch {
    return false;
  }
}
