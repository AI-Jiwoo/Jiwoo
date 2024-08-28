import React from 'react';
import { Box, Flex, Textarea, IconButton, Button, Text } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FaFileExcel, FaFilePdf, FaPaperPlane } from "react-icons/fa";

const InputArea = ({ inputMessage, handleInputChange, handleKeyPress, sendMessage, isLoading, handleTaxationStart, handleFileUpload }) => (
    <Box p={6} bg="white" borderTopWidth={1} borderColor="gray.200" mr="800px">
        <Flex
            maxWidth="4300px"
            mx="auto"
            direction="column"
            bg="gray.50"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="lg"
        >
            <Flex position="relative" alignItems="center">
                <Textarea
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="질문을 입력하세요..."
                    size="lg"
                    fontSize="xl"
                    border="none"
                    _focus={{ boxShadow: "none" }}
                    pl={4}
                    pr="80px"
                    rows={3}
                    resize="none"
                    bg="white"
                />
                <IconButton
                    icon={<FaPaperPlane />}
                    size="md"
                    colorScheme="blue"
                    aria-label="Send message"
                    onClick={sendMessage}
                    isLoading={isLoading}
                    position="absolute"
                    right="20px"
                    top="50%"
                    transform="translateY(-50%)"
                    borderRadius="full"
                />
            </Flex>
            <Flex p={4} bg="gray.100" justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color="gray.600">파일 첨부:</Text>
                <Flex>
                    <input
                        type="file"
                        id="transaction-file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'transaction')}
                        accept=".xlsx,.xls"
                    />
                    <label htmlFor="transaction-file">
                        <Button as="span" size="sm" mr={2} leftIcon={<FaFileExcel />} colorScheme="green" variant="outline">
                            거래내역
                        </Button>
                    </label>
                    <input
                        type="file"
                        id="income-tax-proof-file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'incomeTaxProof')}
                        accept=".pdf"
                    />
                    <label htmlFor="income-tax-proof-file">
                        <Button as="span" size="sm" leftIcon={<FaFilePdf />} colorScheme="red" variant="outline">
                            소득금액증명원
                        </Button>
                    </label>
                </Flex>
            </Flex>
        </Flex>
    </Box>
);

export default InputArea;