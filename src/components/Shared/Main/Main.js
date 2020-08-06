import React from 'react';

const Main = (props) => {
    return (
    <main>
        <div className="row">
            { props.children }
        </div>
    </main>
    );
};

export default Main;