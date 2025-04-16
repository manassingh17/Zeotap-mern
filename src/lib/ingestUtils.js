export const transformDataForCSV = (data, columns) => {
    return data.map((row) => columns.map((col) => row[col]).join(',')).join('\n');
};

export const transformDataForClickHouse = (data, columns) => {
    return data.map((row) => `(${columns.map((col) => row[col]).join(',')})`).join(',');
};