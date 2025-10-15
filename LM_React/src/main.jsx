// main.jsx
import './index.css';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppWithProviders from './App';

// ✅ Import Font Awesome setup
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

// Add all solid icons to library
library.add(fas);

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppWithProviders />
    </BrowserRouter>
  </StrictMode>
);