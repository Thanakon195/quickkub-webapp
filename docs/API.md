# QuickKub Payment Gateway API Documentation

## Overview

QuickKub Payment Gateway API เป็น RESTful API ที่ให้บริการจัดการการชำระเงิน การจัดการร้านค้า และระบบบริหารจัดการต่างๆ

## Base URL

```
Development: http://localhost:3002/api/v1
Production: https://api.quickkub.com/api/v1
```

## Authentication

API ใช้ JWT (JSON Web Token) สำหรับการยืนยันตัวตน

### Getting a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Using the Token

```http
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/login

เข้าสู่ระบบ

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "number",
    "email": "string",
    "role": "string"
  }
}
```

#### POST /auth/register

ลงทะเบียนผู้ใช้ใหม่

**Request Body:**

```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

### Users

#### GET /users

ดึงรายการผู้ใช้ทั้งหมด

**Query Parameters:**

- `page` (number): หน้า
- `limit` (number): จำนวนรายการต่อหน้า
- `search` (string): ค้นหา

#### GET /users/:id

ดึงข้อมูลผู้ใช้ตาม ID

#### PUT /users/:id

อัปเดตข้อมูลผู้ใช้

#### DELETE /users/:id

ลบผู้ใช้

### Merchants

#### GET /merchants

ดึงรายการร้านค้าทั้งหมด

**Query Parameters:**

- `page` (number): หน้า
- `limit` (number): จำนวนรายการต่อหน้า
- `status` (string): สถานะ (active, inactive, pending)
- `search` (string): ค้นหา

#### POST /merchants

สร้างร้านค้าใหม่

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "businessType": "string",
  "taxId": "string"
}
```

#### GET /merchants/:id

ดึงข้อมูลร้านค้าตาม ID

#### PUT /merchants/:id

อัปเดตข้อมูลร้านค้า

#### DELETE /merchants/:id

ลบร้านค้า

### Payments

#### GET /payments

ดึงรายการการชำระเงินทั้งหมด

**Query Parameters:**

- `page` (number): หน้า
- `limit` (number): จำนวนรายการต่อหน้า
- `status` (string): สถานะ (pending, completed, failed)
- `merchantId` (number): ID ร้านค้า
- `startDate` (string): วันที่เริ่มต้น (YYYY-MM-DD)
- `endDate` (string): วันที่สิ้นสุด (YYYY-MM-DD)

#### POST /payments

สร้างการชำระเงินใหม่

**Request Body:**

```json
{
  "amount": "number",
  "currency": "string",
  "description": "string",
  "merchantId": "number",
  "paymentMethod": "string",
  "customerEmail": "string"
}
```

#### GET /payments/:id

ดึงข้อมูลการชำระเงินตาม ID

#### PUT /payments/:id

อัปเดตข้อมูลการชำระเงิน

#### POST /payments/:id/capture

ยืนยันการชำระเงิน

#### POST /payments/:id/refund

คืนเงิน

### Transactions

#### GET /transactions

ดึงรายการธุรกรรมทั้งหมด

**Query Parameters:**

- `page` (number): หน้า
- `limit` (number): จำนวนรายการต่อหน้า
- `status` (string): สถานะ
- `type` (string): ประเภทธุรกรรม
- `merchantId` (number): ID ร้านค้า

#### GET /transactions/:id

ดึงข้อมูลธุรกรรมตาม ID

#### POST /transactions

สร้างธุรกรรมใหม่

### Wallets

#### GET /wallets

ดึงรายการกระเป๋าเงินทั้งหมด

#### GET /wallets/:id

ดึงข้อมูลกระเป๋าเงินตาม ID

#### POST /wallets

สร้างกระเป๋าเงินใหม่

#### PUT /wallets/:id

อัปเดตข้อมูลกระเป๋าเงิน

#### POST /wallets/:id/transfer

โอนเงิน

### Invoices

#### GET /invoices

ดึงรายการใบแจ้งหนี้ทั้งหมด

