import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { NavLink } from 'react-router-dom';
import "../worldbuilding.css";


import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
export function Organizations() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    
    return (
    <main className="worldbuilding">
        <div className="theme-h adaptive textbody">
                <h1>Organizations</h1>
                <aside> 
                    Here is where you will put the organizations you create. Why isn't it under worlds or countries? 
                    World Hopping is possible, even between branches of the same story, or even to another universe entirely. 
                    So your organizations doesn't have to remain on one world or one branch of the World Tree. Religions would be included in Organizations.
                    If your organization is multiversal, use The origin world as the world, and put the classNameification as multiversal.
                </aside> 
            </div>
            <button className="btn btn-primary button-align" onClick={handleOpen} data-bs-toggle="offcanvas" data-bs-target="#offcanvasOrganization" aria-controls="offcanvasOrganization">New Organization</button>
            <Offcanvas className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasOrganization" aria-labelledby="offcanvasOrganizationLabel">
                
                <OffcanvasHeader show={visible} className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasOrganizationtLabel">New Organization</h4>
                    <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newOrganization">
                    <div className="form-popup" id="newOrganization">
                        <form className="form-container">
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="name">Name:</label>
                                <input className="form-control" type="text" placheolder="name" name="name" required/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="world">World:</label>
                                <select className="form-select" placheolder="world" name="type"> 
                                    <option defaultValue>Choose a world</option>
                                    <option>The Void</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="type">Type:</label>
                                <input className="form-control" type="text" placheolder="Religion, Guild, Gang, institution, etc." name="type" required/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="classNameification">classNameification:</label>
                                <select className="form-select" placheolder="classNameification" name="classNameification"> 
                                    <option defaultValue>Uni-world</option>
                                    <option>Multiversal</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="leaders">Leader(s):</label>
                                <input className="form-control" type="text" placheolder="leader(s)" name="leaders" required/> 
                            </div>
                            
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="descripton">Description:</label>
                                <textarea className="form-control" id="description" placheolder="Describe your Country" name="description" required> </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="history">History:</label>
                                <textarea className="form-control" id="history" placheolder="tell us about the history" name="history"> </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="goals">Goals:</label>
                                <textarea className="form-control" id="goals" placheolder="What are the goals" name="goals" > </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="race">Race(s):</label>
                                <input className="form-control" type="text" placheolder="race" name="race"/> 

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="members">members:</label>
                                <input className="form-control" type="text" placheolder="Members" name="members"/> 
                            </div>
                                                       
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="allies">allies:</label>
                                <input className="form-control" type="text" placheolder="Ally" name="allies"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="enemies">Enemies:</label>
                                <input className="form-control" type="text" placheolder="Enemy" name="enemies"/> 
                            </div>

                            
                            <div className="btn-group">
                                <button className="btn btn-primary" type="submit">Create</button>
                                <button onClick={handleClose} type="button" className="btn btn-secondary cancel" data-bs-dismiss="offcanvas" aria-label="Close">Cancel</button>
                            </div>
                        </form>
    
                    </div>

                </OffcanvasBody>
            </Offcanvas>
            
            
            <div className="theme-h adaptive expanded">
                
                <form className="filterAndSort" action="" method="get">
                    <h4>Filter:</h4>
                    <div className="input-group mb-3">
                        <label className="input-group-text"htmlFor="world">World </label>
                        <select className="form-select" id="world" name="varWorld">
                            <option defaultValue>All</option>
                            <option>The Void</option>
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <label className="input-group-text"htmlFor="type">Type </label>
                        <select className="form-select" id="type" name="varType">
                            <option defaultValue>All</option>
                            <option>Religion</option>
                            <option>Guild</option>
                            <option>Institution</option>
                        </select>
                    </div>
                    
                    <div className="input-group mb-3">
                         <label className="input-group-text" htmlFor="author">Author </label>
                        <select className="form-select" id="author" name="varAuthor">
                            <option defaultValue>All</option>
                            <option>Spencer Zaugg</option>
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <label className="input-group-text" htmlFor="sort">Sort </label>
                        <select className="form-select" id="sort" name="varSort">
                            <option defaultValue>Popular</option>
                            <option>New to Old</option>
                            <option>Old to New</option>
                            <option>A-Z Name</option>
                            <option>Z-A Name</option>
                            <option>A-Z Leader</option>
                            <option>Z-A Leader</option>
                            <option>A-Z Author</option>
                            <option>Z-A Author</option>
                            <option>A-Z World</option>
                            <option>Z-A World</option>
                        </select>
                    </div>
                   
                    
                </form>
            </div>
            <div className="card-columns d-flex" id="wildlife">
                <div className="card" style={{width: "18rem"}}>
                    <div className="card-header theme-c adaptive">
                        <h4><NavLink className="card-link" to="projectyggdrasil">Project Yggdrasil</NavLink></h4>
                    </div>
                    <div className="card-body theme adaptive">
                        <h5 className="card-title"><NavLink className="card-link" to="/worldbuilding/worlds/thevoid">The Void</NavLink></h5>
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            Type: Multiversal
                            <br />

                        </p>

                    </div>
                    
                </div>              
            </div>

            

    </main>);
}