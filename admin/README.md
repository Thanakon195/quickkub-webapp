# QuickKub Admin Panel

Admin Panel สำหรับระบบ QuickKub Payment Gateway ที่สร้างด้วย React และ TailwindCSS

## ฟีเจอร์หลัก

### 🔐 การจัดการผู้ใช้

- ระบบ Authentication และ Authorization
- จัดการสิทธิ์ผู้ใช้งาน
- ระบบ MFA (Multi-Factor Authentication)

### 🏢 การจัดการ Merchant

- ดูรายการ Merchant ทั้งหมด
- เพิ่ม Merchant ใหม่
- แก้ไขข้อมูล Merchant
- จัดการสถานะ Merchant (เปิดใช้งาน/ระงับ/รอการอนุมัติ)
- ดูรายละเอียด Merchant

### 💳 การจัดการธุรกรรม

- ดูรายการธุรกรรมทั้งหมด
- ค้นหาและกรองธุรกรรม
- ดูรายละเอียดธุรกรรม
- จัดการสถานะธุรกรรม

### 📊 รายงานและสถิติ

- Dashboard แสดงสถิติสำคัญ
- รายงานรายได้และธุรกรรม
- กราฟแสดงแนวโน้ม
- ส่งออกรายงาน (PDF, Excel, CSV)

### ⚙️ การตั้งค่าระบบ

- การตั้งค่าทั่วไป
- การตั้งค่าการชำระเงิน
- การตั้งค่าความปลอดภัย
- การตั้งค่าการแจ้งเตือน
- การตั้งค่า API

## การติดตั้ง

### ความต้องการของระบบ

- Node.js 18+
- npm หรือ yarn

### ขั้นตอนการติดตั้ง

1. ติดตั้ง dependencies:

```bash
npm install
```

2. สร้างไฟล์ environment:

```bash
cp .env.example .env.local
```

3. แก้ไขไฟล์ `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=QuickKub Admin
```

4. รัน development server:

```bash
npm run dev
```

5. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## โครงสร้างโปรเจค

```
admin/
├── components/          # React Components
│   ├── ui/             # UI Components (shadcn/ui)
│   ├── forms/          # Form Components
│   └── layouts/        # Layout Components
├── pages/              # Next.js Pages
│   ├── merchants/      # Merchant Management
│   ├── transactions/   # Transaction Management
│   ├── reports/        # Reports & Analytics
│   └── settings/       # System Settings
├── lib/                # Utility Libraries
│   ├── api-client.ts   # API Client
│   └── utils.ts        # Utility Functions
├── types/              # TypeScript Types
└── styles/             # Global Styles
```

## การใช้งาน

### การเข้าสู่ระบบ

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
2. กรอกอีเมลและรหัสผ่าน
3. หากเปิดใช้งาน MFA จะต้องกรอก OTP เพิ่มเติม

### การจัดการ Merchant

1. ไปที่เมนู "Merchants"
2. ดูรายการ Merchant ทั้งหมด
3. คลิก "เพิ่ม Merchant ใหม่" เพื่อเพิ่ม Merchant
4. คลิก "แก้ไข" เพื่อแก้ไขข้อมูล Merchant
5. คลิก "ระงับ" หรือ "เปิดใช้งาน" เพื่อเปลี่ยนสถานะ

### การดูรายงาน

1. ไปที่เมนู "Reports"
2. เลือกช่วงเวลาที่ต้องการดู
3. ดูสถิติและกราฟต่างๆ
4. คลิกปุ่มส่งออกเพื่อดาวน์โหลดรายงาน

### การตั้งค่าระบบ

1. ไปที่เมนู "Settings"
2. เลือกแท็บที่ต้องการตั้งค่า
3. แก้ไขค่าต่างๆ
4. คลิก "บันทึกการตั้งค่า"

## API Endpoints

### Authentication

- `POST /auth/login` - เข้าสู่ระบบ
- `POST /auth/logout` - ออกจากระบบ
- `POST /auth/refresh` - รีเฟรช token

### Merchants

- `GET /merchants` - ดูรายการ Merchant
- `POST /merchants` - เพิ่ม Merchant ใหม่
- `GET /merchants/:id` - ดูรายละเอียด Merchant
- `PUT /merchants/:id` - แก้ไขข้อมูล Merchant
- `PATCH /merchants/:id/status` - เปลี่ยนสถานะ Merchant

### Transactions

- `GET /transactions` - ดูรายการธุรกรรม
- `GET /transactions/:id` - ดูรายละเอียดธุรกรรม
- `PATCH /transactions/:id/status` - เปลี่ยนสถานะธุรกรรม

### Reports

- `GET /admin/dashboard/stats` - สถิติ Dashboard
- `GET /admin/transactions/stats` - สถิติธุรกรรม

### Settings

- `GET /admin/settings` - ดูการตั้งค่าระบบ
- `PUT /admin/settings` - บันทึกการตั้งค่าระบบ

## การพัฒนา

### การเพิ่มหน้าใหม่

1. สร้างไฟล์ใน `pages/` directory
2. ใช้ Next.js routing
3. เพิ่มเมนูใน `components/layouts/AdminLayout.tsx`

### การเพิ่ม Component ใหม่

1. สร้างไฟล์ใน `components/` directory
2. ใช้ TypeScript interfaces
3. ใช้ TailwindCSS สำหรับ styling

### การเพิ่ม API Endpoint

1. เพิ่มใน `lib/api-client.ts`
2. ใช้ TypeScript types
3. จัดการ error handling

## การ Deploy

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t quickkub-admin .
docker run -p 3000:3000 quickkub-admin
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **ไม่สามารถเชื่อมต่อ API ได้**
   - ตรวจสอบ `NEXT_PUBLIC_API_URL` ใน `.env.local`
   - ตรวจสอบว่า backend server กำลังทำงาน

2. **Error เกี่ยวกับ dependencies**
   - ลบ `node_modules` และ `package-lock.json`
   - รัน `npm install` ใหม่

3. **TypeScript errors**
   - ตรวจสอบ types ใน `types/` directory
   - รัน `npm run type-check`

## การสนับสนุน

หากมีปัญหาหรือคำถาม สามารถติดต่อได้ที่:

- Email: support@quickkub.com
- Documentation: https://docs.quickkub.com
- GitHub Issues: https://github.com/quickkub/admin/issues
