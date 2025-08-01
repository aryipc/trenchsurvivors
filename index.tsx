import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import WalletContextProvider from './components/WalletContextProvider';
import '@solana/wallet-adapter-react-ui/styles.css';
import './index.css';

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
