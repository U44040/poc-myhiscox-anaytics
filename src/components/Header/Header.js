import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

const Header = (props) => {

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
        </Navbar.Collapse>
    </Navbar>;
}

export default Header;