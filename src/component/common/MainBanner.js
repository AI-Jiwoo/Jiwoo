// import React, { useState, useEffect } from 'react';
// import { Box, Text, Flex, VStack, Grid, Button, Spinner, useToast } from '@chakra-ui/react';
// import { motion } from 'framer-motion';
// import api from "../../apis/api";
//
// function MainBanner() {
//     const [recommendedPrograms, setRecommendedPrograms] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const toast = useToast();
//
//     const fetchRecommendedPrograms = async () => {
//         setIsLoading(true);
//         try {
//             const response = await api.get('/support_program/recommend');
//             setRecommendedPrograms(response.data);
//         } catch (error) {
//             console.error('Error fetching recommended programs:', error);
//             toast({
//                 title: "추천 프로그램 로딩 실패",
//                 description: "프로그램을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
//                 status: "error",
//                 duration: 5000,
//                 isClosable: true,
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     useEffect(() => {
//         fetchRecommendedPrograms();
//     }, []);
//
//     return (
//         <Box
//             bg="linear-gradient(to right, #000428, #004e92)"
//             color="white"
//             py={20}
//             position="relative"
//             overflow="hidden"
//         >
//             <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8 }}
//             >
//                 <Flex maxWidth="1200px" margin="auto" flexDirection="column">
//                     <VStack align="flex-start" spacing={6} mb={12}>
//                         <Text fontSize="6xl" fontWeight="bold" lineHeight="1.2">
//                             JIWOO AI HELPER
//                         </Text>
//                         <Text fontSize="2xl" maxWidth="600px">
//                             1인 IT 창업을 위한 최고의 AI 파트너
//                             혁신적인 기술로 당신의 창업 여정을 가속화합니다
//                         </Text>
//                     </VStack>
//
//                     {isLoading ? (
//                         <Flex justify="center" align="center" mt={12}>
//                             <Spinner size="xl" />
//                         </Flex>
//                     ) : recommendedPrograms.length > 0 ? (
//                         <Box mt={12}>
//                             <Text fontSize="3xl" fontWeight="bold" mb={6}>맞춤 추천 지원 프로그램</Text>
//                             <Grid templateColumns={["1fr", "1fr", "repeat(2, 1fr)"]} gap={6}>
//                                 {recommendedPrograms.map((program, index) => (
//                                     <Box key={index} bg="rgba(255,255,255,0.1)" borderRadius="md" p={6}>
//                                         <Text fontSize="xl" fontWeight="bold" mb={3}>{program.name}</Text>
//                                         <Text mb={2}>대상: {program.target}</Text>
//                                         <Text mb={2}>지원 규모: {program.scareOfSupport}</Text>
//                                         <Text mb={2}>지원 내용: {program.supportContent}</Text>
//                                         <Text mb={2}>지원 특징: {program.supportCharacteristics}</Text>
//                                         <Text mb={4}>지원 연도: {program.supportYear}</Text>
//                                         <Button as="a" href={program.originUrl} target="_blank" colorScheme="blue" size="md">
//                                             자세히 보기
//                                         </Button>
//                                     </Box>
//                                 ))}
//                             </Grid>
//                         </Box>
//                     ) : (
//                         <Text mt={12} textAlign="center" fontSize="xl">현재 추천할 수 있는 프로그램이 없습니다.</Text>
//                     )}
//                 </Flex>
//             </motion.div>
//         </Box>
//     );
// }
//
// export default MainBanner;