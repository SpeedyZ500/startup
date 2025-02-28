import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./login.css";
import { MessageDialog } from './messageDialog';
import { Link } from 'react-router-dom'; 


export function Login(props) {
    const [userName, setUserName] = React.useState(props.userName);
    const [password, setPassword] = React.useState('');
    const [displayError, setDisplayError] = React.useState(null);
  
    async function loginUser() {
      localStorage.setItem('userName', userName);
      props.onLogin(userName);
    }
  
    async function createUser() {
      localStorage.setItem('userName', userName);
      props.onLogin(userName);
    }
    return (
        <main className="container-fluid text-center">
        <fieldset className="theme-l adaptive">
            <form method="get">
                <legend>Log-In</legend>
                <div className="input-group mp-3">
                    <span className="input-group-text">Username/Email:</span>
                    <input className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)} type="text" placeholder="username/your@email.com"/>
                </div>
                <div className="input-group mp-3">
                    <span className="input-group-text">Password:</span>
                    <input className="form-control" type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password"/>
                </div>
                
                
                <Link to="/">
                    <div className="btn-group">
                        <button onClick={() => loginUser()} className="btn btn-primary" disabled={!userName || !password} >Login</button>
                        <button className="btn btn-secondary" onClick={()=> createServerModuleRunner() } to="/" disabled={!userName || !password}>Create</button>
                    </div>
                </Link>
                
                <div>
                    <span>Stay Signed in?</span>
                    <input type="checkbox" />
                </div>

                <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />

            </form>
        </fieldset>
    </main>);
}