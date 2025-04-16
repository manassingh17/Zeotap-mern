import React, { useState } from 'react';

const ClickHouseForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        host: '',
        port: '',
        database: '',
        user: '',
        token: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="host" placeholder="Host" onChange={handleChange} />
            <input name="port" placeholder="Port" onChange={handleChange} />
            <input name="database" placeholder="Database" onChange={handleChange} />
            <input name="user" placeholder="User" onChange={handleChange} />
            <input name="token" placeholder="JWT Token" onChange={handleChange} />
            <button type="submit">Connect</button>
        </form>
    );
};

export default ClickHouseForm;