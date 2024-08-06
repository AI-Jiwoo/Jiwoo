import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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
    useDisclosure,
} from "@chakra-ui/react";
import BusinessInfoForm from "../component/BusinessInfoForm";
import "react-datepicker/dist/react-datepicker.css";
import '../style/MyPage.css';
import DatePicker from "react-datepicker";

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
    const [businessInfos, setBusinessInfos] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
    const [categories, setCategories] = useState([]);


    useEffect(() => {
        fetchUserInfo();
        fetchBusinessInfos();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/category/names', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            alert('카테고리 목록을 불러오는데 실패했습니다.');
        }
    };

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('http://localhost:5000/auth/profile', {
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

    const fetchBusinessInfos = async () => {
        try {
            const response = await axios.get('http://localhost:5000/business/user', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            console.log('Raw response:', response.data);
            const businessData = response.data.business || [];
            console.log('Processed business data:', businessData);
            setBusinessInfos(businessData);
        } catch (error) {
            console.error('Failed to fetch business infos:', error);
            alert('사업 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleInfoChange = (e) => {
        const {name, value} = e.target;
        setUserInfo(prevState => {
            return { ...prevState, [name]: value
            }
        })
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
            await axios.post('http://localhost:5000/auth/edit/password', {
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
            console.log('Saving user info:', userInfo);
            const response = await axios.post('http://localhost:5000/auth/edit/info', {
                gender: userInfo.gender,
                phoneNo: userInfo.phoneNo
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            console.log('Server response:', response.data);
            alert('개인정보가 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error('Failed to save user info:', error.response?.data || error.message);
            alert('개인정보 저장에 실패했습니다: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmitBusinessInfo = async (newBusinessInfo) => {
        try {
            const response = await axios.post('http://localhost:5000/business/regist', {
                ...newBusinessInfo,
                startupStageId: parseInt(newBusinessInfo.startupStageId, 10)
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });

            if (response.status === 201) {
                onClose();
                alert('새 사업정보가 성공적으로 저장되었습니다.');
                fetchBusinessInfos(); // 여기에 추가
            } else {
                throw new Error('사업 정보 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to save business info:', error.response?.data || error.message);
            alert('사업 정보 저장에 실패했습니다: ' + (error.response?.data?.message || error.message));
        }
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
                        <input name="email" value={userInfo.email} readOnly/>
                    </div>
                    <div className="info-item">
                        <label>이름</label>
                        <input name="name" value={userInfo.name} readOnly/>
                    </div>
                    <div className="info-item">
                        <label>전화번호</label>
                        <input name="phoneNo" value={userInfo.phoneNo} onChange={handleInfoChange}/>
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
                    <Button onClick={onPasswordModalOpen} backgroundColor="#2B6CB0" color="white"
                            _hover={{backgroundColor: "#2C5282"}}>비밀번호 변경</Button>
                    <Button onClick={handleSaveInfo} backgroundColor="#2B6CB0" color="white"
                            _hover={{backgroundColor: "#2C5282"}}>저장</Button>
                </div>
            </section>
            <section className="section">
                <h2 className="section-title">사업정보</h2>
                <div className="business-card-container">
                    {businessInfos && businessInfos.length > 0 ? (
                        businessInfos.map((info) => (
                            <div key={info.id} className="business-card">
                                <div className="business-card-header">
                                    <h3 className="business-card-title">{info.businessName}</h3>
                                    <span className="business-scale">{info.businessScale}</span>
                                </div>
                                <div className="business-card-content">
                                    <p><i className="fas fa-id-card"></i> {info.businessNumber}</p>
                                    <p><i className="fas fa-align-left"></i> {info.businessContent}</p>
                                    <p><i className="fas fa-map-marker-alt"></i> {info.businessLocation}</p>
                                    <p><i className="fas fa-calendar-alt"></i> {info.businessStartDate}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-business-info">등록된 사업정보가 없습니다.</p>
                    )}
                    <div className="business-card add-business-card" onClick={onOpen}>
                        <div className="add-business-content">
                            <span className="add-icon">+</span>
                            <span>사업 추가</span>
                        </div>
                    </div>
                </div>
            </section>
            <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>비밀번호 변경</ModalHeader>
                    <ModalCloseButton/>
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
                            <Button mt={4} backgroundColor="#2B6CB0" color="white" _hover={{backgroundColor: "#2C5282"}}
                                    mr={3} type="submit">
                                변경 저장하기
                            </Button>
                            <Button mt={4} onClick={onPasswordModalClose} variant="outline" borderColor="#2B6CB0"
                                    color="#2B6CB0" _hover={{backgroundColor: "#EBF8FF"}}>취소</Button>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay/>
                <ModalContent maxWidth="900px">
                    <ModalHeader>사업 정보 추가</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <BusinessInfoForm
                            onSubmit={handleSubmitBusinessInfo}
                            onClose={onClose}
                            categories={categories}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default MyPage;
