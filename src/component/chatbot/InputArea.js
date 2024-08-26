import React from 'react';
import { Box, Flex, Input, IconButton, Button } from '@chakra-ui/react';
import { ChevronRightIcon, AddIcon, AttachmentIcon } from '@chakra-ui/icons';
import { FaCalculator } from "react-icons/fa";

const InputArea = ({ inputMessage, handleInputChange, handleKeyPress, sendMessage, isLoading, handleTaxationStart, handleFileUpload, handleIncomeTaxProofUpload }) => (
    <Box p={6} bg="white" borderTopWidth={1} borderColor="gray.200">
        <Flex
            maxWidth="1300px"
            position="relative"
            alignItems="center"
            boxShadow="0 0 10px rgba(0,0,0,0.1)"
            borderRadius="full"
            overflow="hidden"
            mr="400px"
        >
            <IconButton
                icon={<AddIcon />}
                size="md"
                colorScheme="blue"
                variant="ghost"
                aria-label="Attach transaction files"
                onClick={() => document.getElementById('transaction-files-upload').click()}
                ml={2}
            />
            <IconButton
                icon={<AttachmentIcon />}
                size="md"
                colorScheme="green"
                variant="ghost"
                aria-label="Attach income tax proof"
                onClick={() => document.getElementById('income-tax-proof-upload').click()}
                ml={2}
            />
            <Input
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="질문을 입력하세요..."
                size="lg"
                height="60px"
                fontSize="xl"
                border="none"
                _focus={{ boxShadow: "none" }}
                pl="60px"
                pr="120px"
            />
            <IconButton
                icon={<ChevronRightIcon />}
                size="md"
                colorScheme="blue"
                aria-label="Send message"
                onClick={() => sendMessage()}
                isLoading={isLoading}
                position="absolute"
                right="60px"
            />
            <Button
                leftIcon={<FaCalculator />}
                colorScheme="green"
                onClick={handleTaxationStart}
                position="absolute"
                right="2px"
                size="sm"
            >
                세무처리
            </Button>
            <input
                id="transaction-files-upload"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileUpload}
            />
            <input
                id="income-tax-proof-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleIncomeTaxProofUpload}
            />
        </Flex>
    </Box>
);

export default InputArea;