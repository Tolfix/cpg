import { createTheme, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/system';
import dotenv from 'dotenv';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

dotenv.config();
const muiTheme = createTheme({

});
ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);