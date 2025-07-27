import { Buffer } from 'buffer';

// Polyfill Buffer for the browser. Some Solana libraries rely on it being globally available.
// This must be done at the top level of the entry file before other imports that might use it.
(window as any).Buffer = Buffer;

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import WalletContextProvider from './components/WalletContextProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </React.StrictMode>
);