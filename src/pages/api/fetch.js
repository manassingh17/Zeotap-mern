// filepath: src/pages/api/fetch.js
import { ClickHouse } from 'clickhouse';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { token, table } = req.query;

    const host = process.env.CLICKHOUSE_URL; // use same format as in ingest
    const port = process.env.CLICKHOUSE_PORT;
    const user = process.env.CLICKHOUSE_USER;
    const database = process.env.CLICKHOUSE_DB || 'default';

    if (!host || !port || !user || !database || !token || !table) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const clickhouse = new ClickHouse({
            url: `${host}:${port}`,
            basicAuth: { username: user, password: token },
            isUseGzip: true,
            format: 'json',
            database,
        });

        const result = await clickhouse.query(`SELECT * FROM ${table}`).toPromise();

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
