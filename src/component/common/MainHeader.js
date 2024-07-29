import React from 'react';
import { Flex, Image, Input, InputGroup, InputRightElement, Button, Text } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import logo from '../../logo/headerLogo.png';

function MainHeader() {
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

            <Text fontWeight="bold">로그인 · 회원가입</Text>
        </Flex>
    );
}

export default MainHeader;