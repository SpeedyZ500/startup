import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes, Link} from 'react-router-dom';

import { AuthState } from '../login/authState';
import "../worldbuilding/worldbuilding.css";
import Button from 'react-bootstrap/Button';



import NavDropdown from 'react-bootstrap/NavDropdown';

export function BaseNav({userName, authState, logout}) {

    return (
        <menu className="navbar-nav" id="navbar-desktop">
            <div className="navbar-left">
                <li className="nav-item">
                    <NavLink className="nav-link" to="/stories">Stories</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="nav-link" to="/writingprompts">Writing Prompts</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="nav-link" to="/characters">Characters</NavLink>
                </li>
                <NavDropdown title="World Building" id="collapsible-nav-dropdown">
                    <NavDropdown.Item as={NavLink} to="/worldbuilding/">Overview</NavDropdown.Item>
                    <NavDropdown.Divider/>
                    <NavDropdown.Item as={NavLink} to="/worldbuilding/magicsystems">Magic Systems</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to="/worldbuilding/races">Races</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to="/worldbuilding/countries">Countries</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to="/worldbuilding/wildlife">Wildlife</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to="/worldbuilding/flora">Flora</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink}  to="/worldbuilding/worlds">Worlds</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink}  to="/worldbuilding/organizations">Organizations</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink}  to="/worldbuilding/biomes">Biomes</NavDropdown.Item>

                </NavDropdown>
                
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
                        <input className="form-control" type="search" placeholder="Search" aria-label="Search" id="search" />
                        <button className="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </li>
                {authState === AuthState.Authenticated &&
                    <NavDropdown title={userName}>
                        <NavDropdown.Item as={NavLink} to="/settings" >settings</NavDropdown.Item>
                        <NavDropdown.Item to="" ><Button variant="secondary"onClick={() => logout()}>Logout</Button></NavDropdown.Item>
                    </NavDropdown>
                }
                {authState === AuthState.Unauthenticated &&
                    <li className="nav-item" id="log-in">
                        <NavLink className="nav-link"  to="/login">log-in</NavLink>
                    </li>
                }
            </div>
            
        </menu>);
}

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

export function WorldNav({userName, authState, logout}) {
    return (
        
            <menu className="navbar-nav" id="navbar-desktop">
                <div className="navbar-left">
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/stories">Stories</NavLink>
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
                    {authState === AuthState.Authenticated &&
                        <NavDropdown title={userName}>
                            <NavDropdown.Item as={NavLink} to="/settings" >settings</NavDropdown.Item>
                            <NavDropdown.Item to="" ><Button variant="secondary"onClick={() => logout()}>Logout</Button></NavDropdown.Item>
                        </NavDropdown>
                    }
                    {authState === AuthState.Unauthenticated &&
                        <li className="nav-item" id="log-in">
                            <NavLink className="nav-link"  to="/login">log-in</NavLink>

                        </li>
                    }
                </div>
                
            </menu>
            
        );
}