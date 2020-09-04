import React, { useContext } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import userContext from '../../context/userContext';
import * as ROLES from '../../utils/RoleTypes';
import { Link } from 'react-router-dom';

const Header = (props) => {

    const context = useContext(userContext);

    return <Navbar className="shadow navbar-dark bg-primary fixed-top" expand="lg">
        <Navbar.Brand href="#home">
            <img className="hiscox-icon" src="/hiscox-inverse.png"></img>
            <span className="brand-text">B-Eye</span>
            <img className="app-icon" src="/colibri.png"></img>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse>
            <Nav className="mr-auto">
                <NavDropdown title="Graphs">
                    <Link to="/graphs/real-time-sales">
                        <NavDropdown.Item href="/graphs/real-time-sales">Real-Time Sales</NavDropdown.Item>
                    </Link>
                    <Link to="/graphs/total-accumulated-sales">
                        <NavDropdown.Item href="/graphs/total-accumulated-sales">Total accumulated Sales</NavDropdown.Item>
                    </Link>
                    <Link to="/graphs/sales-race">
                        <NavDropdown.Item href="/graphs/sales-race">Sales Race</NavDropdown.Item>
                    </Link>
                </NavDropdown>
            </Nav>
            <Nav>
                <Navbar.Text>Welcome back {context.user.name}</Navbar.Text>
                <NavDropdown alignRight title={<span className="fa fa-user"></span>}>
                    <NavDropdown.Item href="/user/profile"><span className="fa fa-user"></span> Profile</NavDropdown.Item>
                    {(context.user.role == ROLES.SUPER_ADMIN_ROLE ?
                        <React.Fragment>
                            <NavDropdown.Divider></NavDropdown.Divider>
                            <NavDropdown.Item href="/user/admin"><span className="fa fa-users"></span> Manage users</NavDropdown.Item>
                        </React.Fragment> : '')
                    }
                    <NavDropdown.Divider></NavDropdown.Divider>
                    <NavDropdown.Item onClick={context.logout}><span className="fa fa-sign-out"></span> Logout</NavDropdown.Item>
                </NavDropdown>
            </Nav>
        </Navbar.Collapse>

    </Navbar>;
}

export default Header;