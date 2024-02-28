import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import {AuthProvider} from "~/providers/authContext";
import Navigator from "~/routes";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <BrowserRouter>
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
