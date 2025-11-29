import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { ImpactMapPage } from './pages/ImpactMapPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { WorkflowPage } from './pages/WorkflowPage';
import { WalletProvider } from './contexts/WalletContext';
import './lib/gemwallet-debug';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/impact-map" element={<ImpactMapPage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/workflow" element={<WorkflowPage />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  </React.StrictMode>,
);
