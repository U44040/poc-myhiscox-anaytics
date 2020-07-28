import React from 'react';

const Card = (props) => {

    const headerClasses = ['m-0 font-weight-bold'];
    if (props.type) {
        headerClasses.push('text-' + props.type);
    }

    return (
    <div class="card shadow mb-4">
        { props.header ? 
            <div class="card-header">
                <h6 class={headerClasses.join(' ')}>{ props.header }</h6>
            </div>
            : null
        }
        <div class="card-body">
            { props.title ? <h5 class="card-title">{ props.title }</h5> : null }
            { props.text ? <p class="card-text">{ props.text }</p> : null }
            { props.children }
        </div>
    </div>
    );
}

export default Card;