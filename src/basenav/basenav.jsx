import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown' 
import DropdownToggle from 'react-bootstrap/DropdownToggle'
import DropdownMenu from 'react-bootstrap/DropdownMenu'
import DropdownItem from 'react-bootstrap/DropdownItem'
import DropdownDivider from 'react-bootstrap/DropdownDivider'

export function BaseNav() {
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
                <Dropdown className="nav-item">
                    <DropdownToggle className="nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" id="dropdownMenuLink">
                        World Building
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu dropdown-menu-start"aria-labelledby="dropdownMenuLink">
                        <DropdownItem ><NavLink className="dropdown-item" to="/worldbuilding">Overview</NavLink></DropdownItem>
                        <DropdownItem>
                            <DropdownDivider className="dropdown-divider"/>
                        </DropdownItem>
                        <DropdownItem ClassName="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/magicsystems">Magic Systems</NavLink></DropdownItem>
                        <DropdownItem className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/races">Races</NavLink></DropdownItem>
                        <DropdownItem className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/countries">Countries</NavLink></DropdownItem>
                        <DropdownItem className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/wildlife">Wildlife</NavLink></DropdownItem>
                        <DropdownItem className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/flora">Flora</NavLink></DropdownItem>
                        <DropdownItem className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/worlds">Worlds</NavLink></DropdownItem>
                        <DropdownItem className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/organizations">Organizations</NavLink></DropdownItem>
                        <DropdownItem className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/biomes">Biomes</NavLink></DropdownItem>

                    </DropdownMenu>
                </Dropdown>
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
                <li className="nav-item navbar-right" id="settings">
                    <NavLink className="nav-link" to="/settings">
                        settings   
                    </NavLink>
                </li>
                <li className="nav-item navbar-right" id="log-in">
                    <NavLink className="nav-link" to="/login">log-in</NavLink>
                </li>
            </div>
            
        </menu>);
}