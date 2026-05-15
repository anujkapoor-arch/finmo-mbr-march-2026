import { BrowserRouter, Routes, Route } from "react-router-dom";
import MasterIndex from "./MasterIndex";
import MBRDashboard from "./Dashboard";
import MBRAprilDashboard from "./DashboardApril";
import BDWeeklyReport from "./BDWeeklyReport";
import BDWeeklyApr16_22 from "./BDWeeklyApr16_22";
import BDWeeklyApr23_29 from "./BDWeeklyApr23_29";
import BDWeeklyApr30_May06 from "./BDWeeklyApr30_May06";
import MerchantAdoptionClosedWon from "./MerchantAdoptionClosedWon";
import MerchantAdoptionLive from "./MerchantAdoptionLive";
import PipelineHealth from "./PipelineHealth";
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
        <Route
          path="/mbr-april-2026"
          element={
            <AuthGuard>
              <MBRAprilDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/bd-weekly-apr-1-15"
          element={
            <AuthGuard>
              <BDWeeklyReport />
            </AuthGuard>
          }
        />
        <Route
          path="/bd-weekly-apr-16-22"
          element={
            <AuthGuard>
              <BDWeeklyApr16_22 />
            </AuthGuard>
          }
        />
        <Route
          path="/bd-weekly-apr-23-29"
          element={
            <AuthGuard>
              <BDWeeklyApr23_29 />
            </AuthGuard>
          }
        />
        <Route
          path="/bd-weekly-apr-30-may-06"
          element={
            <AuthGuard>
              <BDWeeklyApr30_May06 />
            </AuthGuard>
          }
        />
        <Route
          path="/merchant-adoption/closed-won"
          element={
            <AuthGuard>
              <MerchantAdoptionClosedWon />
            </AuthGuard>
          }
        />
        <Route
          path="/merchant-adoption/live"
          element={
            <AuthGuard>
              <MerchantAdoptionLive />
            </AuthGuard>
          }
        />
        <Route
          path="/pipeline-health"
          element={
            <AuthGuard>
              <PipelineHealth />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
