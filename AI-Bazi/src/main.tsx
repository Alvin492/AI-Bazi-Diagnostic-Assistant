import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css';
import router from "./router/index.tsx";
import {RouterProvider} from "react-router"
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
