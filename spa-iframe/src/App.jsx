import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { loadGPCScript, reinitGPC } from "./gpc.js";
import PageOne from "./pages/PageOne.jsx";
import PageTwo from "./pages/PageTwo.jsx";
import PageThree from "./pages/PageThree.jsx";

const navStyle = {
  display: "flex",
  gap: "16px",
  padding: "12px 20px",
  background: "#2d1b4e",
  color: "#fff",
  alignItems: "center",
};

const linkStyle = {
  color: "#ce93d8",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
};

export default function App() {
  useEffect(() => {
    reinitGPC();
    loadGPCScript();
  }, []);

  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <span style={{ marginRight: "auto", fontWeight: "bold" }}>
          GPC Iframe App (localhost:4000)
        </span>
        <Link to="/" style={linkStyle}>
          Page One
        </Link>
        <Link to="/page-two" style={linkStyle}>
          Page Two
        </Link>
        <Link to="/page-three" style={linkStyle}>
          Page Three
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
