import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useState, useEffect, Fragment } from 'react';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';

export function Settings(props) {
    const [userData, setUserData] = useState({})
    const [displayName, setDisplayName] = useState(props.user.displayname || "");
    const [savedName, setSavedName] = useState(null); 
  
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [filterProf, setFilterProf] = useState(props.user.profanityFilter || true);
    const handleProfanityToggle = async (e) => {
        const newFilterState = e.target.checked; // Get updated value
    
        setFilterProf(newFilterState); // Update local state immediately
    
        try {
            const res = await fetch('/api/user/prof', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profanityFilter: newFilterState }),
            });
    
            if (res.ok) {
                const data = await res.json();
                props.onFilterUpdate(data); // Update parent component state if needed
            } else {
                console.error("Failed to update profanity filter:", res.statusText);
            }
        } catch (err) {
            console.error("Error updating profanity filter:", err);
        }
    };

    const handleUpdatePassword = async (e) => {
        const newFilterState = e.target.checked; // Get updated value
    
        setFilterProf(newFilterState); // Update local state immediately
    
        try {
            const res = await fetch('/api/user/pass', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword: oldPassword, newPassword:newPassword, confirmPassword:confirmPassword}),
            });
    
            if (res.ok) {
            } else {
                console.error("Failed to change password:", res.statusText);
            }
        } catch (err) {
            console.error("Error updating changing password:", err);
        }
    };

    const changeDisplayName = async (e) => {
        const newFilterState = e.target.checked; // Get updated value
    
        setFilterProf(newFilterState); // Update local state immediately
    
        try {
            const res = await fetch('/api/user/pass', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayname:displayName}),
            });
    
            if (res.ok) {
                const data = await res.json();
                props.onFilterUpdate(data); // Update parent component state if needed
            } else {
                console.error("Failed to change password:", res.statusText);
            }
        } catch (err) {
            console.error("Error updating changing password:", err);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setSavedName(displayName)
        //will need to set the Display name in userData
    }
    const changePassword = (e) => {
        //will need to add in the setting password, however that will be after we have a password to compare to
        
        

    }
    return (
    <main>
        
        <h1 className="theme-h adaptive expanded text-center">Settings</h1>
        <div className="settings">
            <h1>Username:{props.user.username}</h1>
                
                <form className="theme-h adaptive" onSubmit={changeDisplayName} method="post">
                    <label htmlFor="username">Display Name:</label>
                    <input type="text" id="username" name="username" value={displayName} placeholder="your Display Name"/>
                    <br />
                    <br />
                
                        <div className="btn-group">
                            <input className="btn btn-primary" type="submit" value="Save Settings"/>
                            <input className="btn btn-secondary" type="button" value="Reset to Default"/>
        
                        </div>


                </form>
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="profanityFilter" checked={filterProf} onChange={handleProfanityToggle}/>
                    <label htmlFor="profanityFilter">Profanity Filter</label>
                </div>
                
                <hr />
                <h6 className="theme-h adaptive" >Reset Password</h6>
                <form className="theme-h adaptive" onSubmit={handleUpdatePassword} method="post">
                        <div className="input-group mp-3">
                            <span className="input-group-text">Old Password:</span>
                            <input className="form-control" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} type="password" placeholder="password"/>
                        </div>
                    
                    <div className="input-group mp-3">
                        <span className="input-group-text">New Password:</span>
                        <input className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="password"/>
                    </div>
                    <div className="input-group mp-3">
                        <span className="input-group-text">Confirm Password:</span>
                        <input className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="password"/>
                    </div>
                    <input className="btn btn-primary" disabled={confirmPassword !== newPassword || newPassword.length < 8 /** will need to check for old password matching, deal with that later */} type="submit" value="Change Password" title="Change password" />
                    

                </form>
            </div>
    </main>);
}