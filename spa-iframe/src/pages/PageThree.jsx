import React from "react";

const pageStyle = { padding: "24px" };

const labelStyle = {
  display: "inline-block",
  background: "#ff9800",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: "4px",
  fontSize: "12px",
  marginBottom: "12px",
  fontWeight: "bold",
};

const iframeStyle = {
  width: "100%",
  height: "600px",
  border: "2px solid #ff9800",
  borderRadius: "8px",
};

export default function PageThree() {
  return (
    <div style={pageStyle}>
      <div style={labelStyle}>PAGE THREE</div>
      <h2 style={{ marginBottom: "8px" }}>
        Third Page — iframe points back to localhost:5173
      </h2>
      <p style={{ marginBottom: "16px", color: "#555", fontSize: "14px" }}>
        Navigated via React Router on localhost:4000. The iframe still points
        back to localhost:5173.
      </p>
      <iframe
        src="http://localhost:5173/page-two"
        style={iframeStyle}
        title="Parent SPA iframe - Page Three"
      />
    </div>
  );
}
