import React from 'react';
import { Box, VStack, Text, Button } from '@chakra-ui/react';

const BusinessSelectionCard = ({ businesses, onSelect }) => (
    <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">사업을 선택해주세요:</Text>
        {businesses.map((business) => (
            <Button
                key={business.id}
                onClick={() => onSelect(business.id)}
                variant="outline"
            >
                {business.businessName}
            </Button>
        ))}
    </VStack>
);

export default BusinessSelectionCard;