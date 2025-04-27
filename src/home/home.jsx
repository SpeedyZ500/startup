import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { useState, useEffect, Fragment } from 'react';
import {CardsRenderer, useWebSocketFacade} from '../utility/utility.jsx'
import { SortOptions, FilterOptions} from '../utility/utility';

import Button from 'react-bootstrap/Button';

import Card from 'react-bootstrap/Card';



export function Home(props) {
    const [stories, setStories] = useState([])
    const [prompts, setPrompts] = useState([])
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const path = window.location.pathname;
    const socket = useWebSocketFacade()
    
    useEffect(() => {
        
    }, [])
    return (
    <main>
        <h1 className="page-title theme-h adaptive expanded">Home</h1>
            
            <hr />
            <h2 className="theme-h adaptive text-center expanded">Writing Prompts</h2>
            <div id="prompts" >
                <CardsRenderer cards={prompts} profanity={props.profanityFilter}/>
                
            </div>
            <hr />
            <h2 className="theme-h adaptive text-center expanded ">Stories</h2>
            <h2 className="theme-h adaptive text-center expanded">New</h2>
            <div className ="new">
                <CardsRenderer cards={stories} profanity={props.profanityFilter}/>

            </div>
            <h2 className="theme-h adaptive expanded">Popular</h2>
            <div className="popular" >
                <CardsRenderer cards={stories} profanity={props.profanityFilter}/>

            </div>
    </main>);
}