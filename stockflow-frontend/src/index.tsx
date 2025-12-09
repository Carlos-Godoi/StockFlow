// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


// Import do Chakra

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* Envolve a aplicação com o ChakraProvider */}
   
      <App />
    
  </React.StrictMode>
);