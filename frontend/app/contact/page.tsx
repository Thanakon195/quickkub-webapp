export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <h1 className="text-5xl font-extrabold text-blue-900 mb-4">ติดต่อเรา</h1>
      <p className="text-lg text-blue-700 max-w-xl text-center mb-8">
        มีคำถามหรือข้อเสนอแนะ? ทีมงาน QuickKub พร้อมช่วยเหลือคุณทุกวันตลอด 24 ชั่วโมง
      </p>
      <form className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
        <input className="border border-blue-300 rounded-lg px-4 py-2" placeholder="ชื่อของคุณ" />
        <input className="border border-blue-300 rounded-lg px-4 py-2" placeholder="อีเมล" />
        <textarea className="border border-blue-300 rounded-lg px-4 py-2" placeholder="ข้อความ" rows={4} />
        <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">ส่งข้อความ</button>
      </form>
    </div>
  );
}
