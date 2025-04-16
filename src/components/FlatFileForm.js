import React, { useState } from 'react';
import Papa from 'papaparse'; // Install this library using `npm install papaparse`

const FlatFileForm = () => {
    const [formData, setFormData] = useState({
        host: 'http://localhost',
        port: '8123',
        database: 'default',
        user: 'default',
        token: '',
        table: '',
        delimiter: ',',
    });
    const [fileData, setFileData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [recordCount, setRecordCount] = useState(null);
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) {
            alert('Please select a file.');
            return;
        }

        if (file.type === 'text/csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                delimiter: formData.delimiter,
                complete: (result) => {
                    setFileData(result.data);
                    setColumns(Object.keys(result.data[0]));
                    alert('File parsed successfully!');
                },
                error: (error) => {
                    alert('Error parsing file: ' + error.message);
                },
            });
        } else if (file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    setFileData(jsonData);
                    setColumns(Object.keys(jsonData[0]));
                    alert('File parsed successfully!');
                } catch (error) {
                    alert('Error parsing JSON file: ' + error.message);
                }
            };
            reader.readAsText(file);
        } else {
            alert('Unsupported file type. Please upload a CSV or JSON file.');
        }
    };

    const handleColumnSelection = (column) => {
        if (selectedColumns.includes(column)) {
            setSelectedColumns(selectedColumns.filter((col) => col !== column));
        } else {
            setSelectedColumns([...selectedColumns, column]);
        }
    };

    const handleIngestFileData = async () => {
        if (!formData.table) {
            alert('Please specify a table name.');
            return;
        }

        if (fileData.length === 0) {
            alert('No data to ingest. Please upload a file first.');
            return;
        }

        if (selectedColumns.length === 0) {
            alert('Please select at least one column.');
            return;
        }

        try {
            setStatus('Ingesting data...');
            const response = await fetch('/api/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    host: formData.host,
                    port: formData.port,
                    database: formData.database,
                    user: formData.user,
                    token: formData.token,
                    table: formData.table,
                    columns: selectedColumns,
                    data: fileData.map((row) =>
                        Object.fromEntries(
                            selectedColumns.map((col) => [col, row[col]])
                        )
                    ),
                }),
            });
            const result = await response.json();
            if (result.success) {
                setRecordCount(result.recordCount);
                setStatus('Data ingested successfully!');
            } else {
                setStatus('Error: ' + result.error);
            }
        } catch (error) {
            setStatus('Failed to ingest file data: ' + error.message);
        }
    };

    return (
        <form className="p-6 bg-gray-100 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-gray-700">Flat File Ingestion</h2>
            <div className="grid grid-cols-2 gap-4">
                <input
                    name="host"
                    placeholder="Host"
                    value={formData.host}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    name="port"
                    placeholder="Port"
                    value={formData.port}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    name="database"
                    placeholder="Database"
                    value={formData.database}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    name="user"
                    placeholder="User"
                    value={formData.user}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    name="token"
                    placeholder="JWT Token"
                    value={formData.token}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    name="table"
                    placeholder="Table Name"
                    value={formData.table}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    name="delimiter"
                    placeholder="Delimiter (e.g., , or ;)"
                    value={formData.delimiter}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-600">Upload File</h3>
                <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="p-2 border border-gray-300 rounded"
                />
            </div>

            {columns.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-600">Select Columns</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {columns.map((col) => (
                            <div key={col} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={selectedColumns.includes(col)}
                                    onChange={() => handleColumnSelection(col)}
                                    className="h-4 w-4"
                                />
                                <label className="text-sm text-gray-700">{col}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {fileData.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-600">Preview Data</h3>
                    <table className="min-w-full border border-gray-300">
                        <thead>
                            <tr>
                                {selectedColumns.map((col) => (
                                    <th
                                        key={col}
                                        className="px-4 py-2 border border-gray-300 bg-gray-200 text-left text-sm font-medium text-gray-700"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {fileData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-100">
                                    {selectedColumns.map((col) => (
                                        <td
                                            key={col}
                                            className="px-4 py-2 border border-gray-300 text-sm text-gray-700"
                                        >
                                            {row[col]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        type="button"
                        onClick={handleIngestFileData}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Ingest File Data
                    </button>
                </div>
            )}

            {status && <p className="text-sm text-gray-600">Status: {status}</p>}
            {recordCount !== null && (
                <p className="text-sm text-green-600">Total Records Processed: {recordCount}</p>
            )}
        </form>
    );
};

export default FlatFileForm;