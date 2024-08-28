import React from 'react';
import {
    Box, VStack, Text, Heading, Icon, Image, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    useToast, Button
} from '@chakra-ui/react';
import { FaRobot, FaCalendarAlt } from "react-icons/fa";
import AccountImage from '../images/Account.png';

const Accounting = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box width="100%" minHeight="100vh" bg="gray.50" pt={24} pb={12}>
            <VStack spacing={8} align="center" maxWidth="800px" margin="auto">
                <Image
                    src={AccountImage}  // 이미지 파일을 사용
                    alt="Accounting Service Coming Soon"
                    borderRadius="lg"
                    fallbackSrc="https://via.placeholder.com/400x300?text=Accounting+Service"
                />

                <Heading as="h1" size="2xl" textAlign="center" color="blue.600">
                    세무 관리 서비스 준비 중
                </Heading>

                <Text fontSize="xl" textAlign="center" color="gray.600">
                    더 나은 서비스를 제공하기 위해 현재 세무 관리 기능을 준비 중입니다.
                    빠른 시일 내에 여러분을 만나뵙겠습니다!
                </Text>

                <VStack spacing={4} bg="white" p={8} borderRadius="lg" boxShadow="md" width="100%">
                    <Icon as={FaRobot} boxSize={12} color="blue.500" />
                    <Heading as="h2" size="lg" textAlign="center" color="blue.600">
                        지우 AI 챗봇 사용해보세요
                    </Heading>
                    <Text textAlign="center" color="gray.600">
                        서비스 출시 전이지만, 우리의 AI 챗봇이 세무 관련 질문에 답변해 드릴 수 있습니다.<br/>
                        오른쪽 하단의 챗봇 아이콘을 클릭하여 질문을 시작해보세요.
                    </Text>
                </VStack>

                <VStack spacing={4} align="center" mt={8}>
                    <Icon as={FaCalendarAlt} boxSize={8} color="green.500" />
                    <Button onClick={onOpen} variant="outline" colorScheme="green">
                        출시 알림 받기
                    </Button>
                </VStack>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>출시 알림 신청</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Text>여기에 출시 알림 신청 폼을 구현하세요.</Text>
                        {/* 출시 알림 신청 폼 컴포넌트를 추가하세요 */}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Accounting;
