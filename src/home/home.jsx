import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { useState, useEffect, Fragment } from 'react';
import { CardsRenderer } from '../utility/utility.jsx';
import { fetchStoriesList, fetchListByPath, SortOptions, FilterOptions} from '../utility/utility';

import Button from 'react-bootstrap/Button';

import Card from 'react-bootstrap/Card';



export function Home() {
    const [stories, setStories] = useState([])
    const [prompts, setPrompts] = useState([])
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchStoriesList()
            .then((data => {
                const storedData = JSON.parse(localStorage.getItem('stories/list') ?? '[]');
                data.push(...storedData);
                setStories(data);
                setError(null);
        }))
        
        .catch((err) => setError(err.message))
        fetchListByPath('./data/writingprompts').then((data => {
            const storedData = JSON.parse(localStorage.getItem('writingprompts/list') ?? '[]');
            data.push(...storedData);

            setPrompts(data);
            setError(null);
        }))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    })
    return (
    <main>
        <h1 className="page-title theme-h adaptive expanded">Home</h1>
            
            <hr />
            <h2 className="theme-h adaptive text-center expanded">Writing Prompts</h2>
            <div id="prompts" >
                <CardsRenderer cards={prompts} filters ={new FilterOptions().filters} sort={new SortOptions("created", false)}/>
                
            </div>
            <hr />
            <h2 className="theme-h adaptive text-center expanded ">Stories</h2>
            <h2 className="theme-h adaptive text-center expanded">New</h2>
            <div className ="new">
                <CardsRenderer cards={stories} filters ={new FilterOptions().filters} sort={new SortOptions("created", false)}/>

            </div>
            <h2 className="theme-h adaptive expanded">Popular</h2>
            <div className="popular" >
                <CardsRenderer cards={stories} filters ={new FilterOptions().filters} sort={new SortOptions("created", false)}/>

            </div>
    </main>);
}