import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { NavLink } from 'react-router-dom';

import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
export function Wildlife() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    
    return (
    <main className="worldbuilding">
        <div className="theme-h adaptive textbody">
                <h1>Wildlife</h1>
                <aside>
                    This is all about the creatures, critters and monsters you create, their abilities and natural habitats.
                </aside>
            </div>
            
            <button className="btn btn-primary button-align" onClick={handleOpen} data-bs-toggle="offcanvas" data-bs-target="#offcanvasWildlife" aria-controls="offcanvasWildlife">New Wildlife</button>
            <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasWildlife" aria-labelledby="offcanvasWildlifeLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasWildlifetLabel">New Wildlife</h4>
                    <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newWildlife">
                    <div className="form-popup" id="newWildlife">
                        <form className="form-container">
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="name">Name:</label>
                                <input className="form-control" type="text" placheolder="name" name="name" required/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="world">Origin World:</label>
                                <select className="form-select" placheolder="world" name="type"> 
                                    <option defaultValue>Choose a world</option>
                                    <option>The Void</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="type">Type:</label>
                                <input className="form-control" type="text" placheolder="Monster, Bird, rodent, etc." name="type" required/> 
                            </div>
                            
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="descripton">Description:</label>
                                <textarea className="form-control" id="description" placheolder="Describe your Wildlife" name="description" required> </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="abilities">Abilities:</label>
                                <input className="form-control" type="text" placheolder="what abilities does it have? is it poisonous? Venomous?" name="abilities"/> 
                            </div>

                          
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="worlds">Worlds:</label>
                                <input className="form-control" type="text" placheolder="What worlds does your wildlife appear in" name="worlds"/> 
                            </div>
                            <div className="input-group">s
                                <label className="input-group-text" htmlFor="biomes">Biome(s):</label>
                                <input className="form-control" type="text" placheolder="What boimes does your wildlife like?" name="biomes"/> 
                            </div>
                        
                            <div className="btn-group">
                                <button className="btn btn-primary" type="submit">Create</button>
                                <button type="button" className="btn btn-secondary cancel" data-bs-dismiss="offcanvas" aria-label="Close">Cancel</button>
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
                            <option>Monster</option>
                            

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
                            <option>A-Z Author</option>
                            <option>Z-A Author</option>
                            <option>A-Z World</option>
                            <option>Z-A World</option>
                        </select>
                    </div>
                   
                    
                </form>
            </div>
            <div className="card-columns my-container" id="wildlife">
                <div className="card" style={{width: "18rem"}}>
                    <div className="card-header theme-c adaptive">
                        <h4><NavLink className="card-link" to="voidreacher">Void Reacher</NavLink></h4>
                    </div>
                    <div className="card-body theme adaptive">
                        <h5 className="card-title"><NavLink className="card-link" to="/worldbuilding/worlds/thevoid">The Void</NavLink></h5>
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            Type: Monster <br />
                            DATA WAITING APPROVAL
                        </p>
                    </div>
                    
                </div>              
            </div>

    </main>);
}