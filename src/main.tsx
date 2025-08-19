import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import OptimizedApp from './components/OptimizedApp.tsx'
import './index.css'

// Enable React 18 concurrent features
const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <StrictMode>
    <OptimizedApp />
  </StrictMode>
);
