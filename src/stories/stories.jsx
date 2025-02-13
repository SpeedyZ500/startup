import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { NavLink } from 'react-router-dom';

import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';



export function Stories() {
    const [visible, setVisibility] = useState(false);
    
     
        const handleClose = () => setVisibility(false);
     
        const handleOpen = () => setVisibility(true);
    return (
    <main>
        <div className="theme-h adaptive textbody">
                <h1>Stories</h1>
                <aside> All the wonderful User Generated Stories.</aside>
            </div>
            <button className="btn btn-primary button-align"  data-bs-toggle="offcanvas" data-bs-target="#offcanvasStory" aria-controls="offcanvasStory" onClick={handleOpen}>New Story</button>
            <Offcanvas className="offcanvas offcanvas-start" data-bs-scroll="true" show={visible}  data-bs-backdrop="false" tabIndex="-1" id="offcanvasStory" aria-labelledby="offcanvasStoryLabel">
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasStoryLabel">New Story</h4>
                    <button type="button" className="btn-close" onClick={handleClose} data-bs-dismiss="offcanvas" aria-label="Close"></button>

                </OffcanvasHeader>
                <OffcanvasBody className="offcanvas-body">
                    <div className="form-popup" id="newStory">
                    
                        <form className="form-container">
                            <div className="input-group mb-3">
                                <label className="input-group-text" htmlFor="title">Title:</label>
                                <input className="form-control" type="text" placheolder="title" name="title" required /> 
                            </div>
                            <div className="input-group mb-3">
                                <label className="input-group-text" htmlFor="descripton">Description:</label>
                                <input className="form-control" type="text" placheolder="description" name="description" />  
                            </div>
                            <div className="input-group mb-3">
                                <label className="input-group-text" htmlFor="chapterTitle">Chapter Title:</label>
                                <input className="form-control" type="text" placheolder="Chapter Title" name="chapterTitle"/> 
                            </div>
                            <div className=" mb-3">
                                <label htmlFor="story" className="form-label">Chapter Body</label>
                                <textarea className="form-control" name="story"> </textarea>    
                            </div>
                            <div className="input-group mb-3">
                                <label className="input-group-text" htmlFor="genre">Genre(s):</label>
                                <input className="form-control" type="text" placheolder="genre" id="genre" name="genre" /> 
                            </div>
                            <div className="input-group mb-3">
                                <label className="input-group-text" htmlFor="contentwarning">Content Warning(s):</label>
                                <input className="form-control" type="text" placheolder="content warning" name="contentwarning"/> 
                            </div>
                            <div className="btn-group">
                                <button className="btn btn-primary" type="submit">Create</button>
                                <button type="button" className="btn btn-secondary cancel" data-bs-dismiss="offcanvas" aria-label="Close" onClick={handleClose}>Cancel</button>
                            </div>
                        </form>   
                    </div>             
                </OffcanvasBody>
            </Offcanvas>
            <div className="theme-h adaptive expanded" style={{marginbottom:"20px"}}>
                <form className="filterAndSort" action="" method="get">
                    <h4>Filter:</h4>    
                    <div className="input-group mb-3">
                        <label className="input-group-text"htmlFor="genre">Genre: </label>
                        <select className="form-select" id="genre" name="varGenre">
                            <option defaultValue>All</option>
                            <option>Example</option>
                        </select>
                    </div>
                    <div className="input-group mb-3">
                         <label className="input-group-text" htmlFor="author">Author: </label>
                        <select className="form-select" id="author" name="varAuthor">
                            <option defaultValue>All</option>
                            <option>Spencer Zaugg</option>
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <label className="input-group-text" htmlFor="sort">Sort: </label>
                        <select className="form-select" id="sort" name="varSort">
                            <option defaultValue>Popular</option>
                            <option>New to Old</option>
                            <option>Old to New</option>
                            <option>A-Z Title</option>
                            <option>Z-A Title</option>
                            <option>A-Z Author</option>
                            <option>Z-A Author</option>
                            <option>Recently Expanded</option>
                        </select>
                    </div>
                   
                    
                </form>
            </div>
            <div className="card-columns d-flex" id="stories">
                <div className="card" style={{width:"18rem"}}>
                    <div className="card-header theme-c adaptive">
                        <h4><NavLink className="card-link" to="/stories/themoonlitealchemist"> The Moonlit Alchemist</NavLink></h4>

                     </div>
                    <div className="card-body theme adaptive">
                        <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            The story of a mysterious Alchemist who's alchemy is enhanced by moonlight, displaced from his world
                        </p>
                        
                    </div>
                    <div className="card-footer theme-c adaptive">
                        {/* Note Popers won't work until I add the nessisary Java Script stuff, I will deal with that later */}
                        <button type="button" className="btn btn-sm btn-secondary" data-bs-toggle="popover" data-bs-title="Genres" data-bs-content="Example">Genre</button>
                        <button type="button" className="btn btn-sm btn-secondary" data-bs-toggle="popover"  data-bs-title="Content Warnings" data-bs-content="Fallen Universe">Content Warnings</button>

                    </div>
                </div>              
            </div>
    </main>);
}