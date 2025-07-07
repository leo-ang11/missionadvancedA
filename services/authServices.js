import { pool } from '../database/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from "multer";
import path from "path";

export async function isEmailExist(email) {
  const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  return rows.length > 0;
}

export async function register(name, email, phone, hashedPassword, token) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, phone, password, token) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone, hashedPassword, token]
  );
  return result;
}


export async function login(email, password) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) return null;

  const user = rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  return user;
}

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export async function verifyToken(token) {
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE token = ?",
    [token]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function activateUser(userId) {
  const [result] = await pool.query(
    "UPDATE users SET status = 1, token = NULL WHERE id = ?",
    [userId]
  );
  return result;
}

export async function listCategory(page, limit) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    "SELECT * FROM kategori_kelas ORDER BY id_kategori DESC LIMIT ? OFFSET ?",
    [parseInt(limit), parseInt(offset)]
  );

  const [countResult] = await pool.query("SELECT COUNT(*) AS total FROM kategori_kelas");
  const total = countResult[0].total;

  return {
    data: rows,
    totalData: total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit)
  };
}

const allowedTypes = [".jpg", ".jpeg", ".png"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedTypes.includes(ext)) {
    const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
    error.message = "Hanya file PNG, JPG, atau JPEG yang diizinkan";
    return cb(error);
  }

  cb(null, true);
};

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  },
});

// Batasi ukuran file: maksimal 2MB
export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter
});

export async function updateUserPhoto(userId, photo) {
  const [result] = await pool.query("UPDATE users SET photo = ? WHERE id = ?", [photo, userId]);
  return result;
}
