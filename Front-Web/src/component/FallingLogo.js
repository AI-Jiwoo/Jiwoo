import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import logo2 from '../logo/JiwooLogo.png';

const FallingLogo = ({ x, y, onRemove }) => {
    const controls = useAnimation();

    useEffect(() => {
        controls.start({
            y: window.innerHeight,
            transition: {
                duration: 3 + Math.random() * 2,
                ease: 'linear'
            }
        }).then(() => {
            controls.start({
                opacity: 0,
                transition: {
                    duration: 2,
                    ease: 'easeInOut'
                }
            }).then(() => {
                onRemove();
            });
        });
    }, []); // 빈 배열을 의존성 배열로 전달하여, 컴포넌트가 마운트될 때 한 번만 실행되도록 설정

    return (
        <motion.img
            src={logo2}
            alt="Falling JIWOO logo"
            style={{
                position: 'fixed',
                left: x,
                top: y,
                width: '50px',
                height: 'auto',
                zIndex: 1000
            }}
            initial={{ y: y, opacity: 1 }}
            animate={controls}
        />
    );
};

export default FallingLogo;
