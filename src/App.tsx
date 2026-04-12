import { BrowserRouter, Routes, Route } from "react-router-dom";
import MasterIndex from "./MasterIndex";
import MBRDashboard from "./Dashboard";
import AuthGuard from "./components/AuthGuard";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <MasterIndex />
            </AuthGuard>
          }
        />
        <Route
          path="/mbr-march-2026"
          element={
            <AuthGuard>
              <MBRDashboard />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
