import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import { NavLink } from 'react-router-dom';

import { useState } from 'react';

import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
export function Biomes() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    
    return (
    <main className="worldbuilding">
        <div className="theme-h adaptive textbody">
                <h1>Biome</h1>
                <p>
                   The Biomes you create, and they have the worlds and contenents that this type of biome appears in.
                </p>
            </div>
            <button onClick={handleOpen} className="btn btn-primary button-align" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBiome" aria-controls="offcanvasBiome">New Biome</button>
            <Offcanvas show={visible}className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasBiome" aria-labelledby="offcanvasBiomeLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasBiometLabel">New Biome</h4>
                    <button onClick={handleClose}type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newBiome">
                    <div className="form-popup" id="newBiome">
                        <form className="form-container">
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="name">Name:</label>
                                <input className="form-control" type="text" placheolder="name" name="name" required/> 
                            </div>
                            <div className="input-group">
                                {/* Will make it multi select at some point*/}
                                <label className="input-group-text" htmlFor="world">World:</label>
                                <select className="form-select" placheolder="world" name="type"> 
                                    <option defaultValue>Choose a world</option>
                                    <option>The Void</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="descripton">Description:</label>
                                <textarea className="form-control" id="description" placheolder="Describe your Country" name="description" required> </textarea>

                            </div>
                           
                            
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="wildlife">Wildlife:</label>
                                {/* Will make this multi Select at some point*/}
                                <input className="form-control" type="text" placheolder="wildlife, what creatures" name="wildlife"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="flora">Flora:</label>
                                <input className="form-control" type="text" placheolder="Flora, what plants" name="flora"/> 
                            </div>
                            
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="continent">Continent:</label>
                                <input className="form-control" type="text" placheolder="what continent(s) is/are your biome in?" name="continent"/> 
                            </div>    
                            
                            
                            

                            
                            <div className="btn-group">
                                <button className="btn btn-primary" type="submit">Create</button>
                                <button onClick={handleClose}type="button" className="btn btn-secondary cansel" data-bs-dismiss="offcanvas" aria-label="Close">Cancel</button>
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
                        </select>
                    </div>
                   
                    
                </form>
            </div>
            <div className="card-columns d-flex" id="biomes">
                <div className="card" style={{width: "18rem"}}>
                    <div className="card-header theme-c adaptive">
                        <h4><NavLink className="card-link" to="worldtreebiome">The World Tree (Biome)</NavLink></h4>
                    </div>
                    <div className="card-body theme adaptive">
                        <h5 className="card-title"><NavLink className="card-link" to="/worldbuilding/worlds/thevoid">The Void</NavLink></h5>
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            The world tree biome is the only known biome to be able to sustane life.
                            reduced amount of void entities such as the Void Reacher
                                
                        </p>

                    </div>
                    
                </div>    
                <div className="card" style={{width: "18rem"}}>
                    <div className="card-header theme-c adaptive">
                        <h4><NavLink className="card-link" to="thedeepvoid">The Deep Void</NavLink></h4>
                    </div>
                    <div className="card-body theme adaptive">
                        <h5 className="card-title"><NavLink className="card-link" to="/worldbuilding/worlds/thevoid">The Void</NavLink></h5>
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            The origin of the Void Entities, the Space Between Earth and Yggdrasil
                        </p>

                    </div>
                    
                </div>              
            </div>
    </main>);
}