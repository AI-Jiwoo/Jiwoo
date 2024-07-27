import React, {useEffect, useState} from 'react';
import {
    Box,
    VStack,
    Heading,
    Text,
    Flex,
    Textarea,
    Button,
    Checkbox,
    Container,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
    Input,
    FormControl,
    FormLabel,
    InputGroup,
    InputRightElement,
} from '@chakra-ui/react';
import termsText from '../component/TextTerms';
import privacyText from '../component/PrivacyText';
import BusinessInfoForm from '../component/BusinessInfoForm';
import Confetti from 'react-confetti';
import {useNavigate} from "react-router-dom";

const steps = [
    { title: '약관동의', description: '01' },
    { title: '회원정보', description: '02' },
    { title: '정보입력', description: '03' },
    { title: '가입완료', description: '04' },
];

function Join() {
    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [businessInfo, setBusinessInfo] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        if (activeStep === steps.length - 1) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000); // 5초 후 폭죽 효과 제거
            return () => clearTimeout(timer);
        }
    }, [activeStep]);


    const handleNextStep = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBusinessInfoSubmit = (info) => {
        setBusinessInfo(info);
        handleNextStep();
    };

    const handleLogin = () => {
        navigate('/login'); // 로그인 페이지로 이동
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <>
                        <Flex align="center">
                            <Checkbox
                                isChecked={termsAgreed}
                                onChange={(e) => setTermsAgreed(e.target.checked)}
                                mr={4}
                            />
                            <Heading as="h3" size="md">홈페이지 이용약관 동의 (필수)</Heading>
                        </Flex>
                        <Textarea
                            height="200px"
                            readOnly
                            value={termsText}
                            overflowY="scroll"
                            whiteSpace="pre-line"
                        />

                        <Flex align="center" mt={4}>
                            <Checkbox
                                isChecked={privacyAgreed}
                                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                                mr={4}
                            />
                            <Heading as="h3" size="md">개인정보 이용약관 동의 (필수)</Heading>
                        </Flex>
                        <Textarea
                            height="200px"
                            readOnly
                            value={privacyText}
                            overflowY="scroll"
                            whiteSpace="pre-line"
                        />

                        <Button
                            colorScheme="teal"
                            size="lg"
                            isDisabled={!termsAgreed || !privacyAgreed}
                            onClick={handleNextStep}
                            mt={4}
                        >
                            다음단계
                        </Button>
                    </>
                );
            case 1:
                return (
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>이름</FormLabel>
                            <Input
                                placeholder="이름을 입력해주세요"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>이메일</FormLabel>
                            <Input
                                type="email"
                                placeholder="이메일을 입력해주세요"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>비밀번호</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="비밀번호를 입력해주세요"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <InputRightElement width="4.5rem">
                                    <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? "숨기기" : "보기"}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Button
                            colorScheme="teal"
                            size="lg"
                            onClick={handleNextStep}
                            isDisabled={!name || !email || !password}
                        >
                            다음단계
                        </Button>
                    </VStack>
                );

            case 2:
                return <BusinessInfoForm onSubmit={handleBusinessInfoSubmit} />;

            case steps.length - 1:
                return (
                    <VStack spacing={8} align="center">
                        {showConfetti && <Confetti />}
                        <Heading as="h2" size="xl" textAlign="center">
                            가입이 완료되었습니다!
                        </Heading>
                        <Text fontSize="xl" textAlign="center">
                            가입해 주셔서 감사합니다.
                            더 나은 서비스로 보답하겠습니다.
                        </Text>
                        <Button
                            colorScheme="blue"
                            size="lg"
                            onClick={handleLogin}
                        >
                            로그인하기
                        </Button>
                    </VStack>
                );
            default:
                return <Text>알 수 없는 단계입니다.</Text>;
        }
    };

    return (
        <Container maxW="800px" py={10}>
            <VStack spacing={8} align="stretch">
                <Heading as="h1" size="xl" textAlign="center">회원가입</Heading>

                <Text textAlign="center">
                    지금 바로 가입하시면 더 다양한 서비스를 이용하실 수 있습니다.
                </Text>

                <Stepper index={activeStep} colorScheme="blue">
                    {steps.map((step, index) => (
                        <Step key={index}>
                            <StepIndicator>
                                <StepStatus
                                    complete={<StepIcon />}
                                    incomplete={<StepNumber />}
                                    active={<StepNumber />}
                                />
                            </StepIndicator>

                            <Box flexShrink='0'>
                                <StepTitle>{step.title}</StepTitle>
                                <StepDescription>{step.description}</StepDescription>
                            </Box>

                            <StepSeparator />
                        </Step>
                    ))}
                </Stepper>

                <Box mt={8}>
                    {renderStepContent()}
                </Box>
            </VStack>
        </Container>
    );
}

export default Join;