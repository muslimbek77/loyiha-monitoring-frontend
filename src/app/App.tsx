// src/app/App.jsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router.js";
import ErrorBoundary from "@/shared/components/ErrorBoundary.js";
import { ToastContainer } from "react-toastify";
import { App as AntApp, ConfigProvider } from "antd";

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#0f766e",
            colorInfo: "#0284c7",
            colorSuccess: "#16a34a",
            colorWarning: "#d97706",
            colorError: "#dc2626",
            borderRadius: 16,
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
        }}
      >
        <AntApp>
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={3500} />
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
