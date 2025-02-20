import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';


import Button from 'react-bootstrap/Button';

import Card from 'react-bootstrap/Card';
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

export function Home() {
    return (
    <main>
        <h1 className="page-title theme-h adaptive expanded">Home</h1>
            
            <hr />
            <h2 className="theme-h adaptive text-center expanded">Writing Prompts</h2>
            <div className="prompts grid my-container scrollable">
                <div className="container text-center" data-bs-spy="scroll">
                    <div className="row">
                        <div className="col">
                            What if werewoves were real, but they aren't around today because they colonized the moon?
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <h2 className="theme-h adaptive text-center expanded ">Stories</h2>
            <h2 className="theme-h adaptive text-center expanded">New</h2>
            <div className ="new">
                
                
                <div className="card-columns my-container scrollable" data-bs-spy="scroll" id="new" >
                    
                    <Card className="card" style={{width:"18rem"}}>
                        <div className="card-header theme-c adaptive">
                            <h4><NavLink className="card-link" to="/stories/themoonlitealchemist"> The Moonlit Alchemist</NavLink></h4>

                            </div>
                        <div className="card-body theme adaptive">
                            <h5 className="card-title"><NavLink className="card-link" to="/stories/themoonlitealchemist/1_the_end_and_a_beginning_spencer_zaugg"> Chapter 1: The End and a beginning</NavLink></h5>
                            <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                            <p>
                                The story of a mysterious Alchemist who's alchemy is enhanced by moonlight, displaced from his world
                            </p>
                            
                        </div>
                        <div className="card-footer theme-c adaptive">
                            {/*Note Popers won't work until I add the nessisary Java Script stuff, I will deal with that later*/}
                            <button type="button" className="btn btn-sm btn-secondary" data-bs-toggle="popover" data-bs-title="Genres" data-bs-content="Example">Genre</button>
                            <button type="button" className="btn btn-sm btn-secondary" data-bs-toggle="popover"  data-bs-title="Content Warnings" data-bs-content="Fallen Universe">Content Warnings</button>

                        </div>
                    </Card>              
                        
                </div>

            </div>
            <h2 className="theme-h adaptive expanded">Popular</h2>
            <div className="popular">
                
                <div className="card-columns my-container scrollable" data-bs-spy="scroll" id="new">
                    
                    <Card className="card" style={{width:"18rem"}}>
                        <div className="card-header theme-c adaptive">
                            <h4><NavLink className="card-link" to="/stories/themoonlitealchemist"> The Moonlit Alchemist</NavLink></h4>

                            </div>
                        <div className="card-body theme adaptive">
                            <h5 className="card-title"><NavLink className="card-link" to="/stories/themoonlitealchemist/1_the_end_and_a_beginning_spencer_zaugg"> Chapter 1: The End and a beginning</NavLink></h5>
                            <h6 className="card-subtitle">by: Spencer Zaugg</h6>
                            <p>
                                The story of a mysterious Alchemist who's alchemy is enhanced by moonlight, displaced from his world
                            </p>
                            
                        </div>
                        <div className="card-footer theme-c adaptive">
                            {/*Note Popers won't work until I add the nessisary Java Script stuff, I will deal with that later*/}
                            <button type="button" className="btn btn-sm btn-secondary" data-bs-toggle="popover" data-bs-title="Genres" data-bs-content="Example">Genre</button>
                            <button type="button" className="btn btn-sm btn-secondary" data-bs-toggle="popover"  data-bs-title="Content Warnings" data-bs-content="Fallen Universe">Content Warnings</button>

                        </div>
                    </Card>              
                        
                </div>
            </div>
    </main>);
}