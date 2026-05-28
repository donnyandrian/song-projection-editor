import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <main className="flex h-dvh w-dvw flex-col overflow-hidden">
            <App />
            <Toaster richColors={true} />
        </main>
    </StrictMode>,
);
