import React, { useState } from 'react';
import './SidebarFilters.scss';

const SidebarFilters = (props) => {

    let classes = ['d-none d-md-block'];

    if (props.collapsed) {
        classes.push('sidebar-collapsed');
    }
    else {
        classes.push('sidebar-expanded');
    }

    let iconSidebarFixed;
    if (props.sidebarFixed) {
        iconSidebarFixed = 'fa fa-thumb-tack mr-3';
    }
    else {
        iconSidebarFixed = 'fa fa-thumb-tack fa-rotate-90 mr-3';
    }

    return (
        <div id="sidebar-container" className={classes.join(' ')} onMouseEnter={props.showSidebar} onMouseLeave={props.hideSidebar}>
            <ul className="list-group sticky-top sticky-offset">
                <li className="sidebar-fixed-button text-right">
                    <span className={iconSidebarFixed} onClick={props.toggleSidebarFixed}></span>
                </li>
                <li className="list-group-item sidebar-separator-title text-muted align-items-center menu-collapsed d-flex">
                    <small>FILTROS</small>
                </li>
                <a href="#submenu1" data-toggle="collapse" aria-expanded="false" className="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                    <div className="d-flex w-100 justify-content-start align-items-center">
                        <span className="fa fa-filter fa-fw mr-3"></span>
                        <span className="menu-collapsed">Corredurías</span>
                        <span className="submenu-icon ml-auto"></span>
                    </div>
                </a>
                <a href="#submenu1" data-toggle="collapse" aria-expanded="false" className="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                    <div className="d-flex w-100 justify-content-start align-items-center">
                        <span className="fa fa-dashboard fa-fw mr-3"></span>
                        <span className="menu-collapsed">Redes</span>
                        <span className="submenu-icon ml-auto"></span>
                    </div>
                </a>
                <a href="#submenu1" data-toggle="collapse" aria-expanded="false" className="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                    <div className="d-flex w-100 justify-content-start align-items-center">
                        <span className="fa fa-dashboard fa-fw mr-3"></span>
                        <span className="menu-collapsed">Estado</span>
                        <span className="submenu-icon ml-auto"></span>
                    </div>
                </a>
            </ul>
        </div>
    );
};

export default SidebarFilters;