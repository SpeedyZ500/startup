import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./login.css";
import Button from 'react-bootstrap/Button';

import { MessageDialog } from './messageDialog';
import { Link, useNavigate} from 'react-router-dom'; 




export function Login(props) {
    const [username, setUsername] = React.useState(props.user ? props.user.username : '');

    const [password, setPassword] = React.useState('');
    const [displayError, setDisplayError] = React.useState(null);
    const navigate = useNavigate();

    function handleLogin() {
        const json = ({username:username, password:password});
        createAuth('PUT', json, "login", setDisplayError, navigate, props.onLogin);
    }

    
  
    
    return (
        <main className="container-fluid text-center">
            <fieldset className="theme-l adaptive">
                    <legend>Log-In</legend>
                    <div className="input-group mp-3">
                        <span className="input-group-text">Username/Email:</span>
                        <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="username/your@email.com"/>
                    </div>
                    <div className="input-group mp-3">
                        <span className="input-group-text">Password:</span>
                        <input className="form-control" type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password"/>
                    </div>
                    
                    
                        <div className="btn-group">
                            <button onClick={() => handleLogin()} className="btn btn-primary" disabled={!username || !password} >Login</button>
                            <button className="btn btn-secondary" onClick={()=> navigate('/login/register') }>Create</button>
                        </div>
                    
                    
                    <div>
                        <span>Stay Signed in?</span>
                        <input type="checkbox" />
                    </div>

                    {displayError && <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />}

            </fieldset>
        </main>);
}


async function createAuth(method, json, path, setDisplayError, navigate, onLogin){
    
    try{
        const res = await fetch(`/api/auth/${path}`, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(json),
        });
        if(res.ok){
            const user = await res.json();
            localStorage.setItem('user', JSON.stringify(user));
            onLogin(user);
      
            navigate('/');
        }
        else{
            let errorMessage = "An unknown error occurred";

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

export function Register(props){
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const [displayname, setDisplayname] = useState('');
    const [displayError, setDisplayError] = React.useState(null);
    const navigate = useNavigate();


    async function handleRegister() {
        if(password === confirm){
            const json = ({email:email, username:username, password:password, displayname:displayname});
            createAuth('POST', json, "register", setDisplayError, navigate, props.onLogin);    
        }
    }

    return (
        <main className="container-fluid text-center">
            <fieldset className="theme-l adaptive">
                    <legend>Register</legend>
                    <div className="input-group mp-3">
                        <span className="input-group-text">Email:</span>
                        <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="your@email.com"/>
                    </div>
                    <div className="input-group mp-3">
                        <span className="input-group-text">Username:</span>
                        <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="username"/>
                    </div>
                    <div className="input-group mp-3">
                        <span className="input-group-text">Display Name:</span>
                        <input className="form-control" value={displayname} onChange={(e) => setDisplayname(e.target.value)} type="text" placeholder="username"/>
                    </div>
                    <div className="input-group mp-3">
                        <span className="input-group-text">Password:</span>
                        <input className="form-control" type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password"/>
                    </div>
                    <div className="input-group mp-3">
                        <span className="input-group-text">Confirm Password:</span>
                        <input className="form-control" type="password" onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password"/>
                    </div>
                    
                    
                        <div className="btn-group">
                            <Button onClick={() => handleRegister()} variant="primary" disabled={!username || !password || password !== confirm || !email} >
                                Register
                            </Button>
                            <Button variant="secondary" onClick={()=> navigate('/login') }>Cancel</Button>
                        </div>
                    
                    
                    <div>
                        <span>Stay Signed in?</span>
                        <input type="checkbox" />
                    </div>

                    {displayError && <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />}

            </fieldset>
        </main>
        );
   

}
