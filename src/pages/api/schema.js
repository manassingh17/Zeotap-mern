// filepath: src/pages/api/schema.js
import { ClickHouse } from 'clickhouse';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { host, port, database, token, table } = req.query;
        const user = process.env.CLICKHOUSE_USER;

        if (!host || !port || !database || !user || !token || !table) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        try {
            const clickhouse = new ClickHouse({
                url: `${host}:${port}`,
                basicAuth: { username: user, password: token },
                isUseGzip: true,
                database,
            });

            const rows = await clickhouse.query(`DESCRIBE TABLE ${table} FORMAT JSON`).toPromise();
            const columns = rows.map(row => row.name);

            res.status(200).json({ success: true, data: columns });
        } catch (error) {
            console.error('Error fetching schema:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
