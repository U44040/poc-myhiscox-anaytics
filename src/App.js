import React, { Component } from 'react';
import logo from './logo.svg';
import './App.scss';
import { BrowserRouter, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Main from './components/Shared/Main/Main';
import Dashboard from './routes/Dashboard/Dashboard';

class App extends Component {

  render = () => (
    <div className="app">
      <BrowserRouter>
        <Header />
        <Main handleToggleSidebar={this.handleToggleSidebar} handleCollapseSidebar={this.handleCollapseSidebar} >
          <Route path="/" component={Dashboard} />
        </Main>
      </BrowserRouter>
    </div>
  );

}

export default App;
