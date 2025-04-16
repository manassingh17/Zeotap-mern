import React, { useState } from 'react';

const ClickHouseForm = () => {
    const [formData, setFormData] = useState({
        host: 'http://localhost',
        port: '8123',
        database: 'default',
        user: 'manas',
        token: 'manas',
    });
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [columns, setColumns] = useState([]);
    const [dataRows, setDataRows] = useState([]);
    const [fetchedData, setFetchedData] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleConnect = async () => {
        alert('Connected successfully!');
    };

    const handleFetchTables = async () => {
        try {
            const response = await fetch(`/api/clickhouse?host=${formData.host}&port=${formData.port}&database=${formData.database}&user=${formData.user}&token=${formData.token}`);
            const result = await response.json();
            if (result.success) {
                setTables(result.data.map((row) => row.name));
                alert('Tables: ' + result.data.map((row) => row.name).join(', '));
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Failed to fetch tables: ' + error.message);
        }
    };

    const handleFetchColumns = async () => {
        if (!selectedTable) return alert('Please select a table first.');
        try {
            const response = await fetch(`/api/schema?host=${formData.host}&port=${formData.port}&database=${formData.database}&user=${formData.user}&token=${formData.token}&table=${selectedTable}`);
            const result = await response.json();
            if (result.success) {
                setColumns(result.data);
                setDataRows([{ ...result.data.reduce((acc, col) => ({ ...acc, [col]: '' }), {}) }]);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Failed to fetch columns: ' + error.message);
        }
    };

    const handleDataChange = (rowIndex, column, value) => {
        const updatedRows = [...dataRows];
        updatedRows[rowIndex][column] = value;
        setDataRows(updatedRows);
    };

    const addRow = () => {
        const newRow = {};
        columns.forEach((col) => (newRow[col] = ''));
        setDataRows([...dataRows, newRow]);
    };

    const deleteRow = (rowIndex) => {
        const updatedRows = dataRows.filter((_, index) => index !== rowIndex);
        setDataRows(updatedRows);
    };

    const handleIngestData = async () => {
        try {
            const response = await fetch('/api/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    table: selectedTable,
                    columns,
                    data: dataRows,
                }),
            });
            const result = await response.json();
            if (result.success) {
                alert('Data ingested successfully!');
                handleFetchData();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Failed to ingest data: ' + error.message);
        }
    };

    const handleFetchData = async () => {
        if (!selectedTable) return alert('Please select a table first.');
        try {
            const response = await fetch(`/api/fetch?host=${formData.host}&port=${formData.port}&database=${formData.database}&user=${formData.user}&token=${formData.token}&table=${selectedTable}`);
            const result = await response.json();
            if (result.success) {
                setFetchedData(result.data);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Failed to fetch data: ' + error.message);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto text-sm space-y-10">
            <div className="bg-white shadow-md rounded-xl p-6 space-y-6 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">🔧 ClickHouse Configuration</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.keys(formData).map((key) => (
                        <input
                            key={key}
                            name={key}
                            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={formData[key]}
                            onChange={handleChange}
                            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    ))}
                    <button onClick={handleConnect} className="col-span-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">
                        Connect
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-xl p-6 space-y-4 border border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                    <button onClick={handleFetchTables} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                        📂 Fetch Tables
                    </button>
                    <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="border p-2 rounded-lg"
                    >
                        <option value="">Select Table</option>
                        {tables.map((table) => (
                            <option key={table} value={table}>{table}</option>
                        ))}
                    </select>
                    <button onClick={handleFetchColumns} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
                        🧩 Fetch Columns
                    </button>
                </div>
            </div>

            {columns.length > 0 && (
                <div className="bg-white shadow-md rounded-xl p-6 space-y-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">📝 Enter Data</h3>
                    <table className="w-full border-collapse text-sm rounded overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col} className="border p-2 text-left font-medium text-gray-600">{col}</th>
                                ))}
                                <th className="border p-2 text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataRows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-t hover:bg-gray-50">
                                    {columns.map((col) => (
                                        <td key={col} className="p-2 border">
                                            <input
                                                type="text"
                                                value={row[col]}
                                                onChange={(e) => handleDataChange(rowIndex, col, e.target.value)}
                                                className="w-full border p-1 rounded focus:ring-1 focus:ring-blue-400 outline-none"
                                            />
                                        </td>
                                    ))}
                                    <td className="p-2 border text-red-500">
                                        <button onClick={() => deleteRow(rowIndex)} className="hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex gap-4 mt-4">
                        <button onClick={addRow} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                            ➕ Add Row
                        </button>
                        <button onClick={handleIngestData} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
                            🚀 Ingest Data
                        </button>
                    </div>
                </div>
            )}

            {selectedTable && (
                <div className="bg-white shadow-md rounded-xl p-6 space-y-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">📊 Fetched Data</h3>
                        <button onClick={handleFetchData} className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">
                            🔄 Refresh
                        </button>
                    </div>
                    {fetchedData.length > 0 && (
                        <div className="overflow-auto max-h-[400px] border rounded">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        {Object.keys(fetchedData[0]).map((col) => (
                                            <th key={col} className="border p-2">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fetchedData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="border-t hover:bg-gray-50">
                                            {Object.values(row).map((value, colIndex) => (
                                                <td key={colIndex} className="border p-2">{value}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClickHouseForm;
