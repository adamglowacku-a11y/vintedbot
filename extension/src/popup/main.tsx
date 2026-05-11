import React from "react";
import { createRoot } from "react-dom/client";

import { PopupErrorBoundary } from "@/popup/error-boundary";
import { PopupApp } from "@/popup/popup-app";
import "@/popup/styles.css";

const existingRoot = document.getElementById("root");
const root = existingRoot ?? document.body.appendChild(document.createElement("div"));

root.id = "root";

createRoot(root).render(
  <React.StrictMode>
    <PopupErrorBoundary>
      <PopupApp />
    </PopupErrorBoundary>
  </React.StrictMode>
);
