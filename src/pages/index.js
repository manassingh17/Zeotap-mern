import React, { useState } from 'react';
import ClickHouseForm from '../components/ClickHouseForm';
import FlatFileForm from '../components/FlatFileForm';

const HomePage = () => {
    const [selectedSource, setSelectedSource] = useState(null);

    const handleSourceSelect = (source) => {
        setSelectedSource(source);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Data Ingestion Tool</h1>
            <p>Select a data source to proceed:</p>
            <div>
                <button onClick={() => handleSourceSelect('clickhouse')}>ClickHouse</button>
                <button onClick={() => handleSourceSelect('flatfile')}>Flat File</button>
            </div>

            <div style={{ marginTop: '20px' }}>
                {selectedSource === 'clickhouse' && (
                    <>
                        <h2>ClickHouse Configuration</h2>
                        <ClickHouseForm />
                    </>
                )}
                {selectedSource === 'flatfile' && (
                    <>
                        <h2>Flat File Upload</h2>
                        <FlatFileForm />
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;