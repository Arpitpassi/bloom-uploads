import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ArweaveWalletKit } from "@arweave-wallet-kit/react";
import { UserProvider } from '../hooks/useUser';
import AoSyncStrategy from "@vela-ventures/aosync-strategy";
import WanderStrategy from "@arweave-wallet-kit/wander-strategy";
import BrowserWalletStrategy from "@arweave-wallet-kit/browser-wallet-strategy";

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ArweaveWalletKit
      config={{
        permissions: [
          "ACCESS_ADDRESS",
          "ACCESS_PUBLIC_KEY",
          "SIGN_TRANSACTION",
          "SIGNATURE",
        ],
        ensurePermissions: true,
        appInfo: {
          name: "Bloom Uploads",
        },
        strategies: [
          new AoSyncStrategy(),
          new WanderStrategy(),
          new BrowserWalletStrategy()
        ],
      }}
    >
      <UserProvider>
        <App />
      </UserProvider>
    </ArweaveWalletKit>
  </React.StrictMode>
);