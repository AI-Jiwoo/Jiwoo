import React from 'react';
import { Flex, Image, Text, Link, Box, HStack } from '@chakra-ui/react';
import logo from '../../logo/headerLogo.png';
import {Link as RouterLink, useLocation, useNavigate} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


function MainHeader({ scrollToMarketResearch }) {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setUser(null);
        navigate('/');
    };

    const handleMyPageClick = (e) => {
        e.preventDefault();
        navigate('/mypage');
    };

    const handleAcceleratingClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/main') {
            scrollToMarketResearch();
        } else {
            navigate('/main', { state: { scrollToMarketResearch: true } });
        }
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

                <HStack spacing={8}>
                    <Link as={RouterLink} to="/startup-guide" fontWeight="bold">창업가이드</Link>
                    <Link href="#" onClick={handleAcceleratingClick} fontWeight="bold">엑셀러레이팅</Link>
                    <Link as={RouterLink} to="/tax-handling" fontWeight="bold">세무처리</Link>
                </HStack>

                <Flex alignItems="center">
                    {user ? (
                        <>
                            <Link as={RouterLink} to="/mypage" mx={3} onClick={handleMyPageClick}>
                                <Text fontWeight="bold">마이페이지</Text>
                            </Link>
                            <Text fontWeight="bold" mx={2}>|</Text>
                            <Link onClick={handleLogout} ml={3}>
                                <Text fontWeight="bold">로그아웃</Text>
                            </Link>
                        </>
                    ) : (
                        <>
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