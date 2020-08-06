import React from 'react';

const Card = (props) => {

    const headerClasses = ['m-0 font-weight-bold'];
    if (props.type) {
        headerClasses.push('text-' + props.type);
    }

    return (
    <div className="card shadow mb-4">
        { props.header ? 
            <div className="card-header">
                <h6 className={headerClasses.join(' ')}>{ props.header }</h6>
            </div>
            : null
        }
        <div className="card-body">
            { props.title ? <h5 className="card-title">{ props.title }</h5> : null }
            { props.text ? <p className="card-text">{ props.text }</p> : null }
            { props.children }
        </div>
    </div>
    );
}

export default Card;