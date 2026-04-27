import React from 'react'
import ReactDOM from 'react-dom/client'
import 'reactflow/dist/style.css'
import '@/index.css'
import { AppProviders } from '@/app/providers'

document.documentElement.classList.add('dark')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>
)
