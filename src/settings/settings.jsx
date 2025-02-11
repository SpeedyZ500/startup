import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';

export function Settings() {
    return (
    <main>
        
        <h1 className="theme-h adaptive expanded text-center">Settings</h1>
        <div className="settings">
                
            <form className="theme-h adaptive" action="/save-settings" method="post">
                <lable htmlFor="username">Username:</lable>
                <input type="text" id="username" name="username" value="ueser123"/>
                <br />
                <br />
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="profanityFilter" checked/>
                    <lable htmlFor="ProfanityFilter">Profanity Filter</lable>
                    </div>
                <div className="input-group mb-3">
                    <label className="input-group-text" htmlFor="displayPreferences">Display Preferences</label>
                        <select className="form-select" id="displayPreferences" name="varDisplay">
                            <option selected>Same as System</option>
                            <option>Light Mode</option>
                            <option>Dark Mode</option>
                        </select>
                    </div>
                    <div className="btn-group">
                        <input className="btn btn-primary" type="submit" value="Save Settings"/>
                        <input className="btn btn-secondary" type="button" value="Reset to Default"/>
    
                    </div>


                </form>
                
                <hr />
                <h6 className="theme-h adaptive">Reset Password</h6>
                <form className="theme-h adaptive"action="/change-password" method="post">
                    <form action="/check-password" method="get">
                        <div className="input-group mp-3">
                            <span className="input-group-text">Old Password:</span>
                            <input className="form-control" type="password" placeholder="password"/>
                        </div>
                    </form>
                    
                    <div className="input-group mp-3">
                        <span className="input-group-text">New Password:</span>
                        <input className="form-control" type="password" placeholder="password"/>
                    </div>
                    <div className="input-group mp-3">
                        <span className="input-group-text">Confirm New Password:</span>
                        <input className="form-control" type="password" placeholder="password"/>
                    </div>
                    <input className="btn btn-primary" type="submit" value="Change Password" title="Change password" />
                    

                </form>
            </div>
    </main>);
}