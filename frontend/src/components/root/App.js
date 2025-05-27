
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import NotFound from "../common/NotFound";
import Unauthorized from "../common/Unauthorized";

import Login from "../auth/Login";
import Register from "../auth/Register";

function App() {
  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global styles for app wrapper */}
      <style jsx="true">{`
        .app-wrapper {
          min-height: 100vh;
          width: 100%;
          max-width: 100%;
          padding: 0;
          margin: 0;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

export default App;
