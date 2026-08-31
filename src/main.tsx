import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global error handler to catch cross-origin script errors and unhandled promise rejections safely
if (typeof window !== 'undefined') {
  window.onerror = (message, source) => {
    const msgStr = String(message || '');
    if (msgStr === 'Script error.' || msgStr.includes('Script error') || !source) {
      return true;
    }
    return false;
  };

  window.addEventListener(
    'error',
    (event) => {
      const msg = event?.message || '';
      if (msg === 'Script error.' || !msg || msg.includes('Script error')) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || reason?.error || String(reason || '');
    // Catch cancelled auth popup or benign websocket/network rejections
    if (
      msg.includes('POPUP_CANCELLED') ||
      msg.includes('popup_closed_by_user') ||
      msg.includes('12501') ||
      msg.includes('websocket') ||
      msg.includes('Script error')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


