import React from "react";
import { createRoot } from "react-dom/client";
import { AppLayout } from "../components/layout/AppLayout";
import "../design-system/community-canonical-tokens.css";
import "../design-system/components.css";
import "../styles/application.css";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <AppLayout />
    </React.StrictMode>,
  );
}
