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
import { FormGenerator } from '../utility/form';

import { WebSocketFacade, webSocket } from '../utility/websocketfacade.js';



function FilterGenerator({filters, onFilterChange, socket}){
    const handleChange = (selectedOptions, attribute) => {
        onFilterChange(attribute, selectedOptions.map(option => option.value));
    };
    return Object.keys(filters).map((key) => {
        return(
            <div className="input-group" key={key}>

                <label className="input-group-text" htmlFor={key}>
                    {key}
                </label>
                <Select 
                    isMulti 
                    options={filter.value} 
                    className="form-control" 
                    onChange={(selectedOptions) => handleChange(selectedOptions, filter.attribute)}
                    name={filter.attribute}
                />
            </div>
        )
    });
}


export function CategoryPage(props) {
    const [visible, setVisibility] = useState(false);
    const [selections, onSelectionChange] = useState([]);
    const [socket, setWebsocket] = useState(useWebSocketFacade())

    
    
    
    
         
    const handleClose = () => setVisibility(false);
         
    const handleOpen = () => setVisibility(true);
    const [page, setPage] = useState(null);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({});
    const [filters, setFilters] = useState({})
    const path = window.location.pathname;
    

    const [sortOptions, setSortOptions ] = useState({});
    const handleFilterChange = (attribute, values) => {

        const selected = values.map(value => value);
        
        setFilter({...filter, [attribute]:selected});
    };
   
    
    useEffect(() => {
        let paths = path;
        if (!paths.startsWith("/")) {
            paths = "/" + paths;
        }
        const jsonPath = `/data${paths}`;
    
        // Use async function to handle multiple async calls sequentially
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch the page data
                const res = await fetch(`${jsonPath}.json`);
                if(!res.ok){
                    throw new Error(`HTTP error! Status: ${response.status}`);

                }
                const pageData = await res.json();
                console.log(JSON.stringify(pageData));
                setPage(pageData);
                setSortOptions(pageData.sort?.[0] || null);
                setError(null);
            }
            catch (err){
                setError(`Page Data Error: ${err.message}`);

            }
            setLoading(false); // Make sure loading state is reset

        };
    
        fetchData(); // Call the async function
    }, [path]);

    useEffect(() => {
        const collection = path.startsWith("/worldbuilding/")
        ? path.replace("/worldbuilding/", "")
        : path.replace(/^\//, "");   
        socket.subscribe({url:path, type:"getCards", collection, commandId:"getCards", query:{ sort:sortOptions.value},setData:setList})
        console.log(JSON.stringify(list))

    }, [path, filter, sortOptions])
    useEffect(() => {
        console.log(JSON.stringify(list))

    },[list])
    const [profanity, setProfanity] = useState(true);

    useEffect(() => {
        if(page && typeof page === "object"){
            if(page.filter){
                setFilters(page.filter)
            }
            

        }
    }, [page])
    
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
                        <h1>{page.title}</h1>
                        <p>{page.description}</p>
                </div>
                    <button onClick={handleOpen} disabled={props.authState !== AuthState.Authenticated}className="btn btn-primary button-align"  data-bs-toggle="offcanvas" data-bs-target="#offcanvas" aria-controls="offcanvas">{page.buttonLabel}</button>
                    <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
                        
                        <OffcanvasHeader className="offcanvas-header">
                            <h4 className="offcanvas-title" id="offcanvasLabel">{page.form.title}</h4>
                            <button onClick={handleClose}type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </OffcanvasHeader>
                        <OffcanvasBody className="new">
                            <FormGenerator handleClose={handleClose} setError={setError}/>

                            
                        </OffcanvasBody>
                    </Offcanvas>
                    
                    <div className="theme-h adaptive expanded">
                        
                        <form className="filterAndSort theme-h adaptive" action="" method="get">
                            <h4>Filter:</h4>
                            <FilterGenerator filters={filters} onFilterChange={handleFilterChange} socket={socket}/>
        
                            
                            <div className="input-group mb-3">
                                <label className="input-group-text" htmlFor="sort" name="varSort" >Sort </label>
                                <Select 
                                    options={page.sort}
                                    value={sortOptions}
                                    className="form-control" 
                                    id="sort" 
                                    name="varSort" 
                                    onChange={setSortOptions}
                                />
                                    
                            </div>
                           
                            
                        </form>
        
                       
                    </div>
                    <CardsRenderer cards={list}/>
                    
                    
            </main>
        );
    }

    
}