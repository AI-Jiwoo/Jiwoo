import React from 'react';
import Card from './Card';

export default {
    title: 'Components/Card',
    component: Card,
};

export const BasicCard = () => (
    <Card
        title="Basic Card"
        content="This is a basic card with just title and content."
    />
);

export const CardWithImage = () => (
    <Card
        title="Card with Image"
        content="This card includes an image."
        imageUrl="https://via.placeholder.com/300x200"
    />
);

export const LongContentCard = () => (
    <Card
        title="Long Content"
        content="This card has a longer content to demonstrate how the card handles more text. It might wrap to multiple lines depending on the width of the card."
    />
);