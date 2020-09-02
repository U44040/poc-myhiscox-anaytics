import React, { Component, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import './Login.scss';
import userContext from '../../context/userContext';

class Login extends Component {

    static contextType = userContext;

    state = {
        userName: '',
        userPassword: '',
        loginRedirect: this.context.authenticated ? <Redirect to="/" /> : null,
        hasError: false,
    }

    changeUserName = (e) => {
        this.setState({
            userName: e.target.value,
        })
    }

    
    changeUserPassword = (e) => {
        this.setState({
            userPassword: e.target.value,
        })
    }

    login = (e) => {
        e.preventDefault();
        let result = this.context.checkLogin(this.state.userName, this.state.userPassword);
        if (result == true) {
            this.setState({
                loginRedirect: <Redirect to="/" />,
                hasError: false,
            })
        } else {
            this.setState({
                hasError: true,
            })
        }
    }

    render = () => {
        let userInputClass = ['input100'];
        let passwordInputClass = ['input100'];

        if (this.state.userName) {
            userInputClass.push('has-val');
        }
        if (this.state.userPassword) {
            passwordInputClass.push('has-val');
        }

        return (
            <div className="section-login login-page">
                <div className="bg-image"></div>
                {this.state.loginRedirect}
                <div className="limiter">
                    <div className="container-login100">
                        <div className="wrap-login100">
                            <form className="login100-form validate-form">

                                <span className="login100-form-logo mb-2">
                                    <i className="zmdi zmdi-landscape">
                                        <img src="/colibri.png" style={{height:"90px"}}></img>
                                    </i>
                                </span>

                                <span className="app-name login100-form-title p-b-34 p-t-27">
                                    <img className="hiscox-icon" src="/hiscox-inverse.png"></img>
                                    <span>B-Eye</span>
                                </span>

                                <span className="app-slogan login100-form-title p-b-34 p-t-27 mb-5">
                                    <small><em>"A Bird-Eye view over Hiscox Iberia Business"</em></small>
                                </span>


                                <span className="login100-form-title p-b-34 p-t-27">
                                    Log in
                                </span>

                                <div className="wrap-input100 validate-input" data-validate = "Enter username">
                                    <input className={userInputClass.join(" ")} type="text" name="username" placeholder="Username" value={this.state.userName} onChange={this.changeUserName} />
                                    <span className="focus-input100" data-placeholder="&#xf007;"></span>
                                </div>

                                <div className="wrap-input100 validate-input" data-validate="Enter password">
                                    <input className={passwordInputClass.join(" ")} type="password" name="pass" placeholder="Password" value={this.state.userPassword} onChange={this.changeUserPassword} />
                                    <span className="focus-input100" data-placeholder="&#xf084;"></span>
                                </div>

                                <div className="contact100-form-checkbox">
                                    <input className="input-checkbox100" id="ckb1" type="checkbox" name="remember-me" />
                                    <label className="label-checkbox100" htmlFor="ckb1">
                                        Remember me
                                    </label>
                                </div>

                                { (this.state.hasError) ?
                                <div className="text-center pb-2">
                                    <div className="alert alert-warning">
                                        User incorrect. Try again.
                                    </div>
                                </div>
                                : '' }
                                

                                <div className="container-login100-form-btn">
                                    <button className="login100-form-btn" onClick={this.login}>
                                        Login
                                    </button>
                                </div>

                                <div className="text-center pt-2">
                                    <a className="txt1" href="#">
                                        Forgot Password?
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}


export default Login;