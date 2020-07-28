import React from 'react';
import './Callout.scss';

const Callout = (props) => {

    const className = 'bd-callout bd-callout-' + props.type;

    return (
        <div className={ className }>
            { props.children }
        </div>
    );
};

export default Callout;