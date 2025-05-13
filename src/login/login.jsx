import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./../app.css";
import "./login.css";
import {HardRedirect} from './../utility/utility.jsx'

import Button from 'react-bootstrap/Button';

import { MessageDialog } from './messageDialog';
import { BrowserRouter, NavLink, Route, Routes, Link, useNavigate} from 'react-router-dom'; 


export function LoginRouter(){
    return(
        <BrowserRouter>
                <div className='body theme adaptive'>
                    <header className="">
                        <div className="container-fluid fixed-top"  >
                            <nav className="navbar theme-h adaptive">
                                <div className="navbar-header">
                                    <NavLink className="navbar-brand" to="">
                                        <picture alt="Project Yggdrasil (home)" width="200">
                                            <source srcSet="/transparentProjectYggdrasil.png" media="(prefers-color-scheme: light)" />
                                            <source srcSet="/transparentProjectYggdrasilDark.png" media="(prefers-color-scheme: dark)" />
                                            <img  alt="Project Yggdrasil (home)" src="/transparentProjectYggdrasil.png" width="200" />
                                        </picture>
                                    </NavLink>
                                </div>
                            </nav>
                        </div>
                    </header>
                    <div>
                        <Routes>
                            <Route path='login'> 
                                <Route path="" element={<Login/>}/>
                                <Route path="register" element={<Register/>} />
                            </Route>
                            <Route path="*" element={<HardRedirect/>}/>
                        </Routes>          
                    </div>
                </div>
        </BrowserRouter>
    )
    
}

export function Login() {
    const [username, setUsername] = React.useState('');

    const [password, setPassword] = React.useState('');
    const [rememberMe, setRememberMe] = React.useState(false);

    const [displayError, setDisplayError] = React.useState(null);
    const navigate = useNavigate();

    async function handleLogin() {
        const json = ({username:username, password:password, rememberMe});
        await createAuth('PUT', json, "login", setDisplayError, navigate);
    }
    return (
        <main className="container-fluid text-center">
            <form
                autoComplete="on"
                onSubmit={(e) => {
                    e.preventDefault()
                    handleLogin()
                }}
            >
                <fieldset className="theme-l adaptive">
                        <legend>Log-In</legend>
                        <div className="input-group mp-3">

                            <label className="input-group-text" htmlFor="login-username">Username/Email:</label>
                            <input
                                id="login-username"
                                className="form-control"
                                name="username"
                                type="text"
                                placeholder="username/your@email.com"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            </div>

                            <div className="input-group mp-3">
                            <label className="input-group-text" htmlFor="login-password">Password:</label>
                            <input
                                id="login-password"
                                className="form-control"
                                name="password"
                                type="password"
                                placeholder="password"
                                autoComplete="current-password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            </div>
                        
                        
                            <div className="btn-group">
                                <button type="submit" className="btn btn-primary">
                                    Login
                                </button>
                                <button className="btn btn-secondary" onClick={()=> navigate('/login/register') }>Create</button>
                            </div>
                        
                        
                        <div>
                            <label htmlFor="remember-me">Stay Signed in?</label>
                            <input 
                                type="checkbox"
                                id="remember-me"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                        </div>

                        {displayError && <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />}

                </fieldset>
            </form>
            
        </main>);
}


async function createAuth(method, json, path, setDisplayError, navigate){
    try{
        const res = await fetch(`/api/auth/${path}`, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(json),
        });
        if(res.ok){
            const user = await res.json();
            console.log(JSON.stringify(user))
            navigate('/');
        }
        else{
            let errorMessage = "An unknown error occurred";
            console.log(errorMessage)
            // Ensure response has JSON data before parsing
            if (res.headers.get("content-type")?.includes("application/json")) {
                const body = await res.json();
                errorMessage = body.msg || errorMessage;
            }
            setDisplayError(`Error: ${errorMessage}`);
        }
    }
    catch (e){
        setDisplayError(`Error: ${e.message || "Network error"}`);
    }
}

export function Register(){
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [rememberMe, setRememberMe] = React.useState(false);


    const [displayname, setDisplayname] = useState('');
    const [displayError, setDisplayError] = React.useState(null);
    const navigate = useNavigate();
    function isFormValid() {
        return (
          email &&
          username &&
          password &&
          confirm &&
          password === confirm &&
          password.length >= 8 // You can add more checks here
        );
      }

    async function handleRegister() {
        if(password === confirm){
            const json = ({email, username, password, displayname, rememberMe});
            await createAuth('POST', json, "register", setDisplayError, navigate);
        }
        else{
            setDisplayError("Your passwords don't match")
        }
    }

    return (
        <main className="container-fluid text-center">
            <form 
                autoComplete="on"
                onSubmit={(e) => {
                e.preventDefault()
                handleRegister()
            }}
            >
                <fieldset className="theme-l adaptive">
                    <legend>Register</legend>
                    <div className="input-group mp-3">
                        <label htmlFor="email" className="input-group-text">Email:</label>
                        <input id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="your@email.com" autoComplete='email' required/>
                    </div>
                    <div className="input-group mp-3">
                        <label htmlFor="username" className="input-group-text">Username:</label>
                        <input autoComplete="off" id="username" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="username" required/>
                    </div>
                    <div className="input-group mp-3">
                        <label htmlFor="displayname" className="input-group-text">Display Name:</label>
                        <input id="displayname" className="form-control" value={displayname} onChange={(e) => setDisplayname(e.target.value)} type="text" placeholder="Display Name"/>
                    </div>
                    <div className="input-group mp-3">
                        <label htmlFor="new-password" className="input-group-text">Password:</label>
                        <input id="new-password" autoComplete='new-password' className="form-control" type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password" required/>
                    </div>
                    <div className="input-group mp-3">
                        <span htmlFor="confirm-password" className="input-group-text">Confirm Password:</span>
                        <input id="confirm-password" className="form-control" autoComplete='new-password' type="password" onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" required/>
                    </div>
                    
                    
                        <div className="btn-group">
                            <Button type="submit" variant="primary" disabled={isFormValid()} >
                                Register
                            </Button>
                            <Button variant="secondary" onClick={()=> navigate('/login') }>Cancel</Button>
                        </div>
                    
                    
                    <div>
                        <label htmlFor="remember-me">Stay Signed in?</label>
                        <input 
                            type="checkbox"
                            id="remember-me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                    </div>

                    {displayError && <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />}

                </fieldset>
            </form>
        </main>
        );
}
