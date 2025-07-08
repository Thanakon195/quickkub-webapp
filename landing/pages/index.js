import React from "react";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #0f2027 0%, #2c5364 100%)" }}>
      <h1 style={{ fontSize: 56, fontWeight: 800, color: "#fff", marginBottom: 16, letterSpacing: -2 }}>QuickKub Payment Gateway</h1>
      <p style={{ color: "#b0c4de", fontSize: 22, marginBottom: 32, maxWidth: 600, textAlign: "center" }}>
        ระบบรับชำระเงินออนไลน์ที่ปลอดภัย รวดเร็ว และยืดหยุ่นสำหรับธุรกิจยุคใหม่ รองรับทุกช่องทางการจ่ายเงิน พร้อม Dashboard วิเคราะห์ธุรกรรมแบบ Real-time
      </p>
      <a href="/" style={{ background: "#00c6ff", color: "#fff", padding: "16px 40px", borderRadius: 32, fontWeight: 700, fontSize: 20, textDecoration: "none", boxShadow: "0 4px 24px #00c6ff55" }}>เริ่มต้นใช้งาน</a>
      <footer style={{ marginTop: 80, color: "#b0c4de", fontSize: 16 }}>
        &copy; {new Date().getFullYear()} QuickKub. All rights reserved.
      </footer>
    </main>
  );
}
