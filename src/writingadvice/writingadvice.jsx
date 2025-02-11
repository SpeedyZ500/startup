import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
export function WritingAdvice() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    
    return (
    <main>
        <div className="theme-h adaptive textbody expanded">
                <h1>Writing Advice</h1>
            </div>
            // A button to open the form to submit advice
            <button className="btn btn-primary button-align" onClick={handleOpen} data-bs-toggle="offcanvas" data-bs-target="#offcanvasAdvice" aria-controls="offcanvasAdvice">New Advice</button>
            <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasAdvice" aria-labelledby="offcanvasAdviceLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasAdvaiceLabel">New Advice</h4>
                    <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newAdvice">
                    <div className="form-popup" id="newAdvice">
                        <form className="form-container">
                            <div className="input-group mb-3">
                                <label className="input-group-text" htmlFor="prompt">Advice:</label>
                                <textarea className="form-control" type="advice" placheolder="Your advice" name="advice" required> </textarea>
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
                         <label className="input-group-text"  htmlFor="author">Author: </label>
                        <select className="form-select" id="author" name="varAuthor">
                            <option defaultValue>All</option>
                            <option>Spencer Zaugg</option>
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <label className="input-group-text"  htmlFor="sort">Sort: </label>
                        <select className="form-select" id="sort" name="varSort">
                            <option defaultValue>Popular</option>
                            <option>New to Old</option>
                            <option>Old to New</option>
                            <option>A-Z Title</option>
                            <option>Z-A Title</option>
                            <option>A-Z Author</option>
                            <option>Z-A Author</option>
                        </select>
                    </div>
                   
                    
                </form>
            </div>
            <div className="advice">
                <ul>
                    <li>It doesn't matter what it is you write, just start writing, getting ideas on a page is more impoartant than if it looks good.</li>
                </ul>
            </div>
    </main>);
}