import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ShellLayout from "./components/ShellLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardHomePage from "./pages/DashboardHomePage";
import ApiTestingPage from "./pages/ApiTestingPage";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App() {
  return (
    <>
      <ErrorBoundary>
        <ShellLayout>
          <Routes>
            <Route path="/" element={<DashboardHomePage />} />
            <Route path="/test" element={<ApiTestingPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ShellLayout>
      </ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#10141b",
            color: "#f5f7fa",
            border: "1px solid rgba(255, 213, 74, 0.35)",
          },
        }}
      />
    </>
  );
}
