import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
export function Races() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    

    return (
    <main>
        <div className="theme-h adaptive textbody">
                <h1>Races</h1>
                <aside>This doesn't refer to skin color, it refers to Humans, Elves, Dwarvs, Orks and other fantasy races.
                    Here is where you will put all your custom races, their cultures, histories, and abilities, as well as other stuff like that.
                </aside>
            </div>

            <button className="btn btn-primary button-align" onClick={handleOpen} data-bs-toggle="offcanvas" data-bs-target="#offcanvasRace" aria-controls="offcanvasRace">New Race</button>
            <Offcanvas className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasRace" aria-labelledby="offcanvasRaceLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasRacetLabel">New Race</h4>
                    <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newRace">
                    <div className="form-popup" id="newRace">
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
                                <input className="form-control" type="text" placheolder="Humanoid, insectoid, Avian, etc" name="type" required/> 
                            </div>
                            
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="descripton">Description:</label>
                                <textarea className="form-control" id="description" placheolder="Describe your Race" name="description" required> </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="abilities">Abilities:</label>
                                <input className="form-control" type="text" placheolder="abilities" name="abilities"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="magicsystems">Magic Systems:</label>
                                <select className="form-select" placheolder="world" name="type"> 
                                    <option defaultValue>None</option>
                                    <option>Void Walking</option>
                                </select>
                            </div>

                          
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="worlds">Worlds:</label>
                                <input className="form-control" type="text" placheolder="What worlds does your race appear in" name="worlds"/> 
                            </div>

                        
                            <div className="btn-group">
                                <button className="btn btn-primary" type="submit">Create</button>
                                <button type="button" className="btn btn-secondary cansel" data-bs-dismiss="offcanvas" aria-label="Close">Cancel</button>
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
                        <label className="input-group-text"htmlFor="type">Type: </label>
                        <select className="form-select" id="type" name="varType">
                            <option defaultValue>All</option>
                            <option>Humanoid</option>
                            <option>Shape Shifter</option>
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

            <div className="card-columns d-flex" id="wildlife">
                <div className="card" style={{width: "18rem"}}>
                    <div className="card-header theme-c adaptive">
                        <h4><a className="card-link" href="templates/remgulus.html">Remgulus</a></h4>
                    </div>
                    <div className="card-body theme adaptive">
                        <h5 className="card-title"><a className="card-link" href="templates/thevoid.html">The Void</a></h5>
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            Type: Shapeshifter
                        </p>
                        <a className="card-link" href="templates/voidwalking.html">Void Walking</a>

                    </div>
                    
                </div>              
            </div>

    </main>);
}