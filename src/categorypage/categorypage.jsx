import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import {genFilter, updateFilter, sortList, SortOptions, FilterOptions, FilterItem, sanitizeId, filterProfanity} from '../utility/utility.js'
import {CardsRenderer, useWebSocketFacade} from '../utility/utility.jsx'
import Select from 'react-select'
import Creatable from 'react-select/creatable';
import Table from 'react-bootstrap/Table';
import { AuthState } from '../login/authState.js';
import { FormGenerator, selectSources,  mapOptions, creatableSources} from '../utility/form';

import { WebSocketFacade, webSocket } from '../utility/websocketfacade.js';

const filterSources = {...selectSources, ...creatableSources, users:"/users"}

function FilterGenerator({filters, onFilterChange, socket}){
    const handleChange = (selectedOptions, attribute) => {
        onFilterChange(attribute, selectedOptions.map(option => option.value));
    };
    return Object.keys(filters).map((key) => {
        const filter = filters[key];
        const [options, updateOptions] = useState([])
        useEffect(() => {
            const collection = filter.source
            const url = filterSources[collection]
            if(mapOptions.includes(collection)){
                socket.subscribe({url, type:"mapOptions", collection, commandId:key, setData:updateOptions})
            }
            else{
                socket.subscribe({url, type:"getOptions", collection, commandId:key, setData:updateOptions})
            }

        },[key, filter, filters])

        useEffect(() => {
            console.log(JSON.stringify(options))
        }, [options])

        

        return(
            <div className="input-group" key={key}>
                <label className="input-group-text" htmlFor={key}>
                    {filter.label}
                </label>
                <Select 
                    isMulti 
                    options={options} 
                    className="form-control" 
                    onChange={(selectedOptions) => handleChange(selectedOptions, key)}
                    name={key}
                />
            </div>
        )
    });
}


export function CategoryPage(props) {
    const [visible, setVisibility] = useState(false);
    const [selections, onSelectionChange] = useState([]);
    const socket = useWebSocketFacade()
    
    
    
    
         
    const handleClose = () => setVisibility(false);
         
    const handleOpen = () => setVisibility(true);
    const [page, setPage] = useState(null);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({});
    const path = window.location.pathname;
    

    const [sortOptions, setSortOptions ] = useState({});
    const handleFilterChange = (attribute, values) => {

        const selected = values.map(value => value);
        if(!selected.length){
            setFilter({...filter, [attribute]:undefined});

        }
        else{
            setFilter({...filter, [attribute]:selected});
        }
        
    };
   
    
    useEffect(() => {
        let paths = path;
        if (!paths.startsWith("/")) {
            paths = "/" + paths.replace(/\/$/, '').trim();
        }
        paths = paths.replace(/\/$/, '').trim()
        const jsonPath = `/data${paths}.json`;
        console.log(jsonPath)
        fetch(jsonPath)
        .then((res) => res.json())
        .then((data) =>{
            console.log(JSON.stringify(data));
            setPage(data);
            setSortOptions(data.sort?.[0] || null);
            setError(null);
        }).catch(e => {
            setError(`Page Data Error: ${e.message}`);
        })
        .finally(() => setLoading(false))
    
    }, [path]);

    useEffect(() => {
        const collection = path.startsWith("/worldbuilding/")
        ? path.replace("/worldbuilding/", "")
        : path.replace(/^\//, "");   
        webSocket.subscribe({url:path, type:"getCards", collection, commandId:"getCards", query:{filter, sort:sortOptions.value},setData:setList})
        console.log(JSON.stringify(list))
    }, [path, filter, sortOptions])
    useEffect(() => {
        console.log(JSON.stringify(list))

    },[list])
    const [profanity, setProfanity] = useState(true);

    
    
    useEffect(() => {
        async function fetchProfanitySetting() {
            try {
                const res = await fetch('/api/user/prof', { method: 'GET' });
                const data = await res.json(); // Ensure it's parsed correctly
                setProfanity(data.profanityFilter);
            } catch {
                setProfanity(true);
            }
        }

        fetchProfanitySetting();
    }, []);
    useEffect(() => {
        async function applyProfanityFilter() {
    
            
    
           
        }
    
        applyProfanityFilter();
    }, [list, profanity]);

    useEffect(() => {
        
    }, [socket, ])
    
    if(loading){
        <main>
             <p>Loading</p>
        </main>
    }
    else if (error){
        <main><p style={{color:"red"}}>{error}</p></main>
    }
    else{
        return (
        
            <main>
                
                <div className="theme-h adaptive textbody">
                        <h1>{page && page.title}</h1>
                        <p>{page && page.description}</p>
                </div>
                    <button onClick={handleOpen} disabled={props.authState !== AuthState.Authenticated}className="btn btn-primary button-align"  data-bs-toggle="offcanvas" data-bs-target="#offcanvas" aria-controls="offcanvas">{page && page.buttonLabel || "new"}</button>
                    <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
                        
                        <OffcanvasHeader className="offcanvas-header">
                            <button onClick={handleClose}type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </OffcanvasHeader>
                        <OffcanvasBody className="new">
                            <FormGenerator handleClose={handleClose} setError={setError}/>

                            
                        </OffcanvasBody>
                    </Offcanvas>
                    
                    <div className="theme-h adaptive expanded">
                        {
                            page.filter &&<div className="filterAndSort theme-h adaptive">
                                <h4>Filter:</h4> 
                                <FilterGenerator filters={page.filter} onFilterChange={handleFilterChange} socket={socket}/>
                            </div> 
                        }

                        <div className="input-group mb-3">
                            <label className="input-group-text" htmlFor="sort" name="varSort" >Sort </label>
                            <Select 
                                options={page &&page.sort}
                                value={sortOptions}
                                className="form-control" 
                                id="sort" 
                                name="varSort" 
                                onChange={setSortOptions}
                            />
                                
                        </div>
                        
        
        
                       
                    </div>
                    <CardsRenderer cards={list}/>
                    
                    
            </main>
        );
    }

    
}