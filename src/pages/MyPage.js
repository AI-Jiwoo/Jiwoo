import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../MyPage.css';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    useDisclosure,
} from "@chakra-ui/react";
import BusinessInfoForm from "../component/BusinessInfoForm";

const MyPage = () => {
    const { user } = useAuth();
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        phoneNo: '',
        birthDate: null,
        gender: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [businessInfos, setBusinessInfos] = useState([
        { id: 1, businessName: "지우 JIWOO", description: "첫 번째 사업 정보" }
    ]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isPasswordModalOpen,
        onOpen: onPasswordModalOpen,
        onClose: onPasswordModalClose
    } = useDisclosure();

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('http://localhost:8000/auth/profile', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            const userData = response.data;
            setUserInfo({
                name: userData.name,
                email: userData.email,
                phoneNo: userData.phoneNo,
                birthDate: userData.birthDate ? new Date(userData.birthDate) : null,
                gender: userData.gender
            });
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            alert('사용자 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleInfoChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setUserInfo({ ...userInfo, birthDate: date });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            await axios.post('http://localhost:8000/auth/edit/password', {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            alert('비밀번호가 성공적으로 변경되었습니다.');
            onPasswordModalClose();
        } catch (error) {
            console.error('Failed to change password:', error);
            alert('비밀번호 변경에 실패했습니다.');
        }
    };

    const handleSaveInfo = async () => {
        try {
            await axios.post('http://localhost:8000/auth/edit/info', {
                gender: userInfo.gender,
                phoneNo: userInfo.phoneNo
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            alert('개인정보가 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error('Failed to save user info:', error);
            alert('개인정보 저장에 실패했습니다.');
        }
    };

    const handleSubmitBusinessInfo = (newBusinessInfo) => {
        setBusinessInfos([...businessInfos, { ...newBusinessInfo, id: Date.now() }]);
        onClose();
        alert('새 사업정보가 저장되었습니다.');
    };

    return (
        <div className="container">
            <div className="title-container">
                <h1 className="title">마이페이지</h1>
            </div>

            <section className="section">
                <h2 className="section-title">기본정보</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>아이디 (이메일)</label>
                        <input name="email" value={userInfo.email} readOnly />
                    </div>
                    <div className="info-item">
                        <label>이름</label>
                        <input name="name" value={userInfo.name} readOnly />
                    </div>
                    <div className="info-item">
                        <label>전화번호</label>
                        <input name="phoneNo" value={userInfo.phoneNo} onChange={handleInfoChange} />
                    </div>
                    <div className="info-item">
                        <label>생년월일</label>
                        <DatePicker
                            selected={userInfo.birthDate}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd"
                            className="date-picker"
                            placeholderText="생년월일"
                        />
                    </div>
                    <div className="info-item">
                        <label>성별</label>
                        <select name="gender" value={userInfo.gender} onChange={handleInfoChange}>
                            <option value="MALE">남성</option>
                            <option value="FEMALE">여성</option>
                        </select>
                    </div>
                </div>
                <div className="button-container">
                    <Button onClick={onPasswordModalOpen} backgroundColor="#2B6CB0" color="white" _hover={{ backgroundColor: "#2C5282" }}>비밀번호 변경</Button>
                    <Button onClick={handleSaveInfo} backgroundColor="#2B6CB0" color="white" _hover={{ backgroundColor: "#2C5282" }}>저장</Button>
                </div>
            </section>

            <section className="section">
                <h2 className="section-title">사업정보</h2>
                <div className="card-container">
                    {businessInfos.map((info) => (
                        <div key={info.id} className="card">
                            <h3 className="card-header">{info.businessName}</h3>
                            <p className="card-content">{info.description}</p>
                        </div>
                    ))}
                    <div className="add-card" onClick={onOpen}>
                        <span className="plus-icon">+</span>
                        <span className="add-text">사업 추가</span>
                    </div>
                </div>
            </section>

            <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>비밀번호 변경</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form onSubmit={handlePasswordSubmit}>
                            <FormControl>
                                <FormLabel>현재 비밀번호</FormLabel>
                                <Input
                                    type="password"
                                    name="oldPassword"
                                    value={passwordForm.oldPassword}
                                    onChange={handlePasswordChange}
                                />
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>새 비밀번호</FormLabel>
                                <Input
                                    type="password"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                />
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>새 비밀번호 확인</FormLabel>
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                />
                            </FormControl>
                            <Button mt={4} backgroundColor="#2B6CB0" color="white" _hover={{ backgroundColor: "#2C5282" }} mr={3} type="submit">
                                변경 저장하기
                            </Button>
                            <Button mt={4} onClick={onPasswordModalClose} variant="outline" borderColor="#2B6CB0" color="#2B6CB0" _hover={{ backgroundColor: "#EBF8FF" }}>취소</Button>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent maxWidth="900px">
                    <ModalHeader>사업 정보 추가</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <BusinessInfoForm
                            onSubmit={handleSubmitBusinessInfo}
                            showNextButton={false}
                            onClose={onClose}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default MyPage;