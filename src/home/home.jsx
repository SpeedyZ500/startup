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
    const storiesFormat  = {
        "header":{
            "title":{
                "url":"url"
            }
        },
        "body":{
            "author":"Author",
            "body":""
        },
        "footer":{
            "genres":"Genres",
            "contentWarnings":"Content Warnings"
        }
    }
    const promptsFormat  = {"body":{
        "description":""
    }}
    const socket = useWebSocketFacade()
    
    useEffect(() => {
        socket.subscribe({url:"/stories", type:"getCards", collection:"stories", commandId:"getStoryCards", query:{ sort:{created:-1}},setData:setStories})

        socket.subscribe({url:"/prompts", type:"getCards", collection:"prompts", commandId:"getPromptCards", query:{ sort:{created:-1}},setData:setPrompts})

    }, [])
    return (
    <main>
        <h1 className="page-title theme-h adaptive expanded">Home</h1>
            
            <hr />
            <h2 className="theme-h adaptive text-center expanded">Writing Prompts</h2>
            <div id="prompts" >
                <CardsRenderer cards={prompts} profanity={props.profanityFilter} formatting={promptsFormat}/>
                
            </div>
            <hr />
            <h2 className="theme-h adaptive text-center expanded ">Stories</h2>
            <h2 className="theme-h adaptive text-center expanded">New</h2>
            <div className ="new">
                <CardsRenderer cards={stories} profanity={props.profanityFilter} formatting={storiesFormat}/>

            </div>
            
    </main>);
}