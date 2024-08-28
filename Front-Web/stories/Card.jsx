import React from 'react';

const Card = ({ title, content, imageUrl }) => (
    <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '300px'
    }}>
        {imageUrl && <img src={imageUrl} alt={title} style={{ width: '100%', borderRadius: '8px' }} />}
        <h2 style={{ marginTop: '16px' }}>{title}</h2>
        <p>{content}</p>
    </div>
);

export default Card;