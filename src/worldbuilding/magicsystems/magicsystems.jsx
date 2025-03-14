import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export function MagicSystems() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    
    return (
    <main className="worldbuilding">
        <div className="theme-h adaptive textbody">
                <h1>Magic Systems</h1>
                <aside> How do people intereact with magic and stuff, this is also where SiFi technology should be found.
                    The reason SiFi technology should be here is because any significantly advanced technology is indistinguishable from magic.
                </aside> 
            </div>

            <button className="btn btn-primary button-align" onClick={handleOpen} data-bs-toggle="offcanvas" data-bs-target="#offcanvasMagicSystem" aria-controls="offcanvasMagicSystem">New Magic System</button>
            <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasMagicSystem" aria-labelledby="offcanvasMagicSystemLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasMagicSystemtLabel">New Magic System</h4>
                    <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newMagicSystem">
                    <div className="form-popup" id="newMagicSystem">
                        <form className="form-container">
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="name">Name:</label>
                                <input className="form-control" type="text" placheolder="name" name="name" required/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="world">world:</label>
                                <select className="form-select" placheolder="world" name="type"> 
                                    <option defaultValue>Choose a world</option>
                                    <option>The Void</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="type">Type:</label>
                                <input className="form-control" type="text" placheolder="Dimensional, Technological, Alchemical, Transformation, ect." name="type" required/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="descripton">Description:</label>
                                <textarea className="form-control" id="description" placheolder="Describe your Magic System, requirements, what can it do?" name="description" required> </textarea>

                            </div>
                            
                            <div className="btn-group">
                                <button className="btn btn-primary" type="submit">Create</button>
                                <button onClick={handleClose} type="button" className="btn btn-secondary cansel" data-bs-dismiss="offcanvas" aria-label="Close">Cancel</button>
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
                            <option>Dimensional</option>
                            <option>Technological</option>
                            <option>elemental</option>
                            <option>Transformation</option>
                            <option>Alchemical</option>
                            

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
            
            <div className="card-columns my-container" id="magicsystems">
                <div className="card" style={{width: '18rem'}}>
                    <div className="card-header theme-c adaptive">
                        <h4><NavLink className="card-link" to="voidwalking">Void Walking</NavLink></h4>
                    </div>
                    <div className="card-body theme adaptive">
                        <h5 className="card-title"><NavLink className="card-link" to="/worldbuilding/worlds/thevoid">The Void</NavLink></h5>
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            Type: Dimensional
                        </p>

                    </div>
                    
                </div>              
            </div>
            
    </main>);
}