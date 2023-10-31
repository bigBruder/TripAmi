import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {Intro} from "./routes/Auth/Intro";
import {Profile} from "~/routes/AppRoutes/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Intro />,
  },
  {
    path: '/profile',
    element: <Profile />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
