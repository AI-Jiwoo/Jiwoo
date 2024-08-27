import React from 'react';
import { Flex, HStack, Text, Badge, Button, IconButton, Tooltip, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FaLightbulb, FaCalculator } from "react-icons/fa";

const Header = ({ selectedResearch, researchHistory, selectResearch, quickAsk, handleTaxationStart }) => (
    <Flex align="center" justify="space-between" p={4} bg="white" borderBottomWidth={1} boxShadow="sm">
        <HStack>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">Jiwoo AI</Text>
            <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="full">창업지원센터</Badge>
        </HStack>
            <Tooltip label="세무 처리를 시작합니다">
                <Button
                    leftIcon={<FaCalculator />}
                    colorScheme="green"
                    onClick={handleTaxationStart}
                >
                    세무 처리 시작
                </Button>
            </Tooltip>
    </Flex>
);

export default Header;