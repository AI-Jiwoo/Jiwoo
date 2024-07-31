import React from 'react';
import {Flex, Image, Input, InputGroup, InputRightElement, Button, Text, Link} from '@chakra-ui/react';
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
        <Flex justifyContent="space-between" alignItems="center" p={4} bg="white" boxShadow="sm">
            <Image src={logo} alt="JIWOO WISE HELPER" height="60px" />

            <InputGroup size="md" width="40%">
                <Input placeholder="검색어를 입력하세요." borderRadius="full" />
                <InputRightElement>
                    <Button size="sm" colorScheme="blue" borderRadius="full">
                        <SearchIcon />
                    </Button>
                </InputRightElement>
            </InputGroup>

            <Flex>
                {user ? (
                    <>
                        <Link as={RouterLink} to="/mypage" mr={3}>
                            <Text fontWeight="bold">마이페이지</Text>
                        </Link>
                        <Text fontWeight="bold" mx={1}>|</Text>
                        <Link onClick={handleLogout} ml={3}>
                            <Text fontWeight="bold">로그아웃</Text>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link as={RouterLink} to="/login" mr={3}>
                            <Text fontWeight="bold">로그인</Text>
                        </Link>
                        <Text fontWeight="bold" mx={1}>|</Text>
                        <Link as={RouterLink} to="/join" ml={3}>
                            <Text fontWeight="bold">회원가입</Text>
                        </Link>
                    </>
                )}
            </Flex>
        </Flex>
    );
}

export default MainHeader;