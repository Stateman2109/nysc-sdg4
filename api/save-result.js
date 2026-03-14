import { sql } from '@vercel/postgres';

export default async function handler(req, res) {

if (req.method !== 'POST') {
return res.status(405).json({ error: "Method not allowed" });
}

try {

const {
name,
school,
exam,
subject,
score,
device,
city,
country
} = req.body;

await sql`
INSERT INTO results
(name, school, exam, subject, score, device, city, country, created_at)
VALUES
(${name}, ${school}, ${exam}, ${subject}, ${score}, ${device}, ${city}, ${country}, NOW())
`;

return res.status(200).json({ success: true });

} catch (error) {

return res.status(500).json({ error: error.message });

}

}