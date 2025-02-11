import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
export function WritingPrompts() {
        const [visible, setVisibility] = useState(false);
            
             
                const handleClose = () => setVisibility(false);
             
                const handleOpen = () => setVisibility(true);
    
    return (
    <main>
        <div className="theme-h adaptive textbody">
                <h1>Writing Prompts</h1>
                <br />
                <asside>Need ideas for a story? here are some ideas</asside>
            </div>

            <button className="btn btn-primary button-align" onClick={handleOpen} data-bs-toggle="offcanvas" data-bs-target="#offcanvasPrompt" aria-controls="offcanvasPrompt">New Prompt</button>
            <Offcanvas className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasPrompt" aria-labelledby="offcanvasPromptLabel" >
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasPromptLabel">New Prompt</h4>
                    <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newPrompt">
                    <div className="form-popup" id="newPrompt">
                        <form className="form-container">
                            <div className="input-group mb-3">
                                <label className="input-group-text" htmlFor="prompt">writing prompt:</label>
                                <input className="form-control" type="text" placheolder="Your prompt" name="prompt" required /> 
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
            
            // A button to open the form to submitt a new writing prompt
            
            <div className="prompts">
                <ul>
                    <li>What if werewoves were real, but they aren't around today because they colonized the moon?</li>
                </ul>
            </div>
    </main>);
}