import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import NotFound from "../common/NotFound";
import Unauthorized from "../common/Unauthorized";

import Login from "../auth/Login";
import Register from "../auth/Register";

import ProtectedRoutes from "../routes/ProtectedRoutes";
import { PYS_ACCESSIBLE_ROLES, PBS_ACCESSIBLE_ROLES } from "../constant/Perm";
import PersonelYonetimSistemiDashboard from "../pys/PersonelYonetimSistemiDashboard";
import PersonelBilgiSistemiDashboard from "../pbs/PersonelBilgiSistemiDashboard";
function App() {
  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Protected PYS */}
        <Route
          element={<ProtectedRoutes accesibleRoleList={PYS_ACCESSIBLE_ROLES} />}
        >
          <Route path="/pys/*" element={<PersonelYonetimSistemiDashboard />} />
        </Route>

        {/* Protected PBS*/}
        <Route
          element={<ProtectedRoutes accesibleRoleList={PBS_ACCESSIBLE_ROLES} />}
        >
          <Route path="/pbs/*" element={<PersonelBilgiSistemiDashboard />} />
        </Route>

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
