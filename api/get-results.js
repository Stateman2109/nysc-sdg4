import { sql } from '@vercel/postgres';

export default async function handler(req, res) {

  try {

    const { rows } = await sql`
      SELECT * FROM results
      ORDER BY created_at DESC
    `;

    res.status(200).json({
      success: true,
      data: rows
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

}