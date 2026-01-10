import { createBrowserRouter, Navigate } from "react-router-dom";
import { ScannerRoute } from "./ScannerRoute";
import { AdminLayout } from "./admin/AdminLayout";
import { LoginPage } from "./admin/LoginPage";
import { DashboardPage } from "./admin/DashboardPage";
import { SpeciesFormPage } from "./admin/SpeciesFormPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ScannerRoute />,
  },
  {
    path: "/admin",
    element: <LoginPage />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <DashboardPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/species/new",
    element: (
      <AdminLayout>
        <SpeciesFormPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/species/:id",
    element: (
      <AdminLayout>
        <SpeciesFormPage />
      </AdminLayout>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
