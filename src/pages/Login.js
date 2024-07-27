import React from 'react';
import {
    Box,
    Flex,
    Input,
    Button,
    VStack,
    Checkbox,
    Text,
    Link,
    Heading,
} from '@chakra-ui/react';

function LoginPage() {
    return (
        <Flex justify="center" align="center" minHeight="calc(100vh - 120px)" bg="gray.50">
            <Box width="600px" p={10} bg="white" borderRadius="lg" boxShadow="xl">
                <VStack spacing={6} align="stretch">
                    <Heading as="h2" size="xl" textAlign="center" mb={6}>로그인</Heading>

                    <Input placeholder="아이디를 입력해주세요" size="lg" height="60px" fontSize="md" />
                    <Input type="password" placeholder="비밀번호를 입력해주세요" size="lg" height="60px" fontSize="md" />

                    <Flex justify="space-between" align="center" fontSize="sm" mt={2}>
                        <Checkbox>아이디 저장</Checkbox>
                        <Flex>
                            <Link>아이디 찾기</Link>
                            <Text mx={2} color="gray.300">|</Text>
                            <Link>비밀번호 찾기</Link>
                        </Flex>
                    </Flex>

                    <Button colorScheme="blue" size="lg" height="60px" fontSize="md" mt={4}>로그인</Button>

                    <Button variant="outline" size="lg" height="60px" fontSize="md">회원가입</Button>
                </VStack>
            </Box>
        </Flex>
    );
}

export default LoginPage;