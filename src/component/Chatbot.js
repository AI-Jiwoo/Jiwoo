import React, { useState, useRef, useEffect } from 'react';
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
    const [isLoading, setIsLoading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 100 });
    const chatRef = useRef(null);
    const dragStartPosition = useRef({ x: 0, y: 0 });

    // Handle drag start
    const handleMouseDown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
            // Allow input and button interactions
            return;
        }
        setDragging(true);
        dragStartPosition.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        e.preventDefault();
    };

    // Handle drag move
    const handleMouseMove = (e) => {
        if (dragging) {
            const newX = e.clientX - dragStartPosition.current.x;
            const newY = e.clientY - dragStartPosition.current.y;
            setPosition({ x: newX, y: newY });
        }
    };

    // Handle drag end
    const handleMouseUp = () => {
        setDragging(false);
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging]);

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
            ref={chatRef}
            position="fixed"
            top={position.y}
            left={position.x}
            zIndex="1000"
            cursor={dragging ? 'grabbing' : 'pointer'}
            onMouseDown={handleMouseDown}
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
