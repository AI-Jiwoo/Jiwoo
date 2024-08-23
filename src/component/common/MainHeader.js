import React from 'react';
import { Flex, Image, Text, Link, Box, HStack } from '@chakra-ui/react';
import logo from '../../logo/headerLogo.png';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function MainHeader({ scrollToMarketResearch, scrollToBusinessModel, scrollToAccounting, scrollToMain }) {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setUser(null);
        navigate('/');
    };

    const handleMainPageClick = (e) => {
        e.preventDefault();
        navigate('/main');
    };

    const handleMyPageClick = (e) => {
        e.preventDefault();
        navigate('/mypage');
    };

    const handleMainClick = (e) => {
        e.preventDefault();
        if (scrollToMain) {
            scrollToMain();
        }else  {
            navigate('')
        }
    }

    const handleMarketResearchClick = (e) => {
        e.preventDefault();
        if (scrollToMarketResearch) {
            scrollToMarketResearch();
        } else {
           navigate('/main/market-research');
        }
    };


    const handleBusinessModelClick = (e) => {
        e.preventDefault();
        if (scrollToBusinessModel) {
            scrollToBusinessModel();
        } else {
           navigate('/main/business-model');
        }
    };

    const handelAccountingClick = (e) => {
        e.preventDefault();
        if (scrollToAccounting) {
            scrollToAccounting();
        }else {
            navigate('/main/accounting')
        }
    };


    return (
            <Box
                as="header"
                position="sticky"
                top="0"
                zIndex="1000"
                bg="black"
                color="white"
                boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                width="100%"
                _hover={{
                    bg: 'white',
                    color: 'black',
                    '& a, & p': { color: 'black' }
                }}
                transition="all 0.3s"
            >
                <Flex justifyContent="space-between" alignItems="center" p={4}>
                    <Link as={RouterLink} to="/">
                        <Image src={logo} alt="JIWOO WISE HELPER" height="60px" cursor="pointer" />
                    </Link>

                    <HStack spacing={8}>

                        <Link
                            href="#"
                            onClick={handleMainClick}
                            fontWeight="bold"
                            p={2}
                            borderRadius="md"
                        >
                            홈
                        </Link>

                        <Link
                            href="#"
                            onClick={handleMarketResearchClick}
                            fontWeight="bold"
                            p={2}
                            borderRadius="md"
                        >
                            시장조사
                        </Link>
                        <Link
                            href="#"
                            onClick={handleBusinessModelClick}
                            fontWeight="bold"
                            p={2}
                            borderRadius="md"
                        >
                            비즈니스모델
                        </Link>
                        <Link
                            href='#'
                            onClick={handelAccountingClick}
                            fontWeight="bold"
                            p={2}
                            borderRadius="md"
                        >
                            세무처리
                        </Link>
                    </HStack>

                    <Flex alignItems="center">
                        {user ? (
                            <>
                                <Link as={RouterLink} to="/main" mx={3} onClick={handleMainPageClick}>
                                    <Text fontWeight="bold">메인페이지</Text>
                                </Link>
                                <Text fontWeight="bold" mx={2}>|</Text>
                                <Link as={RouterLink} to="/mypage" mx={3} onClick={handleMyPageClick}>
                                    <Text fontWeight="bold">마이페이지</Text>
                                </Link>
                                <Text fontWeight="bold" mx={2}>|</Text>
                                <Link onClick={handleLogout} ml={3}>
                                    <Text fontWeight="bold" >로그아웃</Text>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link as={RouterLink} to="/login" mx={3}>
                                    <Text fontWeight="bold">로그인</Text>
                                </Link>
                                <Text fontWeight="bold" mx={2}>|</Text>
                                <Link as={RouterLink} to="/join" mx={3}>
                                    <Text fontWeight="bold" >회원가입</Text>
                                </Link>
                            </>
                        )}
                    </Flex>
                </Flex>
            </Box>
        );
    }

    export default MainHeader;
