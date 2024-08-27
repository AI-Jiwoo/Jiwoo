import React from 'react';
import { Box, HStack, VStack, Avatar, Text, Button, Heading, UnorderedList, ListItem, Accordion, AccordionItem, AccordionButton, AccordionPanel } from '@chakra-ui/react';
import { FaRobot, FaShareAlt } from "react-icons/fa";
import { CopyIcon, DownloadIcon } from '@chakra-ui/icons';

const ChatMessage = ({ message, handleShare, handleCopy, handleDownload, handleQuestionSelect, handleBusinessSelect }) => {
    const isUserMessage = message.sender === 'user';
    const categories = message.parsedResponse || [];

    if (isUserMessage) {
        return (
            <HStack alignItems="flex-start" mb={4}>
                <Avatar size="sm" name="User" bg="blue.500" />
                <Text fontWeight="bold" fontSize="lg">{message.text}</Text>
            </HStack>
        );
    }

    return (
        <Box mb={8} p={4} borderRadius="lg" bg="white" boxShadow="sm">
            <HStack mb={4} alignItems="flex-start">
                <Avatar size="sm" icon={<FaRobot />} bg="blue.500" />
                <VStack align="start" flex={1} spacing={4}>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">Jiwoo</Text>
                    <Text fontSize="xl" color="gray.700">{message.text}</Text>
                </VStack>
            </HStack>

            {message.businessCards && (
                <VStack spacing={4} align="stretch" mt={6}>
                    <Heading size="md" mb={2}>사업 선택:</Heading>
                    {message.businessCards.map((business) => (
                        <Button
                            key={business.id}
                            onClick={() => handleBusinessSelect(business.id, business.businessName, business.businessContent)}
                            colorScheme="blue"
                            variant="outline"
                        >
                            {business.businessName}
                        </Button>
                    ))}
                </VStack>
            )}

            {message.text && !message.businessCards && (
                <>
                    {categories.map((category, idx) => (
                        <Box key={idx} mb={6}>
                            <Heading size="md" mb={2}>{category.title}</Heading>
                            <Text fontWeight="bold">- 예시:</Text>
                            <UnorderedList mb={2}>
                                {category.examples.map((example, index) => (
                                    <ListItem key={index}>{example}</ListItem>
                                ))}
                            </UnorderedList>
                            <Text><strong>- 출처:</strong> {category.source}</Text>
                            <Text><strong>- 날짜:</strong> {category.date}</Text>
                        </Box>
                    ))}

                    <HStack spacing={2} mb={4}>
                        <Button leftIcon={<FaShareAlt />} onClick={() => handleShare(message.text)} colorScheme="blue" variant="outline">공유</Button>
                        <Button leftIcon={<CopyIcon />} onClick={() => handleCopy(message.text)} colorScheme="blue" variant="outline">복사</Button>
                        <Button leftIcon={<DownloadIcon />} onClick={() => handleDownload(message.text)} colorScheme="blue" variant="outline">PDF 저장</Button>
                    </HStack>

                    <VStack spacing={4} align="stretch" mt={6}>
                        <Heading size="md" mb={2}>다음 질문 예시:</Heading>
                        {categories.map((category, idx) => (
                            <Button key={idx} onClick={() => handleQuestionSelect(`${category.title}에 대해 자세히 알려주세요.`)} colorScheme="blue" variant="outline">
                                {category.title}에 대해 자세히 알려주세요.
                            </Button>
                        ))}
                    </VStack>

                    <Accordion defaultIndex={[0]} allowMultiple mt={6}>
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontSize="xl" fontWeight="bold" color="blue.600">
                                        관련 정보
                                    </Box>
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                {message.web_results && message.web_results.length > 0 ? (
                                    message.web_results.map((result, idx) => (
                                        <Box key={idx} mb={4}>
                                            <Heading size="md" color="blue.600">{result.title}</Heading>
                                            <Text fontSize="lg" color="gray.600" mt={2}>{result.snippet}</Text>
                                            <Text color="blue.400" fontSize="lg" as="a" href={result.url} target="_blank" rel="noopener noreferrer">
                                                더 읽기
                                            </Text>
                                        </Box>
                                    ))
                                ) : (
                                    <Text fontSize="lg" color="gray.500">관련 정보가 없습니다.</Text>
                                )}
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                </>
            )}
        </Box>
    );
};

export default ChatMessage;