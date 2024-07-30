import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Box, Flex, Input, Button, VStack, Checkbox, Text, Link, Heading, useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../apis/api';
import { saveToken, isLogin } from '../utils/TokenUtils';
import {jwtDecode} from 'jwt-decode';
import axios from "axios";

const successToast = {
    title: "로그인 성공",
    status: "success",
    duration: 3000,
    isClosable: true,
    position: "top",
};

const errorToast = {
    title: "로그인 실패",
    status: "error",
    duration: 3000,
    isClosable: true,
    position: "top",
};

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { setUser } = useAuth();

    const isValidToken = (token) => {
        return token && typeof token === 'string' && token.split('.').length === 3;
    };

    useEffect(() => {
        console.log('LoginPage rendered with:', { email, password, rememberMe, isLoading });
    }, [email, password, rememberMe, isLoading]);

    useEffect(() => {
        if (isLoading) {
            const performLogin = async () => {
                try {
                    console.log('Attempting login...');
                    const response = await axios.post('http://localhost:8000/login', { email, password });
                    console.log('Login response:', response);

                    if (response.status === 200) {
                        console.log('Full response:', response);

                        let token = response.headers['authorization'];

                        if (token && token.startsWith('Bearer ')) {
                            token = token.slice(7); // 'Bearer ' 제거
                        } else {
                            throw new Error('Token not found in server response');
                        }

                        console.log('Extracted token:', token);

                        if (isValidToken(token)) {
                            // access 토큰과 refresh 토큰을 같은 값으로 설정
                            saveToken({ 'access-token': token, 'refresh-token': token });

                            try {
                                const decodedToken = jwtDecode(token);
                                console.log('Decoded token:', decodedToken);

                                // userrole 헤더에서 역할 정보 추출
                                const role = response.headers['userrole'] || decodedToken.role || 'USER';

                                setUser({ email: decodedToken.sub || email, role: role });

                                console.log('Login successful, navigating to home page');
                                toast(successToast);
                                navigate('/');
                            } catch (decodeError) {
                                console.error('Token decoding error:', decodeError);
                                throw new Error('Login failed: Invalid token structure');
                            }
                        } else {
                            throw new Error('Invalid token format received from server');
                        }
                    } else {
                        throw new Error('Login failed: Unexpected response status');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    let errorMessage = "로그인 중 오류가 발생했습니다.";

                    if (error.response) {
                        console.log('Error response:', error.response);
                        errorMessage = error.response.data?.message || error.response.data || "서버 오류가 발생했습니다.";
                    } else if (error.request) {
                        console.log('Error request:', error.request);
                        errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
                    } else {
                        console.log('Error message:', error.message);
                        errorMessage = error.message;
                    }

                    toast({ ...errorToast, description: errorMessage });
                } finally {
                    setIsLoading(false);
                }
            };
            performLogin();
        }
    }, [isLoading, email, password, setUser, navigate, toast]);

    const handleLogin = useCallback((e) => {
        e.preventDefault();
        setIsLoading(true);
    }, []);

    const handleRememberMe = useCallback((e) => {
        setRememberMe(e.target.checked);
        if (e.target.checked) {
            localStorage.setItem('savedEmail', email);
        } else {
            localStorage.removeItem('savedEmail');
        }
    }, [email]);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const loginButton = useMemo(() => (
        <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            height="60px"
            fontSize="md"
            mt={4}
            isLoading={isLoading}
        >
            로그인
        </Button>
    ), [isLoading]);

    return (
        <Flex justify="center" align="center" minHeight="calc(100vh - 120px)" bg="gray.50">
            <Box width="600px" p={10} bg="white" borderRadius="lg" boxShadow="xl">
                <form onSubmit={handleLogin}>
                    <VStack spacing={6} align="stretch">
                        <Heading as="h2" size="xl" textAlign="center" mb={6}>로그인</Heading>

                        <Input
                            placeholder="이메일을 입력해주세요"
                            size="lg"
                            height="60px"
                            fontSize="md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="비밀번호를 입력해주세요"
                            size="lg"
                            height="60px"
                            fontSize="md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Flex justify="space-between" align="center" fontSize="sm" mt={2}>
                            <Checkbox
                                isChecked={rememberMe}
                                onChange={handleRememberMe}
                            >
                                아이디 저장
                            </Checkbox>
                            <Flex>
                                <Link>아이디 찾기</Link>
                                <Text mx={2} color="gray.300">|</Text>
                                <Link>비밀번호 찾기</Link>
                            </Flex>
                        </Flex>

                        {loginButton}

                        <Button
                            variant="outline"
                            size="lg"
                            height="60px"
                            fontSize="md"
                            onClick={() => navigate('/join')}
                        >
                            회원가입
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    );
}

export default React.memo(LoginPage);
