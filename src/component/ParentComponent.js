import React from 'react';
import { Element } from 'react-scroll';
import MainHeader from '../component/common/MainHeader';

const ParentComponent = () => {
    return (
        <div>
            <MainHeader />
            <Element name="marketResearchSection">
                <div style={{ height: '500px' }}>Market Research Section</div>
            </Element>
            <Element name="businessModelSection">
                <div style={{ height: '500px' }}>Business Model Section</div>
            </Element>
        </div>
    );
};

export default ParentComponent;
