// src/components/Chatbot.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Image,
    Slide,
    VStack,
    Input,
    Button,
    useDisclosure,
    IconButton,
    Flex,
    Text,
    Spinner
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import chatbotIcon from '../images/chatbot.png';
import axios from "axios";

const Chatbot = () => {
    const { isOpen, onToggle, onClose } = useDisclosure();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.pageYOffset);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleSendMessage = async () => {
        if (inputMessage.trim()) {
            const userMessage = { text: inputMessage, sender: 'user' };
            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');
            setIsLoading(true);

            try {
                const response = await axios.post('http://localhost:8000/chat', { message: inputMessage });
                const botMessage = { text: response.data.message, sender: 'bot' };
                setMessages(prev => [...prev, botMessage]);
            } catch (error) {
                console.error('Error sending message to chatbot:', error);
                const errorMessage = { text: '죄송합니다. 오류가 발생했습니다.', sender: 'bot' };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Box
            position="fixed"
            bottom={isOpen ? 0 : `${Math.max(20, 20 - scrollPosition)}px`}
            right={isOpen ? 0 : "20px"}
            zIndex="1000"
            transition="all 0.3s ease-out"
        >
            <Image
                src={chatbotIcon}
                alt="Chatbot"
                boxSize="60px"
                cursor="pointer"
                onClick={onToggle}
                display={isOpen ? 'none' : 'block'}
            />
            <Slide direction="right" in={isOpen} style={{ width: '500px' }}>
                <Box
                    bg="white"
                    boxShadow="xl"
                    height="100vh"
                    width="100%"
                >
                    <Flex direction="column" height="100%">
                        <Flex justify="space-between" align="center" p={4} borderBottom="1px solid" borderColor="gray.200">
                            <Text fontWeight="bold" fontSize="xl">지우</Text>
                            <IconButton
                                icon={<CloseIcon />}
                                onClick={onClose}
                                variant="ghost"
                                aria-label="Close chatbot"
                            />
                        </Flex>
                        <VStack flex={1} spacing={6} p={6} overflowY="auto">
                            {messages.map((msg, index) => (
                                <Box
                                    key={index}
                                    alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                                    bg={msg.sender === 'user' ? 'blue.100' : 'gray.100'}
                                    p={3}
                                    borderRadius="md"
                                    maxWidth="80%"
                                >
                                    {msg.text}
                                </Box>
                            ))}
                            {isLoading && (
                                <Spinner size="sm" color="blue.500" />
                            )}
                        </VStack>
                        <Box p={4} borderTop="1px solid" borderColor="gray.200">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="메시지를 입력하세요..."
                                size="lg"
                                mb={2}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <Button onClick={handleSendMessage} colorScheme="blue" width="100%" isLoading={isLoading}>
                                전송
                            </Button>
                        </Box>
                    </Flex>
                </Box>
            </Slide>
        </Box>
    );
};

export default Chatbot;