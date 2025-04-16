import React from 'react';

const StatusMessage = ({ message, type }) => {
    const getColor = () => {
        switch (type) {
            case 'success':
                return 'green';
            case 'error':
                return 'red';
            case 'info':
                return 'blue';
            default:
                return 'black';
        }
    };

    return <p style={{ color: getColor() }}>{message}</p>;
};

export default StatusMessage;