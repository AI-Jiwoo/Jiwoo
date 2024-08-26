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
        <HStack spacing={4}>
            <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" variant="outline">
                    {selectedResearch ? selectedResearch.title : "시장조사 선택"}
                </MenuButton>
                <MenuList>
                    {Array.isArray(researchHistory) && researchHistory.length > 0 ? (
                        researchHistory.map(research => (
                            <MenuItem key={research.id} onClick={() => selectResearch(research)}>
                                <HStack>
                                    <Text>{research.title}</Text>
                                </HStack>
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem isDisabled>시장조사 이력이 없습니다</MenuItem>
                    )}
                </MenuList>
            </Menu>
            <Tooltip label="선택한 시장조사의 핵심 인사이트 물어보기">
                <IconButton
                    icon={<FaLightbulb />}
                    onClick={() => quickAsk("이 시장조사의 핵심 인사이트는 무엇인가요?")}
                    isDisabled={!selectedResearch}
                    colorScheme="blue"
                    variant="outline"
                />
            </Tooltip>
            <Tooltip label="세무 처리를 시작합니다">
                <Button
                    leftIcon={<FaCalculator />}
                    colorScheme="green"
                    onClick={handleTaxationStart}
                >
                    세무 처리 시작
                </Button>
            </Tooltip>
        </HStack>
    </Flex>
);

export default Header;