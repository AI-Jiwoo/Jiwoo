import React from 'react';
import { Box, Flex, Text, Link, VStack, HStack } from '@chakra-ui/react';

const Footer = () => {
    return (
        <Box bg="blue.800" color="white" py={8} px={4}>
            <Flex justify="space-between" maxWidth="1200px" margin="0 auto" flexWrap="wrap">
                <VStack align="flex-start" mb={4}>
                    <Text fontSize="lg" fontWeight="bold">JIWOO</Text>
                    <Text fontSize="sm">어디어디시 어디구 태초마을로 635-11 | 대표이사 이기연 | 사업자등록번호123-12-1234 |</Text>
                    <Text fontSize="sm">통신판매업신고번호 제 2012-어디어디-00333호 | JIWOO 서비스 문의 <Link href="mailto:help@JIWOO.co.kr" color="teal.200">help@JIWOO.co.kr</Link></Text>
                </VStack>
                <HStack spacing={8} alignItems="flex-start">
                    <VStack align="flex-start">
                        <Link href="#">HOME</Link>
                        <Link href="#">Market Research</Link>
                        <Link href="#">Policy Search</Link>
                        <Link href="#">Investment Capital Analysis</Link>
                        <Link href="#">Similar Service Analysis</Link>
                    </VStack>
                    <VStack align="flex-start">
                        <Link href="#">이용약관</Link>
                        <Link href="#">개인정보보호</Link>
                    </VStack>
                </HStack>
            </Flex>
        </Box>
    );
};

export default Footer;