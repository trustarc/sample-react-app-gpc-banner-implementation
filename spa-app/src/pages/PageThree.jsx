import React, { useEffect } from "react";

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

export default function PageThree() {
  useEffect(() => {
    window.location.href = "http://localhost:4000/page-three";
  }, []);

  return (
    <div style={pageStyle}>
      <div style={labelStyle}>PAGE THREE</div>
      <h2 style={{ marginBottom: "8px" }}>Redirecting to localhost:4000…</h2>
      <p style={{ color: "#555", fontSize: "14px" }}>
        Redirecting to the inverse app — <code>localhost:4000</code> runs its
        own GPC script (banner on parent) and iframes{" "}
        <code>localhost:5173</code> (banner inside iframe too).
      </p>
    </div>
  );
}
