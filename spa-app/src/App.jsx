import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import PageOne from "./pages/PageOne.jsx";
import PageTwo from "./pages/PageTwo.jsx";
import PageThree from "./pages/PageThree.jsx";

const navStyle = {
  display: "flex",
  gap: "16px",
  padding: "12px 20px",
  background: "#1a1a2e",
  color: "#fff",
  alignItems: "center",
};

const linkStyle = {
  color: "#00d4ff",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
};

export default function App() {
  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <span style={{ marginRight: "auto", fontWeight: "bold" }}>
          GPC SPA Bug Reproducer
        </span>
        <Link to="/" style={linkStyle}>
          Page One (iframe only)
        </Link>
        <Link to="/page-two" style={linkStyle}>
          Page Two (parent + iframe)
        </Link>
        <Link to="/page-three" style={linkStyle}>
          Page Three (redirect)
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<PageOne />} />
        <Route path="/page-two" element={<PageTwo />} />
        <Route path="/page-three" element={<PageThree />} />
      </Routes>
    </BrowserRouter>
  );
}
