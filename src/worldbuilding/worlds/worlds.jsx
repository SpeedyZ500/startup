import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
export function Worlds() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    
    return (
    <main>
        <div className="theme-h adaptive textbody">
                <h1>Worlds</h1>
                <aside>
                    This is where you put your worlds, what races are their, which ones are native, 
                    which ones are worlds that had mass migration from another world due to <i>unfortunate</i> and <i>unforseen</i> circumstances.
                    Feel free to add biome info as well, and you don't need to fill it all out at the begining, you will be able to make edits later. 
                    You will also be able to add additional information within the world's page, including defining the biomes you make up,
                    and createing/adding wildlife, races, flora, organizations and countries which will automatically be added to the relevant tabs.
                </aside>
            </div>
            

            <button className="btn btn-primary button-align" onClick={handleOpen} data-bs-toggle="offcanvas" data-bs-target="#offcanvasWorld" aria-controls="offcanvasWorld">New World</button>
            <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasWorld" aria-labelledby="offcanvasWorldLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasCountrytLabel">New World</h4>
                    <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newWorld">
                    <div className="form-popup" id="newWorld">
                        <form className="form-container">
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="name">Name:</label>
                                <input className="form-control" type="text" placheolder="name" name="name" required/> 
                            </div>
                           
                            
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="descripton">Description:</label>
                                <textarea className="form-control" id="description" placheolder="Describe your World" name="description" required> </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="history">History:</label>
                                <textarea className="form-control" id="history" placheolder="tell us about the history" name="history"> </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="culture">Culture:</label>
                                <textarea className="form-control" id="culture" placheolder="What is/are your world's Culture(s)" name="culture" > </textarea>

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
                                <label className="input-group-text" htmlFor="continent">Continents:</label>
                                <input className="form-control" type="text" placheolder="what continents are there ?" name="continent"/> 
                            </div>    
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="biomes">Biome(s):</label>
                                <input className="form-control" type="text" placheolder="What boimes does your country have?" name="biomes"/> 
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
                            <option>A-Z Name</option>
                            <option>Z-A Name</option>
                            <option>A-Z Author</option>
                            <option>Z-A Author</option>
                        </select>
                    </div>
                   
                    
                </form>
            </div>

            <div className="card-columns d-flex" id="worlds">
                <div className="card" style={{width: "18rem"}}>
                    <div className="card-body theme adaptive">
                        <h5 className="card-title"><a className="card-link" to="templates/thevoid">The Void</a></h5>
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            The World Between Worlds
                        </p>
                    </div>
                    
                </div>              
                
            </div>

    </main>);
}