import React from 'react';
import { Flex, Text, SimpleGrid, Image } from '@chakra-ui/react';

const ImageGallery = ({ imageResults }) => (
    <Flex flex={1} direction="column" p={4} borderLeft="1px" borderColor="gray.200" overflowY="auto">
        <Text fontSize="xl" fontWeight="bold" mb={4}>관련 이미지</Text>
        <SimpleGrid columns={2} spacing={4}>
            {imageResults.map((imageUrl, index) => (
                <Image key={index} src={imageUrl} alt={`Related image ${index + 1}`} borderRadius="md" />
            ))}
        </SimpleGrid>
    </Flex>
);

export default ImageGallery;