import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

// Ana uygulama bileşeninin import edilmesi
import App from "./components/root/App";

//  Style
import "../src/styles/index.css";

// React Router ve Axios için gerekli importlar
import { BrowserRouter } from "react-router-dom";

// CSS ve font dosyalarının import edilmesi
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "alertifyjs/build/css/alertify.css";
import "alertifyjs/build/css/themes/default.css";

// API isteklerindeki token geçerlilik kontrollerini kurulumu
import { setupAxiosInterceptors } from "./components/utils/AuthCheck";
setupAxiosInterceptors();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
