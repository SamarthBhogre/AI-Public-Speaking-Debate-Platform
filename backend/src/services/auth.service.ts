import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/pool';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { User } from '../types';

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [
    email.toLowerCase().trim(),
  ]);
  if (exists.rows.length) throw new AppError(409, 'Email already registered');

  const hash = await bcrypt.hash(password, 12);
  let rows;
  try {
    ({ rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
      [name.trim(), email.toLowerCase().trim(), hash],
    ));
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new AppError(409, 'Email already registered');
    }
    throw error;
  }
  const user: User = rows[0] as User;
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  );
  return { user, token };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase().trim()],
  );
  if (!rows.length) throw new AppError(401, 'Invalid email or password');

  const match = await bcrypt.compare(password, rows[0].password_hash as string);
  if (!match) throw new AppError(401, 'Invalid email or password');

  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [
    rows[0].id,
  ]);
  const user: User = {
    id: rows[0].id as string,
    name: rows[0].name as string,
    email: rows[0].email as string,
    role: rows[0].role as string,
    created_at: rows[0].created_at as string,
  };
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  );
  return { user, token };
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id],
  );
  return (rows[0] as User) || null;
}
