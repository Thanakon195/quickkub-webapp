export default function About() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <h1 className="text-5xl font-extrabold text-blue-900 mb-4">เกี่ยวกับเรา</h1>
      <p className="text-lg text-blue-700 max-w-xl text-center mb-8">
        QuickKub Payment Gateway คือระบบรับชำระเงินออนไลน์ที่ออกแบบมาเพื่อธุรกิจไทยยุคใหม่ รองรับทุกช่องทางการจ่ายเงิน ปลอดภัยสูงสุด และใช้งานง่าย พร้อม Dashboard วิเคราะห์ธุรกรรมแบบ Real-time
      </p>
      <div className="flex gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-600 mb-2">99.99%</span>
          <span className="text-blue-800">Uptime</span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-600 mb-2">24/7</span>
          <span className="text-blue-800">Support</span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-600 mb-2">100K+</span>
          <span className="text-blue-800">Transactions/Day</span>
        </div>
      </div>
    </div>
  );
}
