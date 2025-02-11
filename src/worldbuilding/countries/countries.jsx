import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
export function Countries() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    
    return (
    <main>
        <div className="theme-h adaptive textbody">
                <h1>Countries</h1>
                <p>
                    The countries of your stories, contains information of what races are in them, their allies, their enimies.
                    It also contains information on thier culture, history, religions, and the lands within them, and the common creatures within,
                    don't feel to be exaustive, you will be able to add to your own countries and stuff later.
                </p>
            </div>
            <button className="btn btn-primary button-align" onClick={handleOpen} data-bs-toggle="offcanvas" data-bs-target="#offcanvasCountry" aria-controls="offcanvasCountry">New Country</button>
            <Offcanvas show={visible}className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasCountry" aria-labelledby="offcanvasCountryLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasCountrytLabel">New Country</h4>
                    <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newCountry">
                    <div className="form-popup" id="newCountry">
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
                                <label className="input-group-text" htmlFor="culture">Culture:</label>
                                <textarea className="form-control" id="culture" placheolder="What is your countries Culture" name="culture" > </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="race">Race(s):</label>
                                <input className="form-control" type="text" placheolder="race" name="race"/> 

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="wildlife">Wildlife:</label>
                                <input className="form-control" type="text" placheolder="wildlife, what creatures" name="wildlife"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="flora">Flora:</label>
                                <input className="form-control" type="text" placheolder="Flora, what plants" name="flora"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="religions">Relegion:</label>
                                <input className="form-control" type="text" placheolder="a list of religions" name="religions"/>
                            </div>                             
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="organizations">Organizations:</label>
                                <input className="form-control" type="text" placheolder="A list of organizations" name="organizations"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="continent">Continent:</label>
                                <input className="form-control" type="text" placheolder="what continent is your country on?" name="continent"/> 
                            </div>    
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="biomes">Biome(s):</label>
                                <input className="form-control" type="text" placheolder="What boimes does your country have?" name="biomes"/> 
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
                        <label className="input-group-text"htmlFor="race">Race </label>
                        <select className="form-select" id="race" name="varRace">
                            <option defaultValue>All</option>
                            <option>???</option>
                            <option>Remgulus</option>
                            <option>Human</option>

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
                            <option>A-Z Leader</option>
                            <option>Z-A Leader</option>
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
                        <h4><a className="card-link" href="templates/yggdrasil.html">Yggdrasil</a></h4>
                    </div>
                    <div className="card-body theme adaptive">
                        <h5 className="card-title"><a className="card-link" href="templates/thevoid.html">The Void</a></h5>
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                        </p>

                    </div>
                    
                </div>              
            </div>
    </main>);
}