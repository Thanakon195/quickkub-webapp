export default function Features() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
      <h1 className="text-5xl font-extrabold text-cyan-900 mb-4">ฟีเจอร์เด่น</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-4xl text-cyan-600 mb-2">⚡</span>
          <h2 className="text-xl font-bold mb-2">โอนเงินเร็วทันใจ</h2>
          <p className="text-gray-700 text-center">ระบบโอนเงินอัตโนมัติภายในไม่กี่วินาที รองรับทุกธนาคาร</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-4xl text-cyan-600 mb-2">🔒</span>
          <h2 className="text-xl font-bold mb-2">ปลอดภัยสูงสุด</h2>
          <p className="text-gray-700 text-center">เข้ารหัสข้อมูลทุกขั้นตอน มาตรฐานเดียวกับธนาคารชั้นนำ</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-4xl text-cyan-600 mb-2">📊</span>
          <h2 className="text-xl font-bold mb-2">Dashboard Real-time</h2>
          <p className="text-gray-700 text-center">ดูข้อมูลธุรกรรม วิเคราะห์ยอดขายได้แบบเรียลไทม์</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-4xl text-cyan-600 mb-2">🌐</span>
          <h2 className="text-xl font-bold mb-2">รองรับทุกช่องทาง</h2>
          <p className="text-gray-700 text-center">QR, PromptPay, Credit Card, TrueMoney, LinePay, ฯลฯ</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-4xl text-cyan-600 mb-2">🛡️</span>
          <h2 className="text-xl font-bold mb-2">ป้องกัน Fraud</h2>
          <p className="text-gray-700 text-center">AI ตรวจจับธุรกรรมผิดปกติ ลดความเสี่ยงการโดนโกง</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-4xl text-cyan-600 mb-2">💬</span>
          <h2 className="text-xl font-bold mb-2">แจ้งเตือนอัตโนมัติ</h2>
          <p className="text-gray-700 text-center">แจ้งเตือนทุกธุรกรรมผ่าน LINE, Email, Telegram</p>
        </div>
      </div>
    </div>
  );
}
