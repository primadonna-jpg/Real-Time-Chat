import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './components/utils/AuthProvider';
import NotificationProvider from './components/utils/NotificationProvider';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <AuthProvider>
      
      <NotificationProvider>

        <App />

      </NotificationProvider>
      
    </AuthProvider>
  </BrowserRouter>
);
