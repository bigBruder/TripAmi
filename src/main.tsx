import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';
import {AuthProvider} from "~/providers/authContext";
import Navigator from "~/routes";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Navigator />
    </AuthProvider>
  </React.StrictMode>,
)
