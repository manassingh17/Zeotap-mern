import { ClickHouse } from 'clickhouse';

export const createClickHouseClient = ({ host, port, user, token, database }) => {
    return new ClickHouse({
        url: `${host}:${port}`,
        basicAuth: { username: user, password: token },
        isUseGzip: true,
        database,
    });
};

export const executeQuery = async (client, query) => {
    try {
        const rows = await client.query(query).toPromise();
        return rows;
    } catch (error) {
        throw new Error(`Query failed: ${error.message}`);
    }
};