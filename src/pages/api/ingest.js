import { ClickHouse } from 'clickhouse';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { token, table, columns, data } = req.body;

    const host = process.env.CLICKHOUSE_URL; // e.g. 'http://localhost'
    const port = process.env.CLICKHOUSE_PORT; // e.g. '8123'
    const user = process.env.CLICKHOUSE_USER; // 'manas'
    const database = process.env.CLICKHOUSE_DB || 'default';

    if (!host || !port || !user || !database || !token || !table || !columns || !data) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const clickhouse = new ClickHouse({
            url: `${host}:${port}`,
            basicAuth: { username: user, password: token },
            isUseGzip: true,
            format: 'json',
            database: database,
        });

        const query = `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES
        `;

        const values = data.map(row =>
            `(${columns.map(col => `'${row[col]}'`).join(', ')})`
        );

        const fullQuery = query + values.join(', ');

        await clickhouse.query(fullQuery).toPromise();

        return res.status(200).json({ success: true, recordCount: data.length });
    } catch (error) {
        console.error('Error ingesting data:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
