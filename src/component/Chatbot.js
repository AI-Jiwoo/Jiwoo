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
    Spinner, Avatar
} from '@chakra-ui/react';
import {ChatIcon, CloseIcon} from '@chakra-ui/icons';
import chatbotIcon from '../images/chatbot.png';
import axios from "axios";
import {aiApi} from "../apis/api";

    const Chatbot = () => {
        const { isOpen, onToggle, onClose } = useDisclosure();
        const [messages, setMessages] = useState([]);
        const [inputMessage, setInputMessage] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [dragging, setDragging] = useState(false);
        const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 80 });
        const chatRef = useRef(null);
        const dragStartPosition = useRef({ x: 0, y: 0 });

        const handleMouseDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
                return;
            }
            setDragging(true);
            dragStartPosition.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
            e.preventDefault();
        };

        const handleMouseMove = (e) => {
            if (dragging) {
                const newX = e.clientX - dragStartPosition.current.x;
                const newY = e.clientY - dragStartPosition.current.y;
                setPosition({ x: newX, y: newY });
            }
        };

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
                const response = await aiApi.post('/ai/chat', { message: inputMessage });
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

        const getChatWindowPosition = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const chatWidth = 600;  // 너비 증가
            const chatHeight = 700;  // 높이 증가

            let x = position.x;
            let y = position.y;

            if (x + chatWidth > windowWidth) {
                x = windowWidth - chatWidth;
            }

            if (y + chatHeight > windowHeight) {
                y = windowHeight - chatHeight;
            }

            return { x, y };
        };

        const chatPosition = getChatWindowPosition();

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
                    boxSize="70px"  // 아이콘 크기 증가
                    cursor="pointer"
                    onClick={onToggle}
                    display={isOpen ? 'none' : 'block'}
                />
                {isOpen && (
                    <Box
                        position="fixed"
                        top={chatPosition.y}
                        left={chatPosition.x}
                        bg="white"
                        boxShadow="2xl"
                        height="700px"  // 높이 증가
                        width="600px"  // 너비 증가
                        zIndex="1001"
                        borderRadius="lg"
                        overflow="hidden"
                    >
                        <Flex direction="column" height="100%">
                            <Flex justify="space-between" align="center" p={6} bg="blue.500" color="white">
                                <Flex align="center">
                                    <Avatar src={chatbotIcon} size="sm" mr={3} />
                                    <Text fontWeight="bold" fontSize="xl">지우 AI 챗봇</Text>
                                </Flex>
                                <IconButton
                                    icon={<CloseIcon />}
                                    onClick={onClose}
                                    variant="ghost"
                                    color="white"
                                    _hover={{ bg: 'blue.600' }}
                                    aria-label="Close chatbot"
                                />
                            </Flex>
                            <VStack flex={1} spacing={6} p={6} overflowY="auto" bg="gray.50">
                                {messages.map((msg, index) => (
                                    <Flex
                                        key={index}
                                        alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                                        maxWidth="70%"
                                    >
                                        {msg.sender === 'bot' && (
                                            <Avatar src={chatbotIcon} size="sm" mr={2} />
                                        )}
                                        <Box
                                            bg={msg.sender === 'user' ? 'blue.500' : 'white'}
                                            color={msg.sender === 'user' ? 'white' : 'black'}
                                            p={4}
                                            borderRadius="lg"
                                            boxShadow="md"
                                        >
                                            {msg.text}
                                        </Box>
                                    </Flex>
                                ))}
                                {isLoading && (
                                    <Spinner size="md" color="blue.500" />
                                )}
                            </VStack>
                            <Box p={6} bg="gray.100">
                                <Flex>
                                    <Input
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="메시지를 입력하세요..."
                                        size="lg"
                                        bg="white"
                                        mr={2}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        colorScheme="blue"
                                        size="lg"
                                        isLoading={isLoading}
                                        leftIcon={<ChatIcon />}
                                    >
                                        전송
                                    </Button>
                                </Flex>
                            </Box>
                        </Flex>
                    </Box>
                )}
            </Box>
        );
    };

export default Chatbot;