import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import PricePrediction from "./pages/PricePrediction";
import Valuation from "./pages/Valuation";
import Recommendation from "./pages/Recommendation";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<PricePrediction />} />
            <Route path="/valuate" element={<Valuation />} />
            <Route path="/recommend" element={<Recommendation />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
