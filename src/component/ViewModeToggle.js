import React, { useState, useEffect } from 'react';
import {
    Flex, Text, Switch, HStack, Checkbox, Divider
} from '@chakra-ui/react';

const ViewModeToggle = () => {
    const [viewModes, setViewModes] = useState({
        text: true,
        graph: false,
        image: false
    });
    const [allSelected, setAllSelected] = useState(false);

    useEffect(() => {
        const allModesSelected = Object.values(viewModes).every(mode => mode);
        setAllSelected(allModesSelected);
    }, [viewModes]);

    const handleToggle = (mode) => {
        setViewModes(prev => ({
            ...prev,
            [mode]: !prev[mode]
        }));
    };

    const handleAllToggle = () => {
        const newValue = !allSelected;
        setAllSelected(newValue);
        setViewModes({
            text: newValue,
            graph: newValue,
            image: newValue
        });
    };

    return (
        <Flex p={2} bg="gray.100" justify="center" align="center">
            <HStack spacing={6} align="center">
                <Checkbox
                    isChecked={allSelected}
                    onChange={handleAllToggle}
                >
                    <Text fontSize="sm" fontWeight="medium">전체 선택</Text>
                </Checkbox>
                <Divider orientation="vertical" height="20px" />
                {Object.entries(viewModes).map(([mode, isChecked]) => (
                    <HStack key={mode} spacing={2}>
                        <Text fontSize="sm" fontWeight={isChecked ? "bold" : "normal"}>
                            {mode === 'text' ? '텍스트' : mode === 'graph' ? '그래프' : '이미지'}
                        </Text>
                        <Switch
                            size="md"
                            isChecked={isChecked}
                            onChange={() => handleToggle(mode)}
                        />
                    </HStack>
                ))}
            </HStack>
        </Flex>
    );
};

export default ViewModeToggle;