import React, { useState } from 'react';
import { ProSidebar, SidebarHeader, SidebarContent, SidebarFooter, Menu, SubMenu, MenuItem } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';
import './Sidebar.scss';
//import sidebarBg from './assets/bg1.jpg';

const Sidebar = (props) => {
    
    const [rtl, setRtl] = useState(props.rtl);
    const [image, setImage] = useState(props.image);
    const [sidebarBg, setSidebarBg] = useState(props.sidebarBg);

    return (
    <ProSidebar
      collapsed={props.collapsed}
      toggled={props.toggled}
      image={image ? sidebarBg : false}
      breakPoint="md"
      onToggle={() => props.handleToggleSidebar(false)}
    >
      <SidebarHeader>
        <div
          style={{
            padding: '0 24px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: '1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >Hiscox Dashboard
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Menu iconShape="circle">
          <MenuItem
            icon={<span className="fa fa-line-chart" />}
            suffix={<span className="badge red">+1</span>}
          >
            Dashboard
            <Link to="/dashboard" />
          </MenuItem>
        </Menu>
        <Menu iconShape="circle">
          <SubMenu
            title="Gráficos"
            icon={<span className="fa fa-line-chart" />}
          >
            <MenuItem>En tiempo real</MenuItem>
          </SubMenu>
        </Menu>
      </SidebarContent>

      <SidebarFooter style={{ textAlign: 'center' }}>
        <div className="sidebar-btn-wrapper">
          <a className="sidebar-btn">
            <span className="fa fa-sign-out" />
            <span> Cerrar sesión</span>
          </a>
        </div>
      </SidebarFooter>
    </ProSidebar>
    );
};

export default Sidebar;