import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./login.css";

export function Login() {
    return (
        <main class="container-fluid text-center">
        <fieldset class="theme-l adaptive">
            <form method="get" action="index.html">
                <legend>Log-In</legend>
                <div class="input-group mp-3">
                    <span class="input-group-text">Username/Email:</span>
                    <input class="form-control" type="text" placeholder="username/your@email.com"/>
                </div>
                <div class="input-group mp-3">
                    <span class="input-group-text">Password:</span>
                    <input class="form-control" type="password" placeholder="password"/>
                </div>
                
                
                <div class="btn-group">
                    <button type="submit" class="btn btn-primary">Login</button>
                    <button type="submit" class="btn btn-secondary">Create</button>
                </div>
                
                <div>
                    <span>Stay Signed in?</span>
                    <input type="checkbox" />
                </div>
            </form>
        </fieldset>
    </main>);
}