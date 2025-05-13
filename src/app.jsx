import React from 'react';
import { useState, useEffect } from 'react';

import './app.css';
import { BrowserRouter, NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { Login, Register } from './login/login';
import { BaseNav, WorldNav, SubNav } from './nav/nav';
import { Home } from './home/home';
import { About } from './about/about';
import { Settings } from './settings/settings';
import { WorldBuilding } from './worldbuilding/worldbuilding/worldbuilding';
import { StoryPage } from './stories/storypage';
import { Chapter } from './stories/chapter/chapter';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { BioPage } from './biopage/biopage';
import { CategoryPage } from './categorypage/categorypage';
import { AuthState } from './login/authState';
import {HardRedirect} from './utility/utility.jsx'






import Dropdown from 'bootstrap/js/dist/dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';



var offcanvasElementList = [].slice.call(document.querySelectorAll('.offcanvas'))
var offcanvasList = offcanvasElementList.map(function (offcanvasEl) {
return new bootstrap.Offcanvas(offcanvasEl)
})

const worldbuildingCategories = [
    "magicsystems",
    "races",
    "countries",
    "wildlife",
    "flora",
    "worlds",
    "organizations",
    "biomes"
];


export default function App() {
    //const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
    const [user, setUser] = useState({})
    useEffect(() => {
        fetch("/api/user/me")
            .then((res) => {
                if(!res.ok){
                    throw new Error("User not authenticated");
                }
                return res.json()
            })
            .then((data) => {
                setUser(data)
            })
            .catch(() => {
                setUser({});
            })
    }, [])
    const [authState, setAuthState] = useState(AuthState.Unauthenticated)
    const [profanityFilter, setProfanityFilter] = useState(true);
    useEffect(() => {
        const isEmpty = Object.keys(user).length === 0;
        if (isEmpty) {
            setAuthState(AuthState.Unauthenticated);
            setProfanityFilter(true);
          } else {
            setAuthState(AuthState.Authenticated);
            setProfanityFilter(!!user.profanityFilter); // from server
          }
    },[user])

    

    // React.useEffect(() => {
    //     (async () => {
    //       const res = await fetch('api/user/me', {credentials:'include'});
    //       if(res.status === 401){
    //         localStorage.removeItem("user");
    //         onAuthChange(user, AuthState.Unauthenticated)
    //       }
    //       else if (res.ok) {
    //         const data = await res.json();
    //         setUser(data);
    //         localStorage.setItem("user", JSON.stringify(data));
    //         setAuthState(AuthState.Authenticated);
    //       }
    //     })();
    //   }, []);


    const [show, setShow] = useState(false);

 
    const handleHide = () => setShow(false);
 
    const handleShow = () => setShow(true);
    
    
    function logout(){
        fetch(`/api/auth/logout`, {
            method: 'DELETE',
        })
        setUser({});
    }
    function updateProfanityFilter(updateUser){
        localStorage.setItem("user", JSON.stringify(updateUser));
        setUser(updateUser);
    }


    return (
        <BrowserRouter>
            <div className='body theme adaptive'>
                <header className="">
                    <div className="container-fluid fixed-top"  >
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
                                    <Route path='/*' element={< BaseNav authState={authState} user={user} logout={logout}/>}/>
                                    <Route path='/worldbuilding/*' element={<WorldNav authState={authState} user={user} logout={logout}/>} />
                                </Routes>
                                
                                <div id="mobile"> 
                                    <Button className="navbar-toggler float-right" variant="primary"  type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" onClick={handleShow}>
                                        <span className="navbar-toggler-icon"></span>
                                    </Button>
                                    <Offcanvas className="offcanvas-end" placement="end"  tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" show={show} onHide={handleHide}>
                                        <OffcanvasHeader className="offcanvas-header" >
                                            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Project Yggdrasil</h5>
                                            <Button type="button" className="btn-close"  data-bs-dismiss="offcanvas" aria-label="Close" onClick={handleHide}></Button>
                                        </OffcanvasHeader>
                                        <OffcanvasBody className="offcanvas-body">
                                            <menu className="navbar-nav justify-content-end">
                                    
                                                <li className="nav-item">
                                                    <NavLink className="nav-link" onClick={handleHide} to="/stories">Stories</NavLink>
                                                </li>
                                                <li className="nav-item">
                                                    <NavLink className="nav-link" onClick={handleHide} to="/writingprompts">Writing Prompts</NavLink>
                                                </li>
                                                <li className="nav-item">
                                                    <NavLink className="nav-link" onClick={handleHide} to="/characters">Characters</NavLink>
                                                </li>
                                                <NavDropdown title="World Building" id="collapsible-nav-dropdown">
                                                    <NavDropdown.Item><NavLink onClick={handleHide} className="dropdown-item" to="/worldbuilding">Overview</NavLink></NavDropdown.Item>
                                                    <NavDropdown.Divider/>
                                                    <NavDropdown.Item><NavLink onClick={handleHide} className="dropdown-item" to="/worldbuilding/magicsystems">Magic Systems</NavLink></NavDropdown.Item>
                                                    <NavDropdown.Item><NavLink onClick={handleHide} className="dropdown-item" to="/worldbuilding/races">Races</NavLink></NavDropdown.Item>
                                                    <NavDropdown.Item><NavLink onClick={handleHide} className="dropdown-item" to="/worldbuilding/countries">Countries</NavLink></NavDropdown.Item>
                                                    <NavDropdown.Item><NavLink onClick={handleHide} className="dropdown-item" to="/worldbuilding/wildlife">Wildlife</NavLink></NavDropdown.Item>
                                                    <NavDropdown.Item><NavLink onClick={handleHide} className="dropdown-item" to="/worldbuilding/flora">Flora</NavLink></NavDropdown.Item>
                                                    <NavDropdown.Item><NavLink onClick={handleHide} className="dropdown-item" to="/worldbuilding/worlds">Worlds</NavLink></NavDropdown.Item>
                                                    <NavDropdown.Item><NavLink onClick={handleHide} className="dropdown-item" to="/worldbuilding/organizations">Organizations</NavLink></NavDropdown.Item>
                                                    <NavDropdown.Item><NavLink onClick={handleHide} className="dropdown-item" to="/worldbuilding/biomes">Biomes</NavLink></NavDropdown.Item>

                                                </NavDropdown>
                                                
                                                <li className="nav-item">
                                                    <NavLink className="nav-link" onClick={handleHide} to="/writingadvice">Writing Advice</NavLink>
                                                </li>
                                                <li className="nav-item">
                                                    <NavLink className="nav-link" onClick={handleHide} to="/about">About</NavLink>
                                                </li>
                                                <li className="nav-item">
                                                    <form className="d-flex" role="search">
                                                        <input className="form-control" type="search" placeholder="Search" aria-label="Search" id="search" />
                                                        <button className="btn btn-outline-success" type="submit">Search</button>
                                                    </form>
                                                </li>
                                                {authState === AuthState.Authenticated &&
                                                    <NavDropdown title={user.displayname}>
                                                        <NavDropdown.Item as={NavLink} to="/settings" onClick={handleHide}>settings</NavDropdown.Item>
                                                        <NavDropdown.Item to="" onClick={handleHide}><Button variant="secondary"onClick={() => logout()}>Logout</Button></NavDropdown.Item>
                                                </NavDropdown>
                                                }
                                                {authState === AuthState.Unauthenticated &&
                                                    <li className="nav-item" id="log-in">
                                                        <NavLink className="nav-link" onClick={handleHide} to="/login">log-in</NavLink>

                                                    </li>
                                                }
                                            </menu>
                                        </OffcanvasBody>
                                    </Offcanvas>
                                </div>
                            
                        </nav>
                            <Routes>
                                <Route path='/worldbuilding/*' element={<SubNav />} />
                                <Route path='*' element={<></>} />
                            </Routes>
                        
                        
                    </div>
                    
                </header>
                <div className="scrollable">
                    <Routes>
                        <Route path='/' element={< Home/>} />
                        <Route path='/login' element={<HardRedirect to="/login"/>}/>
                        <Route path='about' element={<About />} />
                        <Route path='worldbuilding'>
                            <Route path='' element={<WorldBuilding/>} />
                            {worldbuildingCategories.map((category) => (
                                <Route key={category} path={category}>
                                    <Route path="" element={<CategoryPage profanityFilter={profanityFilter} authState={authState} user={user}/>} />
                                    <Route path=":id" element={<BioPage profanityFilter={profanityFilter} authState={authState} user={user}/>} />
                                </Route>
                            ))}
                            <Route path='*' element={<NotFound/>} />
                        </Route>
                        <Route path='stories'>
                            <Route path=''element={<CategoryPage profanityFilter={profanityFilter} authState={authState} user={user} />}/>
                            <Route path=':storyId'>
                                <Route path='' element={<StoryPage profanityFilter={profanityFilter} authState={authState} user={user}/>}/>
                                <Route path=":chapterId"element={<Chapter profanityFilter={profanityFilter} authState={authState} user={user}/>}/>
                                
                            </Route>
                        </Route>

                        <Route path='writingprompts' element={<CategoryPage profanityFilter={profanityFilter} authState={authState} user={user}/>} />
                        
                        <Route path='writingadvice' element={<CategoryPage  profanityFilter={profanityFilter} authState={authState} user={user}/>} />
                        
                        <Route path='characters'>
                            <Route path=''element={<CategoryPage profanityFilter={profanityFilter} authState={authState} user={user}/>}/>
                            <Route path=':id' element={<BioPage profanityFilter={profanityFilter} authState={authState} user={user}/>}/>
                        </Route>
                        <Route path='settings' element={<Settings user={user} onFilterUpdate={ updateProfanityFilter}/>} />
                        <Route path='*' element={<NotFound/>} />
                        

                        
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
function NotFound() {
    return <main className='container-fluid theme adaptive text-center' style={{padding:"20px", margin:"20px"}}>404: Return to sender. Address unknown.</main>;
}

