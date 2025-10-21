/**
 * HashPack Wallet Service
 * 
 * This service handles HashPack wallet connection and transaction signing.
 * HashPack is the leading Hedera wallet for managing HBAR and tokens.
 * Documentation: https://docs.hashpack.app/
 */

declare global {
  interface Window {
    hashconnect: any;
  }
}

export interface WalletData {
  accountIds: string[];
  network: string;
  topic: string;
}

export interface TransactionRequest {
  topic: string;
  byteArray: Uint8Array;
  metadata: {
    accountToSign: string;
    returnTransaction: boolean;
  };
}

class HashPackWalletService {
  private hashconnect: any = null;
  private appMetadata = {
    name: "FractioNFT",
    description: "Fractionalize your NFTs on Hedera",
    icon: window.location.origin + "/gem.png",
  };
  private walletData: WalletData | null = null;
  private pairingString: string = "";
  private listeners: Array<(data: WalletData | null) => void> = [];

  async initialize(): Promise<void> {
    // Wait for HashConnect to load from CDN
    await this.waitForHashConnect();
    
    const HashConnect = window.hashconnect.HashConnect;
    this.hashconnect = new HashConnect(
      true, // Use debug mode for better logging
      "testnet", // Network
      this.appMetadata,
      true // Return transaction
    );

    // Set up pairing event
    this.hashconnect.foundExtensionEvent.once((walletMetadata: any) => {
      console.log("HashPack extension found:", walletMetadata);
    });

    this.hashconnect.pairingEvent.once((pairingData: any) => {
      console.log("Paired with wallet:", pairingData);
      this.walletData = {
        accountIds: pairingData.accountIds,
        network: pairingData.network,
        topic: pairingData.topic,
      };
      this.notifyListeners();
    });

    // Initialize HashConnect
    const initData = await this.hashconnect.init();
    this.pairingString = initData.pairingString;
    console.log("HashConnect initialized. Pairing string:", this.pairingString);

    // Check for existing pairing
    const savedPairings = this.hashconnect.hcData.savedPairings;
    if (savedPairings && savedPairings.length > 0) {
      const pairing = savedPairings[0];
      this.walletData = {
        accountIds: pairing.accountIds,
        network: pairing.network,
        topic: pairing.topic,
      };
      this.notifyListeners();
    }
  }

  private waitForHashConnect(): Promise<void> {
    return new Promise((resolve) => {
      if (window.hashconnect) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (window.hashconnect) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.hashconnect) {
          throw new Error("HashConnect library failed to load");
        }
      }, 10000);
    });
  }

  async connect(): Promise<WalletData> {
    if (!this.hashconnect) {
      await this.initialize();
    }

    if (this.walletData) {
      return this.walletData;
    }

    // Trigger pairing with HashPack
    await this.hashconnect.connectToLocalWallet(this.pairingString);

    // Wait for pairing
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Wallet connection timeout"));
      }, 60000); // 60 second timeout

      const unsubscribe = this.subscribe((data) => {
        if (data) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(data);
        }
      });
    });
  }

  disconnect(): void {
    if (this.hashconnect && this.walletData) {
      this.hashconnect.disconnect(this.walletData.topic);
      this.walletData = null;
      this.notifyListeners();
    }
  }

  getWalletData(): WalletData | null {
    return this.walletData;
  }

  getPrimaryAccount(): string | null {
    return this.walletData?.accountIds[0] || null;
  }

  isConnected(): boolean {
    return this.walletData !== null;
  }

  /**
   * Send a transaction for signing
   * Note: Actual transaction building would require the Hedera SDK
   * For now, this is a placeholder for the signing flow
   */
  async sendTransaction(transactionBytes: Uint8Array): Promise<any> {
    if (!this.walletData) {
      throw new Error("Wallet not connected");
    }

    const transaction: TransactionRequest = {
      topic: this.walletData.topic,
      byteArray: transactionBytes,
      metadata: {
        accountToSign: this.walletData.accountIds[0],
        returnTransaction: false,
      },
    };

    return await this.hashconnect.sendTransaction(
      this.walletData.topic,
      transaction
    );
  }

  subscribe(listener: (data: WalletData | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.walletData));
  }
}

// Singleton instance
export const hashPackWallet = new HashPackWalletService();
