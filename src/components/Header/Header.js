import React, { useContext } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import userContext from '../../context/userContext';
import * as ROLES from '../../utils/RoleTypes';

const Header = (props) => {

    const context = useContext(userContext);

    return <Navbar className="shadow navbar-dark bg-primary fixed-top" expand="lg">
        <Navbar.Brand href="#home">Hiscox</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
                <Nav.Link href="/dashboard">Dashboard</Nav.Link>
                <NavDropdown title="Graphs" id="basic-nav-dropdown">
                    <NavDropdown.Item href="/dashboard/1">Graph 1</NavDropdown.Item>
                    <NavDropdown.Item href="/dashboard/2">Graph 2</NavDropdown.Item>
                </NavDropdown>
            </Nav>
            <Nav>
                <Navbar.Text>Welcome back {context.user.name}</Navbar.Text>
                <NavDropdown alignRight title={<span className="fa fa-user"></span>}>
                    <NavDropdown.Item href="/user/profile"><span className="fa fa-user"></span> Profile</NavDropdown.Item>
                    { (context.user.role == ROLES.SUPER_ADMIN_ROLE ?
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