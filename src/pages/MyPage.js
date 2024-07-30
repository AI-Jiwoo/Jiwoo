import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import BusinessInfoForm from '../component/BusinessInfoForm';

const MyPage = () => {
    const [userInfo, setUserInfo] = useState({
        id: 'JIWOO',
        name: '이기연',
        phone: '010112119',
        birthdate: new Date('1990-01-01')
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [businessInfos, setBusinessInfos] = useState([
        { id: 1, businessName: "지우 JIWOO", description: "첫 번째 사업 정보" }
    ]);
    const [isAddingBusiness, setIsAddingBusiness] = useState(false);

    const handleInfoChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setUserInfo({ ...userInfo, birthdate: date });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
        // 로그인 페이지로 리다이렉트
        // window.location.href = '/login';
    };

    const handleSaveInfo = () => {
        alert('개인정보가 성공적으로 저장되었습니다.');
    };

    const handleAddBusiness = () => {
        setIsAddingBusiness(true);
    };

    const handleSubmitBusinessInfo = (newBusinessInfo) => {
        setBusinessInfos([...businessInfos, { ...newBusinessInfo, id: Date.now() }]);
        setIsAddingBusiness(false);
        alert('새 사업정보가 저장되었습니다.');
    };

    return (
        <Container>
            <Title>마이페이지</Title>

            <Section>
                <InfoGrid>
                    <InfoItem>
                        <Label>아이디</Label>
                        <Input name="id" value={userInfo.id} onChange={handleInfoChange} />
                    </InfoItem>
                    <InfoItem>
                        <Label>이름</Label>
                        <Input name="name" value={userInfo.name} onChange={handleInfoChange} />
                    </InfoItem>
                    <InfoItem>
                        <Label>전화번호</Label>
                        <Input name="phone" value={userInfo.phone} onChange={handleInfoChange} />
                    </InfoItem>
                    <InfoItem>
                        <Label>생년월일</Label>
                        <StyledDatePicker
                            selected={userInfo.birthdate}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd"
                        />
                    </InfoItem>
                </InfoGrid>
                <ButtonContainer>
                    <Button onClick={openModal}>비밀번호 변경</Button>
                    <Button onClick={handleSaveInfo}>저장</Button>
                </ButtonContainer>
            </Section>

            <Divider />

            <Section>
                <SectionTitle>사업정보</SectionTitle>
                <CardContainer>
                    {businessInfos.map((info) => (
                        <Card key={info.id}>
                            <CardHeader>{info.businessName}</CardHeader>
                            <CardContent>{info.description}</CardContent>
                        </Card>
                    ))}
                    {isAddingBusiness ? (
                        <FormCard>
                            <BusinessInfoForm onSubmit={handleSubmitBusinessInfo} />
                        </FormCard>
                    ) : (
                        <AddCard onClick={handleAddBusiness}>
                            <PlusIcon>+</PlusIcon>
                            <AddText>사업 추가</AddText>
                        </AddCard>
                    )}
                </CardContainer>
            </Section>

            {isModalOpen && (
                <Modal>
                    <ModalContent>
                        <h2>비밀번호 변경</h2>
                        <form onSubmit={handlePasswordSubmit}>
                            <Input
                                type="password"
                                name="currentPassword"
                                placeholder="현재 비밀번호"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                            />
                            <Input
                                type="password"
                                name="newPassword"
                                placeholder="새 비밀번호"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                            />
                            <Input
                                type="password"
                                name="confirmPassword"
                                placeholder="새 비밀번호 확인"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                            />
                            <Button type="submit">변경 저장하기</Button>
                            <Button type="button" onClick={closeModal}>취소</Button>
                        </form>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
};

const Container = styled.div`
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 24px;
    margin-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 10px;
`;

const Section = styled.div`
    margin-bottom: 30px;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.span`
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
`;

const Input = styled.input`
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
`;

const StyledDatePicker = styled(DatePicker)`
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
`;

const Button = styled.button`
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #45a049;
    }
`;

const Divider = styled.hr`
    margin: 30px 0;
    border: none;
    border-top: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    margin-bottom: 20px;
`;

const CardContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
`;

const Card = styled.div`
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 200px;
`;

const CardHeader = styled.h3`
    font-size: 18px;
    margin-bottom: 10px;
`;

const CardContent = styled.p`
    font-size: 14px;
`;

const AddCard = styled(Card)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: #e0e0e0;
`;

const PlusIcon = styled.span`
    font-size: 36px;
    margin-bottom: 10px;
`;

const AddText = styled.span`
    font-size: 14px;
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 300px;

    h2 {
        margin-bottom: 15px;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
`;

const FormCard = styled(Card)`
    width: 100%;
    height: auto;
    padding: 20px;
    background-color: #ffffff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export default MyPage;