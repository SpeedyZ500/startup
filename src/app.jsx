import React from 'react';
import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { BaseNav } from './basenav/basenav';
import { Home } from './home/home';
import { About } from './about/about';
import { Characters } from './characters/characters';
import { Settings } from './settings/settings';
import { Stories} from './stories/stories';
import { WritingPrompts } from './writingprompts/writingprompts';
import { WritingAdvice } from './writingadvice/writingadvice';
import { WorldNav, SubNav } from './worldbuilding/worldnav';
import { WorldBuilding } from './worldbuilding/worldbuilding/worldbuilding';

import Dropdown from 'bootstrap/js/dist/dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';



var offcanvasElementList = [].slice.call(document.querySelectorAll('.offcanvas'))
var offcanvasList = offcanvasElementList.map(function (offcanvasEl) {
return new bootstrap.Offcanvas(offcanvasEl)
})

export default function App() {

    const [show, setShow] = useState(false);

 
    const handleHide = () => setShow(false);
 
    const handleShow = () => setShow(true);
 
  return (
    <BrowserRouter>
        <div className='body theme adaptive'>
            <header className="">
                <div className="container-fluid fixed-top"  id="manNav">
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
                        <Routes>
                            <Route path='/*' element={< BaseNav/>}/>
                            <Route path='/worldbuilding/*' element={<WorldNav />} />
                            <Route path='/login' element={<></>} />

                        </Routes>
                        
                        <div id="mobile"> 
                            <Button className="navbar-toggler float-right" variant="primary"  type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" onClick={handleShow}>
                                <span className="navbar-toggler-icon"></span>
                            </Button>
                            <Offcanvas className="offcanvas-end" placement="end"  tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" show={show} onHide={handleHide}>
                                <OffcanvasHeader className="offcanvas-header" >
                                    <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Project Yggdrasil</h5>
                                    <Button type="button" className="btn-close"  data-bs-dismiss="offcanvas" aria-label="Close" onClick={handleHide}></Button>
                                </OffcanvasHeader>
                                <OffcanvasBody className="offcanvas-body">
                                    <menu className="navbar-nav justify-content-end">
                            
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to="/stories">Stories</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to="/writingprompts">Writing Prompts</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to="/characters">Characters</NavLink>
                                        </li>
                                        
                                        <li className="dropdown">
                                            <li className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                World Building
                                            </li>
                                            <menu className="dropdown-menu">
                                                <li ><NavLink className="dropdown-item" to="/worldbuilding">Overview</NavLink></li>
                                                <li>
                                                    <hr className="dropdown-divider" />
                                                </li>
                                                <li className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/magicsystems">Magic Systems</NavLink></li>
                                                <li className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/races">Races</NavLink></li>
                                                <li className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/countries">Countries</NavLink></li>
                                                <li className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/wildlife">Wildlife</NavLink></li>
                                                <li className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/flora">Flora</NavLink></li>
                                                <li className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/worlds">Worlds</NavLink></li>
                                                <li className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/organizations">Organizations</NavLink></li>
                                                <li className="dropdown-item"><NavLink className="dropdown-item" to="/worldbuilding/biomes">Biomes</NavLink></li>

                                            </menu>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to="/writingadvice">Writing Advice</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to="/about">About</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <form className="d-flex" role="search">
                                                <input className="form-control" type="search" placeholder="Search" aria-label="Search" id="search" />
                                                <button className="btn btn-outline-success" type="submit">Search</button>
                                            </form>
                                        </li>
                                        <li className="nav-item" id="settings">
                                            <NavLink className="nav-link" to="/settings">
                                                settings 
                                            </NavLink>
                                        </li>
                                        <li className="nav-item" id="log-in">
                                            <NavLink className="nav-link" to="/login">log-in</NavLink>
                                        </li>
                                    </menu>
                                </OffcanvasBody>
                            </Offcanvas>
                        </div>
                        <Routes>

                            <Route path='/worldbuilding/*' element={<SubNav />} />
                            <Route path='*' element={<></>} />
                        </Routes>
                    </nav>
                    
                </div>
                
            </header>
            <div className="scrollable">
                <Routes>
                    <Route path='/' element={< Home/>} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/worldbuilding' element={<WorldBuilding />} />

                    
                </Routes>

            
                <footer>
                    <hr />
                    <div className="container-fluid">
                        <span className="text-reset">Author Name:</span>
                        <aside>Spencer Zaugg</aside>
                        <a href="https://github.com/SpeedyZ500/startup.git"> GitHub</a>
                    </div>
                    
                </footer>
            </div>
    </div>
    </BrowserRouter>
  );
}