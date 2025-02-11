import React from 'react';
import "./worldbuilding.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';

export function SubNav(){
    return(
        <nav className="navbar secondary theme-h adaptive">
                <menu className="navbar-nav" id="worldbuilding" >
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/worldbuilding">Overview</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/worldbuilding/magicsystems">Magic Systems</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/worldbuilding/races">Races</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/worldbuilding/countries">Countries</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/worldbuilding/wildlife">Wildlife</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/worldbuilding/flora">Flora</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/worldbuilding/worlds">Worlds</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/worldbuilding/organizations">Organizations</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/worldbuilding/biomes">Biomes</NavLink>
                    </li>
                </menu>
            </nav>
);
}

export function WorldNav() {
    return (
        
            <menu className="navbar-nav" id="navbar-desktop">
                <div className="navbar-left">
                    <li className="nav-item">
                        <NavLink className="nav-link active" to="/stories">Stories</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/writingprompts">Writing Prompts</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/characters">Characters</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link active" to="#">
                            World Building
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/writingadvice">Writing Advice</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/about">About</NavLink>
                    </li>
                </div>
                
                
                
                <div className="right">
                    <li className="nav-item navbar-right">
                        <form className="d-flex" role="search">
                            <input className="form-control" type="search" placeholder="Search" aria-label="Search" />
                            <button className="btn btn-outline-success" type="submit">Search</button>
                        </form>
                    </li>
                    <li className="nav-item navbar-right" id="settings">
                        <NavLink className="nav-link" to="/settings">
                            settings   
                        </NavLink>
                    </li>
                    <li className="nav-item navbar-right" id="log-in">
                        <NavLink className="nav-link" to="/login">log-in</NavLink>
                    </li>
                </div>
                
            </menu>
            
        );
}