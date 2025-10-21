# Hedera Blockchain Integration Documentation

## Overview

This application integrates with the Hedera network for NFT creation, fractionalization, and blockchain transactions. The integration uses:

- **HashPack Wallet**: For user authentication and transaction signing
- **Hedera REST API**: For querying blockchain data
- **Hedera Testnet**: Default network for development

## Architecture

### Services

#### 1. HashPack Wallet Service (`src/services/hashPackWallet.ts`)

Manages wallet connection and transaction signing.

**Key Features:**
- Connect/disconnect HashPack wallet
- Get connected account IDs
- Sign and submit transactions
- Persistent wallet state

**Usage:**
```typescript
import { hashPackWallet } from "@/services/hashPackWallet";

// Initialize (called automatically on app load)
await hashPackWallet.initialize();

// Connect wallet
const walletData = await hashPackWallet.connect();
console.log("Connected account:", walletData.accountIds[0]);

// Check connection status
if (hashPackWallet.isConnected()) {
  const accountId = hashPackWallet.getPrimaryAccount();
}

// Disconnect
hashPackWallet.disconnect();
```

#### 2. Hedera API Service (`src/services/hederaAPI.ts`)

Provides REST API access to Hedera network data.

**Key Features:**
- Query account information
- Get token details
- Retrieve NFT metadata
- Verify transactions

**Usage:**
```typescript
import { 
  getAccount, 
  getToken, 
  getNFT, 
  getAccountNFTs,
  verifyTransaction 
} from "@/services/hederaAPI";

// Get account info
const account = await getAccount("0.0.12345");
console.log("Balance:", account.balance.balance);

// Get token info
const token = await getToken("0.0.67890");
console.log("Token name:", token.name);

// Get all NFTs for an account
const nfts = await getAccountNFTs("0.0.12345");

// Verify a transaction
const success = await verifyTransaction("0.0.12345@1234567890.123456789");
```

### Components

#### WalletConnect Component (`src/components/WalletConnect.tsx`)

User interface for HashPack wallet connection.

**Features:**
- Connect/disconnect button
- Display connected account
- Loading states
- Error handling

## Transaction Flow

### NFT Creation

1. User connects HashPack wallet
2. Application prepares NFT creation transaction
3. Transaction sent to HashPack for signing
4. User approves in HashPack extension
5. Signed transaction submitted to Hedera
6. Transaction ID saved to database
7. Verification via REST API

### Fractionalization

1. User selects NFT to fractionalize
2. Application creates fungible token (fractional shares)
3. Transaction includes:
   - Token creation
   - Initial supply to owner
   - Metadata linking to NFT
4. User signs transaction in HashPack
5. Transaction submitted and verified
6. Database updated with fractionalization data

## API Endpoints

### Hedera Testnet Mirror Node

**Base URL:** `https://testnet.mirrornode.hedera.com/api/v1`

**Key Endpoints:**

- `GET /accounts/{accountId}` - Account information
- `GET /tokens/{tokenId}` - Token details
- `GET /tokens/{tokenId}/nfts` - NFT collection
- `GET /tokens/{tokenId}/nfts/{serialNumber}` - Specific NFT
- `GET /accounts/{accountId}/nfts` - Account's NFTs
- `GET /transactions/{transactionId}` - Transaction details

### Documentation

- [Hedera REST API Docs](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)
- [Mirror Node API Docs](https://mainnet.mirrornode.hedera.com/api/v1/docs/)
- [HashPack Documentation](https://docs.hashpack.app/)

## Environment Configuration

The application uses Hedera Testnet by default. To switch to Mainnet:

```typescript
// In src/services/hederaAPI.ts
const BASE_URL = "https://mainnet.mirrornode.hedera.com/api/v1";
```

And update HashConnect network:

```typescript
// In src/services/hashPackWallet.ts
this.hashconnect = new HashConnect(
  true,
  "mainnet", // Change from "testnet"
  this.appMetadata,
  true
);
```

## Database Schema

The application stores blockchain transaction data in Supabase:

### NFTs Table
```sql
- id: uuid (primary key)
- owner_id: uuid (references auth.users)
- token_id: text (Hedera token ID)
- name: text
- description: text
- image_url: text
- network: text (hedera-testnet/hedera-mainnet)
- is_fractionalized: boolean
- total_fractions: integer
- fraction_token_id: text (Hedera token ID of fractional shares)
- created_at: timestamp
- updated_at: timestamp
```

### Transactions Table
```sql
- id: uuid (primary key)
- nft_id: uuid (references nfts)
- from_user_id: uuid
- to_user_id: uuid
- transaction_type: text (mint/fractionalization/transfer)
- amount: numeric
- transaction_hash: text (Hedera transaction ID)
- status: text (pending/completed/failed)
- created_at: timestamp
```

## Security Considerations

1. **Private Keys**: Never stored in application - managed by HashPack
2. **Transaction Signing**: Always performed in user's wallet
3. **RLS Policies**: Row-level security on all database tables
4. **API Rate Limits**: Mirror node has rate limits - implement caching
5. **Network Selection**: Always verify user is on correct network

## Testing

### Prerequisites
- HashPack extension installed in browser
- Testnet HBAR in connected account (get from [Hedera faucet](https://portal.hedera.com/))

### Test Scenarios

1. **Wallet Connection**
   - Install HashPack
   - Click "Connect Wallet"
   - Approve pairing in extension
   - Verify account ID displayed

2. **NFT Creation**
   - Connect wallet
   - Click "Add NFT"
   - Sign transaction in HashPack
   - Verify NFT appears in dashboard

3. **Fractionalization**
   - Select existing NFT
   - Enter number of fractions
   - Sign transaction
   - Verify fractional tokens created

## Troubleshooting

### HashPack Not Detected
- Install HashPack extension from Chrome Web Store
- Refresh application after installation
- Check browser console for errors

### Transaction Failures
- Verify sufficient HBAR balance for fees
- Check network connection
- Confirm correct network (testnet/mainnet)
- Review transaction in [HashScan](https://hashscan.io/testnet)

### API Errors
- Check API endpoint availability
- Verify account/token IDs are valid
- Review rate limiting (429 errors)
- Confirm network parameter matches wallet

## Future Enhancements

- **Full SDK Integration**: When build issues resolved, use `@hashgraph/sdk`
- **Batch Transactions**: Multiple operations in single transaction
- **Token Association**: Automatic token association for fractional shares
- **Trading Marketplace**: P2P trading of fractional tokens
- **Analytics Dashboard**: On-chain metrics and insights
- **Multi-wallet Support**: Support for other Hedera wallets

## Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera Token Service](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service)
- [HashPack Wallet](https://www.hashpack.app/)
- [Hedera Portal (Testnet Faucet)](https://portal.hedera.com/)
- [HashScan Explorer](https://hashscan.io/)
