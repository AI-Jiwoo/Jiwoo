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
    useToast,
} from '@chakra-ui/react';
import termsText from '../component/TextTerms';
import privacyText from '../component/PrivacyText';
import Confetti from 'react-confetti';
import {useNavigate} from "react-router-dom";
import axios from 'axios';
import '../style/Join.css';

const steps = [
    { title: '약관동의', description: '01' },
    { title: '회원정보', description: '02' },
    { title: '가입완료', description: '03' },
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
    const [hasBusiness, setHasBusiness] = useState(false);
    const [birthDate, setBirthDate] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isBusinessInfoValid, setIsBusinessInfoValid] = useState(false);
    const toast = useToast();


    const handleEmailCheck = async () => {
        if (!email) {
            toast({
                title: "이메일을 입력해주세요.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        try {
            const response = await axios.post('http://localhost:8000/auth/exist/email', { email: email });
            setIsEmailVerified(true);
            toast({
                title: "사용 가능한 이메일입니다.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top",
            });
        } catch (error) {
            console.error('Email check error:', error);
            if (error.response && error.response.status === 400) {
                setIsEmailVerified(false);
                toast({
                    title: "중복된 이메일입니다.",
                    description: "다른 이메일을 사용해주세요.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top",
                });
            } else {
                toast({
                    title: "이메일 확인 중 오류가 발생했습니다.",
                    description: "잠시 후 다시 시도해주세요.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top",
                });
            }
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setIsEmailVerified(false);  // 이메일이 변경되면 검증 상태 초기화
    };

    const handleSignup = async () => {
        if (!isEmailVerified) {
            toast({
                title: "이메일 중복 확인을 해주세요.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        try {
            const signupData = {
                name,
                email,
                password,
                birthDate
            };

            console.log('Sending signup data:', signupData);

            const signupResponse = await axios.post('http://localhost:8000/auth/signup', signupData);

            console.log('Signup response:', signupResponse);

            if (signupResponse.status === 200) {
                toast({
                    title: "회원가입 성공",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                // 사업자 정보가 있는 경우, 별도로 등록
                if (hasBusiness && businessInfo) {
                    try {
                        const businessResponse = await axios.post('http://localhost:8000/business/regist', {
                            ...businessInfo,
                            email: email // 사용자 이메일을 함께 전송
                        });

                        console.log('Business registration response:', businessResponse);

                        if (businessResponse.status === 201) {
                            toast({
                                title: "사업자 정보 등록 성공",
                                status: "success",
                                duration: 3000,
                                isClosable: true,
                            });
                        } else {
                            throw new Error('사업자 정보 등록 실패');
                        }
                    } catch (businessError) {
                        console.error('Business registration error:', businessError);
                        toast({
                            title: "사업자 정보 등록 실패",
                            description: businessError.response?.data?.message || "사업자 정보 등록 중 오류가 발생했습니다.",
                            status: "error",
                            duration: 3000,
                            isClosable: true,
                        });
                    }
                }

                handleNextStep();
            }
        } catch (error) {
            console.error('Signup error:', error.response?.data || error.message);
            toast({
                title: "회원가입 중 오류가 발생했습니다.",
                description: error.response?.data?.message || "알 수 없는 오류가 발생했습니다.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        if (activeStep === steps.length - 1) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [activeStep]);

    const handleNextStep = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBusinessInfoSubmit = (info, isValid) => {
        setBusinessInfo(info);
        setIsBusinessInfoValid(isValid);
    };

    const handleLogin = () => {
        navigate('/login');
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
                            <Flex>
                                <Input
                                    type="email"
                                    placeholder="이메일을 입력해주세요"
                                    value={email}
                                    onChange={handleEmailChange}
                                    mr={2}
                                />
                                <Button onClick={handleEmailCheck} colorScheme="blue">
                                    중복 확인
                                </Button>
                            </Flex>
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
                        <FormControl isRequired>
                            <FormLabel>생년월일</FormLabel>
                            <Input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                            />
                        </FormControl>

                        <Flex justify="space-between" mt={4}>
                            <Button
                                colorScheme="gray"
                                onClick={() => setActiveStep((prevStep) => prevStep - 1)}
                            >
                                이전단계
                            </Button>
                            <Button
                                colorScheme="teal"
                                onClick={handleSignup}
                                isDisabled={hasBusiness && !isBusinessInfoValid}
                            >
                                가입완료
                            </Button>
                        </Flex>
                    </VStack>
                );
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