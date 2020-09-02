import React, { Component } from 'react';
import logo from './logo.svg';
import './App.scss';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import Header from './components/Header/Header';
import Main from './components/Shared/Main/Main';
import Dashboard from './routes/Dashboard/Dashboard';
import Login from './routes/Login/Login';
import userContext from './context/userContext';
import Cookies from 'js-cookie';
import * as ROLES from './utils/RoleTypes';
import TotalAccumulatedSales from './routes/Graphs/TotalAccumulatedSales';

const USERS = [
  {
    id: 100,
    email: 'admin@hiscox.com',
    name: 'Diogo André',
    surname: 'Fernandes',
    role: ROLES.SUPER_ADMIN_ROLE,
    password: 'test123',
  },
  {
    id: 101,
    email: 'hiscoxuser@hiscox.com',
    name: 'Sara',
    surname: 'Borges',
    role: ROLES.HISCOX_USER_ROLE,
    password: 'test123',
  },
  {
    id: 102,
    email: 'networkmanager@hiscox.com',
    name: 'José',
    surname: 'Coronado',
    role: ROLES.NETWORK_MANAGER_ROLE,
    password: 'test123',
    network: 1,
  },
  {
    id: 103,
    email: 'brokeragemanager@hiscox.com',
    name: 'Manuel',
    surname: 'Saenz',
    role: ROLES.BROKERAGE_MANAGER_ROLE,
    password: 'test123',
    network: 1,
    brokerage: 3,
  },
  {
    id: 3,
    email: 'broker@hiscox.com',
    name: 'Estefania',
    surname: 'Morales',
    role: ROLES.USER_ROLE,
    password: 'test123',
    network: 1,
    brokerage: 3,
    broker: 3,
  },
];

class App extends Component {

  constructor(props) {
    super();

    let authenticated = false;
    let user = null;

    let userCookie = Cookies.get('user');
    if (userCookie) {
      authenticated = true;
      user = USERS[userCookie];
    }

    this.state = {
      authenticated: authenticated,
      user: user,
      users: USERS,
    }
  }

  
  checkLogin = (email, password) => {
    let index = this.state.users.findIndex((d) => d.email.toLowerCase() == email.toLowerCase() && d.password === password);
    if (index != -1) {
      this.setState({
        authenticated: true,
        user: this.state.users[index],
      }, () => {
        // TODO: Dont store full info in cookie
        Cookies.set('user', index, { expires: 1 });
      });
      return true;
    } else {
      return false;
    }
  }

  logout = () => {
    this.setState({
      authenticated: false,
      user: null
    });
    Cookies.remove('user');
  }

  render = () => {
    return (<div className="app">
      <userContext.Provider value={{ authenticated: this.state.authenticated, user: this.state.user, checkLogin: this.checkLogin, logout: this.logout }}>
        <BrowserRouter>
          {this.state.authenticated === false ? <Redirect to="/login" /> : '' }
          {this.state.authenticated === true ? <Header /> : '' }
          <Main>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/graphs/total-accumulated-sales" component={TotalAccumulatedSales} />
              <Route path="/" component={Dashboard} />
            </Switch>
          </Main>
        </BrowserRouter>
      </userContext.Provider>
    </div>)
  };

}

export default App;
