import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { imei, date, start, end } = req.query;

  try {
    const db = await getDb();
    const query: any = {};

    if (imei) query.imei = imei;
    
    if (date) {
      query.day = date;
    } else if (start && end) {
      query.timestamp = {
        $gte: new Date(start as string),
        $lte: new Date(end as string)
      };
    }

    const history = await db.collection('vehicle_history')
      .find(query)
      .sort({ timestamp: 1 })
      .toArray();

    return res.status(200).json(history);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
