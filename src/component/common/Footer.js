import React from 'react';
import { Box, Flex, Text, Link } from '@chakra-ui/react';

const Footer = () => {
    return (
        <Box bg="blue.800" color="white" p={8}>
            <Flex justify="space-between" align="center" wrap="wrap">
                <Box>
                    <Text fontSize="lg" fontWeight="bold">JIWOO</Text><br/>
                    <Text>어디어디시 어디구 태초마을로 635-11 | 대표이사 임원재 | 사업자등록번호123-12-1234 |</Text>
                    <Text>통신판매업신고번호 제 2012-어디어디-00333호 | JIWOO 서비스 문의 <Link href="mailto:help@JIWOO.co.kr" color="teal.200">help@JIWOO.co.kr</Link></Text>
                </Box>
                <Flex mr="200px">
                    <Box mr="200px">
                        <Text mb={2}><Link href="#" color="white">HOME</Link></Text>
                        <Text mb={2}><Link href="#" color="white">Market Research</Link></Text>
                        <Text mb={2}><Link href="#" color="white">Policy Search</Link></Text>
                        <Text mb={2}><Link href="#" color="white">Investment Capital Analysis</Link></Text>
                        <Text mb={2}><Link href="#" color="white">Similar Service Analysis</Link></Text>
                    </Box>
                    <Box>
                        <Text mb={2}><Link href="#" color="white">이용약관</Link></Text>
                        <Text mb={2}><Link href="#" color="white">개인정보보호</Link></Text>
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
};

export default Footer;
