import React, {Component} from 'react';

class ListGroupItem extends Component 
{
    constructor (props) {
        super();
        this.state = {
            collapsed: props.collapsed,
        }
    }

    handleClick = () => {
        this.setState((oldState, oldProps) => {
            this.setState({collapsed: !oldState.collapsed})
        });
    }

    render = () => {

        let classes = 'list-group-item sidebar-separator-title align-items-center d-flex';
        if (this.props.isCollapsable) {
            classes += ' menu-collapsable';
        }
        if (this.state.collapsed) {
            classes += ' menu-collapsed';
        }
        
        return (
            <li className={classes} onClick={this.handleClick}>
                <small>{ this.props.title }</small>
            </li>
        );
    }
}

export default ListGroupItem;