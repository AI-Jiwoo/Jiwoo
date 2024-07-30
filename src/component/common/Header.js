import React from 'react';
import logo from '../../logo/headerLogo.png';
import { Box, Flex, Image, Text, Link } from '@chakra-ui/react';
import {Link as RouterLink, useLocation, useNavigate} from 'react-router-dom';
import MainHeader from "./MainHeader";
import {useAuth} from "../../AuthContext";

function Header() {

    const location = useLocation();
    const navigate = useNavigate();
    const {user, logout } = useAuth();

    if (location.pathname === "/") {
        return <MainHeader />;
    }

    const handleLogout = () => {
        logout();
        navigate('/')
    }


    return (
        <Box as="header" borderBottom="1px solid" borderColor="gray.200" py={2}>
            <Flex align="center" maxWidth="100%" px={4}>
                <Flex align="center" className="css-uljr60">
                    <Image src={logo} alt="JIWOO WISE HELPER" height="60px" />
                </Flex>
                <Flex as="nav" alignItems="center" height="60px" ml={8}>
                    <Link mx={3} fontWeight="semibold">창업가이드</Link>
                    <Link mx={3} fontWeight="semibold">엑셀러레이팅</Link>
                    <Link mx={3} fontWeight="semibold">세무처리</Link>
                    <Link mx={3} fontWeight="semibold">정보제공</Link>
                </Flex>
                <Flex alignItems="center" height="60px" ml="1000px">
                    <Link>전체메뉴보기</Link>
                    <Text mx={2} color="gray.300">|</Text>
                    <Link as={RouterLink} to="/">메인페이지</Link>
                    {user ? (
                        <>
                            <Text mx={2} color="gray.300">|</Text>
                            <Link as={RouterLink} to="/mypage">마이페이지</Link>
                            <Text mx={2} color="gray.300">|</Text>
                            <Link onClick={handleLogout}>로그아웃</Link>
                        </>
                    ) : (
                        <>

                            <Text mx={2} color="gray.300">|</Text>
                            <Link as={RouterLink} to="/login">로그인</Link>
                            <Text mx={2} color="gray.300">|</Text>
                            <Link as={RouterLink} to="/join">회원가입</Link>


                        </>


                        )}

                </Flex>
            </Flex>

        </Box>
    );
}

export default Header;