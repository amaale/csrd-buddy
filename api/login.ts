import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from "bcrypt";
import { z } from "zod";

// Import the storage with a proper path for Vercel
import { storage } from '../server/storage.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Get user
    const user = await storage.getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}
