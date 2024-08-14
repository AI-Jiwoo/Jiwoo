import React, { useState, useRef } from 'react';
import {
    Box, VStack, HStack, Text, Button, Input, Card, CardBody, CardHeader,
    Alert, AlertIcon, Icon, Heading, useDisclosure, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalBody, ModalCloseButton, Progress,
    SimpleGrid
} from '@chakra-ui/react';
import { FaUpload, FaFileInvoiceDollar, FaInfoCircle } from "react-icons/fa";

const Accounting = () => {
    const [transactions, setTransactions] = useState([]);
    const [taxDocument, setTaxDocument] = useState(null);
    const [conversionResult, setConversionResult] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const transactionInputRef = useRef(null);

    const handleTransactionUpload = (event) => {
        setTransactions([...transactions, ...event.target.files]);
    };

    const handleTaxDocumentUpload = (event) => {
        setTaxDocument(event.target.files[0]);
    };

    const handleConversion = () => {
        // 여기에 변환 로직 구현
        setConversionResult("변환된 파일 내용");
        setAnalysisResult("분석 결과 내용");
    };

    return (
        <Box width="70%" margin="auto" pt={24} pb={12} minHeight="1000px">
            <Heading as="h1" size="2xl" mb={8}>세무 관리📊</Heading>

            <SimpleGrid columns={2} spacing={8}>
                <Card>
                    <CardHeader>
                        <HStack>
                            <Icon as={FaFileInvoiceDollar} />
                            <Heading size="md">거래내역 업로드</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <Input
                            type="file"
                            multiple
                            onChange={handleTransactionUpload}
                            display="none"
                            ref={transactionInputRef}
                        />
                        <Button leftIcon={<FaUpload />} onClick={() => transactionInputRef.current.click()}>
                            거래내역 선택 (다중 선택 가능)
                        </Button>
                        <Text mt={2}>업로드된 거래내역: {transactions.length}개</Text>
                        <Text mt={2} fontSize="sm" color="gray.500">
                            은행/카드사에서 거래내역을 다운로드해주세요.
                        </Text>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <HStack>
                            <Icon as={FaFileInvoiceDollar} />
                            <Heading size="md">소득공제/세액공제 파일 업로드</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <Input type="file" onChange={handleTaxDocumentUpload} />
                        {taxDocument && <Text mt={2}>파일명: {taxDocument.name}</Text>}
                        <Alert status="info" mt={4}>
                            <AlertIcon />
                            소득공제/세액공제 파일 유무에 따라 분석 결과가 달라질 수 있습니다.
                        </Alert>
                        <Button rightIcon={<FaInfoCircle />} onClick={onOpen} mt={4} variant="outline">
                            홈택스에서 파일 다운로드 방법
                        </Button>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Button
                colorScheme="blue"
                onClick={handleConversion}
                isDisabled={transactions.length === 0}
                mt={8}
                width="100%"
            >
                변환 및 분석
            </Button>

            {conversionResult && (
                <Card mt={8}>
                    <CardHeader>
                        <Heading size="md">변환 결과</Heading>
                    </CardHeader>
                    <CardBody>
                        <Text>{conversionResult}</Text>
                    </CardBody>
                </Card>
            )}

            {analysisResult && (
                <Card mt={8}>
                    <CardHeader>
                        <Heading size="md">분석 결과</Heading>
                    </CardHeader>
                    <CardBody>
                        <Text>{analysisResult}</Text>
                    </CardBody>
                </Card>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>홈택스에서 파일 다운로드 방법</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>1. 홈택스 로그인</Text>
                        <Text>2. 조회/발급 메뉴 선택</Text>
                        <Text>3. 소득공제 자료 조회</Text>
                        {/* 추가 설명 또는 이미지 */}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Accounting;