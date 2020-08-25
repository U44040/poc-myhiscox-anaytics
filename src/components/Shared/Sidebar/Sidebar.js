import React, { Component } from 'react';

class Sidebar extends Component
{

    constructor(props) {
        super();
        this.state = {
            collapsed: props.collapsed,
            sidebarFixed: props.sidebarFixed,
        }
    }

    showSidebar = (e) => {
        this.setState({
            collapsed: false,
        })
    }

    hideSidebar = (e) => {
        if (this.state.sidebarFixed === true) { return; }
        this.setState({
            collapsed: true,
        })
    }

    toggleSidebarFixed = (e) => {
        this.setState((oldState, oldProps) => ({
            sidebarFixed: !oldState.sidebarFixed
        }))
    }

    render = () => {
        let classes = ['d-none d-md-block'];
        if (this.state.collapsed) {
            classes.push('sidebar-collapsed');
        }
        else {
            classes.push('sidebar-expanded');
        }

        let iconSidebarFixed;
        if (this.state.sidebarFixed) {
            iconSidebarFixed = 'fa fa-thumb-tack mr-3';
        }
        else {
            iconSidebarFixed = 'fa fa-thumb-tack fa-rotate-90 mr-3';
        }
        
        return (
        <div id="sidebar-container" className={classes.join(' ')} onMouseEnter={this.showSidebar} onMouseLeave={this.hideSidebar}>
                <ul className="list-group sticky-top sticky-offset sticky-height-control">
                    <li className="sidebar-fixed-button text-right">
                        <span className={iconSidebarFixed} onClick={this.toggleSidebarFixed}></span>
                    </li>

                    { this.props.children }

                </ul>
        </div>
        );
    }

}

export default Sidebar;
