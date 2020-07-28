import React, { useState } from 'react';
import './SidebarFilters.scss';

const SidebarFilters = (props) => {
  return (
    <div id="sidebar-container" className="sidebar-expanded d-none d-md-block">
      <ul className="list-group sticky-top sticky-offset">
            <li className="list-group-item sidebar-separator-title text-muted align-items-center menu-collapsed d-flex">
                <small>FILTROS</small>
            </li>
            <a href="#submenu1" data-toggle="collapse" aria-expanded="false" className="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                <div className="d-flex w-100 justify-content-start align-items-center">
                    <span className="fa fa-dashboard fa-fw mr-3"></span>
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