#### POST /invoices

สร้างใบแจ้งหนี้ใหม่

#### GET /invoices/:id

ดึงข้อมูลใบแจ้งหนี้ตาม ID

#### PUT /invoices/:id

อัปเดตข้อมูลใบแจ้งหนี้

#### POST /invoices/:id/send

ส่งใบแจ้งหนี้

### Webhooks

#### GET /webhooks

ดึงรายการ webhook ทั้งหมด

#### POST /webhooks

สร้าง webhook ใหม่

**Request Body:**

```json
{
  "url": "string",
  "events": ["payment.completed", "payment.failed"],
  "description": "string"
}
```

#### GET /webhooks/:id

ดึงข้อมูล webhook ตาม ID

#### PUT /webhooks/:id

อัปเดตข้อมูล webhook

#### DELETE /webhooks/:id

ลบ webhook

#### POST /webhooks/:id/test

ทดสอบ webhook

### Settlements

#### GET /settlements

ดึงรายการการชำระบัญชีทั้งหมด

#### POST /settlements

สร้างการชำระบัญชีใหม่

#### GET /settlements/:id

ดึงข้อมูลการชำระบัญชีตาม ID

#### POST /settlements/:id/process

ประมวลผลการชำระบัญชี

### Reports

#### GET /reports/transactions

รายงานธุรกรรม

**Query Parameters:**

- `startDate` (string): วันที่เริ่มต้น
- `endDate` (string): วันที่สิ้นสุด
- `merchantId` (number): ID ร้านค้า
- `format` (string): รูปแบบ (json, csv, pdf)

#### GET /reports/merchants

รายงานร้านค้า

#### GET /reports/settlements

รายงานการชำระบัญชี

### Admin

#### GET /admin/stats

สถิติระบบ

#### GET /admin/logs

บันทึกระบบ

#### PUT /admin/config

อัปเดตการตั้งค่าระบบ

#### POST /admin/backup

สำรองข้อมูล

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Rate Limiting

API มีการจำกัดอัตราการเรียกใช้:

- 100 requests per 15 minutes สำหรับ endpoints ทั่วไป
- 10 requests per minute สำหรับ authentication endpoints

## Pagination

สำหรับ endpoints ที่รองรับ pagination:

**Query Parameters:**

- `page` (number): หน้า (เริ่มต้นที่ 1)
- `limit` (number): จำนวนรายการต่อหน้า (สูงสุด 100)

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Webhooks

### Events

- `payment.completed` - การชำระเงินสำเร็จ
- `payment.failed` - การชำระเงินล้มเหลว
- `payment.refunded` - การคืนเงิน
- `merchant.created` - สร้างร้านค้าใหม่
- `merchant.updated` - อัปเดตร้านค้า
- `settlement.processed` - ประมวลผลการชำระบัญชี

### Webhook Payload

```json
{
  "event": "payment.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "paymentId": "string",
    "amount": "number",
    "currency": "string",
    "status": "string"
  }
}
```

## SDKs

### JavaScript/TypeScript

```bash
npm install @quickkub/sdk
```

```javascript
import { QuickKubAPI } from '@quickkub/sdk'

const api = new QuickKubAPI({
  apiKey: 'your-api-key',
  environment: 'production',
})

// Create payment
const payment = await api.payments.create({
  amount: 1000,
  currency: 'THB',
  description: 'Payment for order #123',
})
```

### PHP

```bash
composer require quickkub/php-sdk
```

```php
use QuickKub\QuickKubAPI;

$api = new QuickKubAPI([
    'api_key' => 'your-api-key',
    'environment' => 'production'
]);

$payment = $api->payments->create([
    'amount' => 1000,
    'currency' => 'THB',
    'description' => 'Payment for order #123'
]);
```

## Support

สำหรับคำถามหรือปัญหาการใช้งาน API:

- **Documentation**: https://docs.quickkub.com
- **Support Email**: api-support@quickkub.com
- **Developer Portal**: https://developers.quickkub.com
