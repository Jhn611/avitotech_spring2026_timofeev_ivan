import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import './index.css';
import './lightTheme.css';
import App from './pages/App/App.tsx';
import Product from './pages/Product/Product.tsx';
import Edit from'./pages/Edit/Edit.tsx';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/item/:id" element={<Product />} />  
        <Route path="/item/:id/edit" element={<Edit />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)