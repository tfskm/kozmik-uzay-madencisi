import {createRoot} from 'react-dom/client';
import {TonConnectUIProvider} from '@tonconnect/ui-react';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
    <App />
  </TonConnectUIProvider>
);
