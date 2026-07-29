import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";

// Ground comparison switch. `?theme=dark` (or ?theme=light) sets the ground and
// remembers it. Temporary — remove once the ground is settled.
{
  const q = new URLSearchParams(window.location.search).get('theme');
  if (q === 'dark' || q === 'light') localStorage.setItem('akal-theme', q);
  const t = localStorage.getItem('akal-theme');
  if (t === 'dark') document.documentElement.dataset.theme = 'dark';
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
