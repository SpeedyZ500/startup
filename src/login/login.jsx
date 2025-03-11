import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./login.css";
import { MessageDialog } from './messageDialog';
import { Link, useNavigate} from 'react-router-dom'; 




export function Login(props) {
    const [username, setUsername] = React.useState(props.username);
    const [password, setPassword] = React.useState('');
    const [displayError, setDisplayError] = React.useState(null);

    function handleRegister() {
        const json = JSON.stringify({username, password});
        createAuth('PUT', json);
    }

    async function loginUser() {
      localStorage.setItem('username', username);
      props.onLogin(username);
    }
  
    async function createUser() {
      localStorage.setItem('username', username);
      props.onLogin(username);
    }
    return (
        <main className="container-fluid text-center">
            <fieldset className="theme-l adaptive">
                <form method="get">
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
                            <button onClick={() => loginUser()} className="btn btn-primary" disabled={!username || !password} >Login</button>
                            <button className="btn btn-secondary" onClick={()=> createServerModuleRunner() } to="/" disabled={!username || !password}>Create</button>
                        </div>
                    
                    
                    <div>
                        <span>Stay Signed in?</span>
                        <input type="checkbox" />
                    </div>

                    <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />

                </form>
            </fieldset>
        </main>);
}


async function createAuth(method, json){
    const navigate = useNavigate();
    const res = await fetch('api/auth', {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: json,
    });
    await res.json();
    if(res.ok){
        navigate('/');
    }
    else{
        alert('Authentication failed');
    }
}
export function Register(){
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [displayname, setDisplayname] = useState('');

    function handleRegister() {
        const json = JSON.stringify({email, username, password, displayname});
        createAuth('POST', json);
    }
   

}
