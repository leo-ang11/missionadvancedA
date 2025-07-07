import express from "express";
import {
  isEmailExist,
  register,
  login,
  generateToken,
  verifyToken,
  activateUser,
  listCategory,
  updateUserPhoto,
  upload
} from "../services/authServices.js";
import { sendWelcomeEmail } from "../mailer/sendMail.js"
import bcrypt from "bcrypt";
import crypto from "crypto";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Pastikan Semua field harus diisi" });
    }

    if (await isEmailExist(email)) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await register(name, email, phone, hashedPassword, token);

    await sendWelcomeEmail(email, name, token);

    res.status(201).json({ 
        message: "User berhasil didaftarkan",
        user: {
            id: result.insertId,
            name,
            email,
            phone
        }
     });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mendaftarkan user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await login(email, password);

    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    if (user.status === 0) {
      return res.status(401).json({ message: "Akun belum diaktivasi, silahkan cek di email Anda" });
    }

    const token = generateToken(user.id);
    res.status(200).json({ message: "Login berhasil", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal melakukan login" });
  }
});

router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await verifyToken(token);

    if (!user) {
      return res.status(400).json({ message: "Token tidak valid" });
    }

    await activateUser(user.id);

    res.status(200).json({ message: "Akun berhasil diaktivasi, silakan login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memverifikasi akun" });
  }
});

router.get("/category", authMiddleware, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const categories = await listCategory(page, limit);
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mendapatkan daftar kategori" });
  }
});

router.post("/upload", authMiddleware, (req, res) => {
  upload.single("photo")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // Ukuran terlalu besar atau validasi file gagal
      return res.status(400).json({ message: err.message });
    }

    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah" });
    }

    const filename = req.file.filename;
    const userId = req.user.id;

    await updateUserPhoto(userId, filename);

    res.status(200).json({ message: "Upload berhasil", filename });
  });
});


export default router;
