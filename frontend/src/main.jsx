import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Inter (Body)
import "@fontsource/inter/400.css"; 
import "@fontsource/inter/500.css"; // Medium text
import "@fontsource/inter/600.css"; // Semibold text

// Poppins (Headings)
import "@fontsource/poppins/500.css"; // Medium headings
import "@fontsource/poppins/600.css"; // Semibold headings
import "@fontsource/poppins/700.css"; // Bold headings

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
