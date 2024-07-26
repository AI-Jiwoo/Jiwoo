// hooks/useIntersectionObserver.js
import { useEffect, useState } from 'react';

// 컴포넌트가 마운트되면 IntersectionObserver가 생성되어 지정된 요소(ref)를 관찰
// 요소가 뷰포트에 진입하거나 나갈 때 콜백이 실행되어 entry 상태를 업데이트
// entry 상태가 변경되면 컴포넌트가 리렌더링되어 새로운 가시성 상태에 따라 UI를 업데이트

const useIntersectionObserver = (elementRef, { threshold = 0, root = null, rootMargin = '0%' }) => {
    const [entry, setEntry] = useState();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setEntry(entry),
            { threshold, root, rootMargin }
        );

        const currentElement = elementRef.current;

        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [elementRef, threshold, root, rootMargin]);

    return entry;
};

export default useIntersectionObserver;