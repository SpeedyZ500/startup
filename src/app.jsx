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
import { Worlds}  from './worldbuilding/worlds/worlds';
import { Biomes}  from './worldbuilding/biomes/biomes';
import { Countries}  from './worldbuilding/countries/countries';
import { Flora}  from './worldbuilding/flora/flora';
import { MagicSystems}  from './worldbuilding/magicsystems/magicsystems';
import { Organizations}  from './worldbuilding/organizations/organizations';
import { Races}  from './worldbuilding/races/races';
import { Wildlife}  from './worldbuilding/wildlife/wildlife';
import { WorldBio } from './worldbuilding/worlds/worldbio/worldbio';
import { WildlifeBio } from './worldbuilding/wildlife/wildlifebio/wildlifebio';
import {RaceBio} from './worldbuilding/races/racebio/racebio';
import { OrganizationBio } from './worldbuilding/organizations/organizationbio/organizationbio';
import { MagicSystemBio } from './worldbuilding/magicsystems/magicsystembio/magicsystembio';
import { FloraBio } from './worldbuilding/flora/florabio/florabio';
import { CountryBio } from './worldbuilding/countries/countrybio/countrybio';
import { BiomeBio } from './worldbuilding/biomes/biomebio/biomebio';
import { StoryPage } from './stories/storypage/storypage';
import { Chapter } from './stories/storypage/chapter/chapter';
import { CharacterBio } from './characters/charaterbio/characterbio';
import NavDropdown from 'react-bootstrap/NavDropdown';







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
                                <Route path='/*' element={< BaseNav/>}/>
                                <Route path='/worldbuilding/*' element={<WorldNav />} />
                                <Route path='/login' element={<></>} />

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
                                                <NavLink className="nav-link" to="/stories">Stories</NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink className="nav-link" to="/writingprompts">Writing Prompts</NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink className="nav-link" to="/characters">Characters</NavLink>
                                            </li>
                                            <NavDropdown title="World Building" id="collapsible-nav-dropdown">
                                                <NavDropdown.Item><NavLink className="dropdown-item" to="/worldbuilding/">Overview</NavLink></NavDropdown.Item>
                                                <NavDropdown.Divider/>
                                                <NavDropdown.Item><NavLink className="dropdown-item" to="/worldbuilding/magicsystems">Magic Systems</NavLink></NavDropdown.Item>
                                                <NavDropdown.Item><NavLink className="dropdown-item" to="/worldbuilding/races">Races</NavLink></NavDropdown.Item>
                                                <NavDropdown.Item><NavLink className="dropdown-item" to="/worldbuilding/countries">Countries</NavLink></NavDropdown.Item>
                                                <NavDropdown.Item><NavLink className="dropdown-item" to="/worldbuilding/wildlife">Wildlife</NavLink></NavDropdown.Item>
                                                <NavDropdown.Item><NavLink className="dropdown-item" to="/worldbuilding/flora">Flora</NavLink></NavDropdown.Item>
                                                <NavDropdown.Item><NavLink className="dropdown-item" to="/worldbuilding/worlds">Worlds</NavLink></NavDropdown.Item>
                                                <NavDropdown.Item><NavLink className="dropdown-item" to="/worldbuilding/organizations">Organizations</NavLink></NavDropdown.Item>
                                                <NavDropdown.Item><NavLink className="dropdown-item" to="/worldbuilding/biomes">Biomes</NavLink></NavDropdown.Item>

                                            </NavDropdown>
                                            
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
                    <Route path='login' element={<Login />} />
                    <Route path='about' element={<About />} />
                    <Route path='worldbuilding'>
                        <Route path='' element={<WorldBuilding/>} />
                        <Route path='magicsystems'>
                            <Route path='' element={<MagicSystems />}/>
                            <Route path=":id" element={<MagicSystemBio/>}/>

                        </Route>
                        <Route path='races'>
                            <Route path=''element={<Races />}/>
                            <Route path=":id" element={<RaceBio/>}/>

                        </Route>
                        <Route path='countries'>
                            <Route path=''element={<Countries />}/>
                            <Route path=":id" element={<CountryBio/>}/>

                        </Route>
                        <Route path='wildlife'>
                            <Route path=''element={<Wildlife />}/>
                            <Route path=":id" element={<WildlifeBio/>}/>

                        </Route>
                        <Route path='flora'>
                            <Route path=''element={<Flora />}/>
                            <Route path=":id" element={<FloraBio/>}/>

                        </Route>
                        <Route path='worlds'>
                            <Route path=''element={<Worlds />}/>
                            <Route path=":id" element={<WorldBio/>}/>

                        </Route>
                        <Route path='organizations'>
                            <Route path=''element={<Organizations />}/>
                            <Route path=":id" element={<OrganizationBio/>}/>

                        </Route>
                        <Route path='biomes'>
                            <Route path=''element={<Biomes />}/>
                            <Route path=":id" element={<BiomeBio/>}/>
                        </Route>


                        
                        
                    </Route>
                    <Route path='stories'>
                        <Route path=''element={<Stories />}/>
                        <Route path='*/chapter/*' element={<Chapter/>}/>
                        <Route path=':id'>
                            <Route path='' element={<StoryPage/>}/>


                            <Route path=":id"element={<Chapter/>}/>
                            
                        </Route>
                    </Route>

                    <Route path='writingprompts' element={<WritingPrompts />} />
                    
                    <Route path='writingadvice' element={<WritingAdvice />} />
                    
                    <Route path='characters'>
                        <Route path=''element={<Characters />}/>
                        <Route path=':id' element={<CharacterBio />}/>
                    </Route>
                    <Route path='settings' element={<Settings />} />
                    

                    
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