import {Box} from "@chakra-ui/react";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import {useEffect, useRef, useState} from "react";

const AnimatedSection = ({ children, delay = 0, backgroundColor = 'transparent' }) => {
    const ref = useRef(null);
    const entry = useIntersectionObserver(ref, {
        threshold: 0.5,
        rootMargin: '0px'
    });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (entry?.isIntersecting) {
            setIsVisible(true);
        }
    }, [entry]);

    return (
        <Box
            ref={ref}
            className={`animated-section ${isVisible ? 'visible' : ''}`}
            style={{
                transitionDelay: `${delay}ms`,
            }}
            backgroundColor={isVisible ? backgroundColor : 'transparent'}
            transition="opacity 0.6s ease-out, transform 0.6s ease-out, background-color 0.6s ease-out"
            width="100%"
            minHeight="100vh"
        >
            {children}
        </Box>
    );
};