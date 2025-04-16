import React from 'react';

const SourceSelector = ({ onSelect }) => (
    <div>
        <button onClick={() => onSelect('clickhouse')}>ClickHouse</button>
        <button onClick={() => onSelect('flatfile')}>Flat File</button>
    </div>
);

export default SourceSelector;