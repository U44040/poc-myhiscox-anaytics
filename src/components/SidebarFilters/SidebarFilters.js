import React, { useState } from 'react';
import './SidebarFilters.scss';

const SidebarFilters = (props) => {
  return (
    <div id="sidebar-container" class="sidebar-expanded d-none d-md-block">
      <ul class="list-group sticky-top sticky-offset">
            <li class="list-group-item sidebar-separator-title text-muted align-items-center menu-collapsed d-flex">
                <small>FILTROS</small>
            </li>
            <a href="#submenu1" data-toggle="collapse" aria-expanded="false" class="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                <div class="d-flex w-100 justify-content-start align-items-center">
                    <span class="fa fa-dashboard fa-fw mr-3"></span>
                    <span class="menu-collapsed">Corredurías</span>
                    <span class="submenu-icon ml-auto"></span>
                </div>
            </a>
            <a href="#submenu1" data-toggle="collapse" aria-expanded="false" class="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                <div class="d-flex w-100 justify-content-start align-items-center">
                    <span class="fa fa-dashboard fa-fw mr-3"></span>
                    <span class="menu-collapsed">Redes</span>
                    <span class="submenu-icon ml-auto"></span>
                </div>
            </a>
            <a href="#submenu1" data-toggle="collapse" aria-expanded="false" class="bg-dark list-group-item list-group-item-action flex-column align-items-start collapsed">
                <div class="d-flex w-100 justify-content-start align-items-center">
                    <span class="fa fa-dashboard fa-fw mr-3"></span>
                    <span class="menu-collapsed">Estado</span>
                    <span class="submenu-icon ml-auto"></span>
                </div>
            </a>
        </ul>
    </div>
  );
};

export default SidebarFilters;