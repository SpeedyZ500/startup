import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export function Flora() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    
    return (
    <main className="worldbuilding">
        <div className="theme-h adaptive textbody">
                <h1>Flora</h1>
                <p>
                    The plant-life you create, a description of what they look like, uses or effects, is it poisonous? Is it carnivorous?
                    Plant type monsters should be in this tab, because they aren't wildlife, they are plants, and therefor should be among thier kind
                    note that you should feel free to make a Plant monster of some of your useful plants, because that would be something that could happen
                    if monster plants existed, because mimicry, whether it was the useful plant that mimics the monster plan, or the monster that mimics the useful
                    either would be accurate.
                </p>
            </div>
            <button className="btn btn-primary button-align" onClick={handleOpen} data-bs-toggle="offcanvas" data-bs-target="#offcanvasFlora" aria-controls="offcanvasFlora">New Flora</button>
            <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasFlora" aria-labelledby="offcanvasFloraLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasFloratLabel">New Flora</h4>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newFlora">
                    <div className="form-popup" id="newFlora">
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
                                <input className="form-control" type="text" placheolder="Monster, tree, flower, herb, etc." name="type" required/> 
                            </div>
                            
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="descripton">Description:</label>
                                <textarea className="form-control" id="description" placheolder="Describe your Flora" name="description" required> </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="abilities">Abilities:</label>
                                <input className="form-control" type="text" placheolder="abilities" name="abilities"/> 
                            </div>

                          
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="worlds">Worlds:</label>
                                <input className="form-control" type="text" placheolder="What worlds does your flora appear in" name="worlds"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="biomes">Biome(s):</label>
                                <input className="form-control" type="text" placheolder="What boimes does your flora grow in?" name="biomes"/> 
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
                            <option>Magic Tree</option>
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
            <div className="card-columns d-flex" id="wildlife">
                <div className="card" style={{width: "18rem"}}>
                    <div className="card-header theme-c adaptive">
                        <h4><NavLink className="card-link" to="worldtree">World Tree</NavLink></h4>
                    </div>
                    <div className="card-body theme adaptive">
                        <h5 className="card-title"><NavLink className="card-link" to="/worldbuilding/worlds/thevoid">The Void</NavLink></h5>
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            Type: Magic Tree
                        </p>

                    </div>
                    
                </div>              
            </div>
    </main>);
}