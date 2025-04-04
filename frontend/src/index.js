import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChatContextProvider } from './Context/ChatContext';
import { ToastContextProvider } from './Context/ToastContext';
import ToastStack from './Components/ToastStack';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ToastContextProvider>
    <ChatContextProvider>
      <React.StrictMode>
        <App />
        <ToastStack />
      </React.StrictMode>
    </ChatContextProvider>
  </ToastContextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
