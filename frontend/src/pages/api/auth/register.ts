import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface RegisterResponse {
  token?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, password and name are required' 
      });
    }

    // Call backend API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      {
        email,
        password,
        name,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 409) {
      return res.status(409).json({ 
        error: 'Email already exists' 
      });
    }

    return res.status(500).json({ 
      error: 'Registration failed. Please try again later.' 
    });
  }
} 