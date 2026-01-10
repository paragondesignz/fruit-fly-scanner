import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConvexProvider>
  </React.StrictMode>
);
