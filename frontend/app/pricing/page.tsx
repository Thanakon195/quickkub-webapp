export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
      <h1 className="text-5xl font-extrabold text-purple-900 mb-4">แพ็กเกจราคา</h1>
      <div className="flex flex-wrap gap-8 justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center w-80 border-2 border-purple-200 hover:border-purple-500 transition">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">Bronze</h2>
          <div className="text-4xl font-extrabold text-purple-900 mb-4">฿0</div>
          <ul className="text-gray-700 mb-6 text-center">
            <li>ค่าธรรมเนียม 3.5%</li>
            <li>จำกัด 1,000 ธุรกรรม/วัน</li>
            <li>Support Email</li>
          </ul>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition">เลือกแพ็กเกจ</button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center w-80 border-4 border-blue-400 scale-105">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Silver</h2>
          <div className="text-4xl font-extrabold text-blue-900 mb-4">฿499</div>
          <ul className="text-gray-700 mb-6 text-center">
            <li>ค่าธรรมเนียม 2.5%</li>
            <li>จำกัด 10,000 ธุรกรรม/วัน</li>
            <li>Support 24/7</li>
          </ul>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">เลือกแพ็กเกจ</button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center w-80 border-2 border-yellow-300 hover:border-yellow-500 transition">
          <h2 className="text-2xl font-bold text-yellow-700 mb-2">Gold</h2>
          <div className="text-4xl font-extrabold text-yellow-900 mb-4">฿1,999</div>
          <ul className="text-gray-700 mb-6 text-center">
            <li>ค่าธรรมเนียม 1.5%</li>
            <li>จำกัด 100,000 ธุรกรรม/วัน</li>
            <li>Priority Support</li>
          </ul>
          <button className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 transition">เลือกแพ็กเกจ</button>
        </div>
      </div>
    </div>
  );
}
