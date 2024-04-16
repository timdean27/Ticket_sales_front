import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

// Define your Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light', // Set initial color mode to light
    background: {
      default: '#f3f3f3', // Light background color
    },
    text: {
      primary: '#006400', // Text color for light mode
    },
  },
});

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
        <App />

    </ThemeProvider>
  </React.StrictMode>,
);
