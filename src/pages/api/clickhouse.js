import { ClickHouse } from 'clickhouse';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Handle POST requests (execute a custom query)
        const { host, port, database, user, token, query } = req.body;

        if (!host || !port || !database || !user || !query) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        try {
            // Use token if provided, otherwise fallback to environment variable
            const finalUser = process.env.CLICKHOUSE_USER ;
            const finalPassword = process.env.CLICKHOUSE_PASSWORD ;
            console.log('Connecting with:', {
                host,
                port,
                database,
                user: finalUser,
                password: finalPassword,
            });
            const clickhouse = new ClickHouse({
                url: `${host}:${port}`,
                basicAuth: { username: finalUser, password: finalPassword },
                isUseGzip: true,
                database: database,
            });

            // Execute the query
            const rows = await clickhouse.query(query).toPromise();
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    } else if (req.method === 'GET') {
        // Handle GET requests (fetching tables)
        const { host, port, database, user, token } = req.query;

        if (!host || !port || !database || !user) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        try {
            // Use token if provided, otherwise fallback to environment variable
            const finalUser =process.env.CLICKHOUSE_USER ;
            const finalPassword = process.env.CLICKHOUSE_PASSWORD;
            console.log('Connecting with:', {
                host,
                port,
                database,
                user: finalUser,
                password: finalPassword,
            });
            const clickhouse = new ClickHouse({
                url: `${host}:${port}`,
                basicAuth: { username: finalUser, password: finalPassword },
                isUseGzip: true,
                database: database,
            });

            // Execute the SHOW TABLES query
            const rows = await clickhouse.query('SHOW TABLES').toPromise();
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error('Error fetching tables:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        // Handle unsupported methods
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}