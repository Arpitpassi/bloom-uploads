import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ArweaveWalletKit } from "@arweave-wallet-kit/react";
import { UserProvider } from '../hooks/useUser';
import AoSyncStrategy from "@vela-ventures/aosync-strategy";
import WanderStrategy from "@arweave-wallet-kit/wander-strategy";
import BrowserWalletStrategy from "@arweave-wallet-kit/browser-wallet-strategy";
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="270845507508-4l2s1h2dn75t7f7ndhncjgkpsdri8qt6.apps.googleusercontent.com">
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
    </GoogleOAuthProvider>
  </React.StrictMode>
);