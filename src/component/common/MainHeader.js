import React from 'react';
import {Flex, Image, Input, InputGroup, InputRightElement, Button, Text, Link, Box} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import logo from '../../logo/headerLogo.png';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function MainHeader() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setUser(null);
        navigate('/');
    };

    return (
        <Box
            as="header"
            position="sticky"
            top="0"
            zIndex="1000"
            bg="white"
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
            width="100%"
        >

        <Flex justifyContent="space-between" alignItems="center" p={4} bg="white" boxShadow="sm">
            <Link as={RouterLink} to="/main">
                <Image src={logo} alt="JIWOO WISE HELPER" height="60px" cursor="pointer" />
            </Link>

            <InputGroup size="md" width="40%">
                <Input placeholder="검색어를 입력하세요." borderRadius="full" />
                <InputRightElement>
                    <Button size="sm" colorScheme="blue" borderRadius="full">
                        <SearchIcon />
                    </Button>
                </InputRightElement>
            </InputGroup>

            <Flex alignItems="center">
                <Link mx={3} fontWeight="bold" >전체메뉴보기</Link>
                <Text mx={2} fontWeight="bold" >|</Text>
                <Link as={RouterLink} to="/main" fontWeight="bold"  ml={3} >메인페이지</Link>
                {user ? (
                    <>
                        <Text fontWeight="bold" mx={2}  ml={5}>|</Text>
                        <Link as={RouterLink} to="/mypage" mx={3}>
                            <Text fontWeight="bold">마이페이지</Text>
                        </Link>
                        <Text fontWeight="bold" mx={2} >|</Text>
                        <Link onClick={handleLogout} ml={3}>
                            <Text fontWeight="bold">로그아웃</Text>
                        </Link>
                    </>
                ) : (
                    <>
                        <Text fontWeight="bold" mx={2}>|</Text>
                        <Link as={RouterLink} to="/login" mx={3}>
                            <Text fontWeight="bold">로그인</Text>
                        </Link>
                        <Text fontWeight="bold" mx={2}>|</Text>
                        <Link as={RouterLink} to="/join" mx={3}>
                            <Text fontWeight="bold">회원가입</Text>
                        </Link>
                    </>
                )}
            </Flex>
        </Flex>
        </Box>
    );
}

export default MainHeader;
