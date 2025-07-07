# Backend Video Belajar

## ⚙️ Konfigurasi

### 1. Database
- Import file `video_belajar.sql` ke MySQL (bisa pakai phpMyAdmin atau CLI)

### 2. Environment Variables
Buat file `.env` di root project dan isi:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=video_belajar

JWT_SECRET=secret_key
PORT=3000

MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=94d4693c7548b4
MAIL_PASS=931eed5cad1ff4

📦 Endpoint API
🔐 Register
Method: POST

URL: http://localhost:3000/register

Body (JSON): {
  "name": "Leo Anggoro",
  "email": "leo11@gmail.com",
  "phone": "0857787878",
  "password": "abc"
}

🔑 Login
Method: POST

URL: http://localhost:3000/login

Body (JSON): {
  "email": "leo11@gmail.com",
  "password": "abc"
}

✅ Verify Email
Method: GET

URL Contoh: http://localhost:3000/verify-email/81307bb294adb7e40123025ac75af3a4a82f1392

📂 Category
Method: GET

URL: http://localhost:3000/category?page=1&limit=2

Headers:
Authorization: Bearer <token_dari_login>

📤 Upload Foto Profil
Method: POST

URL: http://localhost:3000/upload

Headers:
Authorization: Bearer <token_dari_login>

Body (Form Data):

photo: (type: file)

✅ Tips
Gunakan Postman untuk menguji endpoint

Pastikan server sudah berjalan dengan node app.js