import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import {filterProfanity} from '../utility/utility.js'
import {CardsRenderer, useWebSocketFacade} from '../utility/utility.jsx'
import Select from 'react-select'
import Creatable from 'react-select/creatable';
import Table from 'react-bootstrap/Table';
import { AuthState } from '../login/authState.js';
import { FormGenerator, selectSources,  mapOptions, creatableSources} from '../utility/form';
import './../app.css'
import { WebSocketFacade, webSocket } from '../utility/websocketfacade.js';


const filterSources = {...selectSources, ...creatableSources, users:"/users"}

function FilterOptions({filter, attribute, onFilterChange, socket, profanity}){
    const handleChange = (selectedOptions, attribute) => {
        onFilterChange(attribute, selectedOptions.map(option => option.value));
    };
    const [options, updateOptions] = useState([])
    const [filteredOptions, setFilteredOptions] = useState([])
    useEffect(() => {
        const collection = filter.source
        const url = filterSources[collection]
        if(mapOptions.includes(collection)){
            socket.subscribe({url, type:"mapOptions", collection, commandId:attribute, setData:updateOptions})
        }
        else{
            socket.subscribe({url, type:"getOptions", collection, commandId:attribute, setData:updateOptions})
        }

    },[attribute, filter])
    useEffect(() => {
        async function runFilter() {
            const cleanOptions = await filterProfanity(options, profanity, true);
            setFilteredOptions(cleanOptions);
        }
        runFilter();
    }, [options, profanity])
    return(
        <div className="input-group" key={attribute}>
            <label className="input-group-text" htmlFor={attribute}>
                {filter.label}
            </label>
            <Select 
                isMulti 
                options={filteredOptions} 
                className="form-control" 
                onChange={(selectedOptions) => handleChange(selectedOptions, attribute)}
                name={attribute}
            />
        </div>
    )
}
function FilterGenerator({ filters, onFilterChange, socket, profanity = true }) {
    return Object.keys(filters).map((key) => {
        return (
            <FilterOptions
                key={key}
                filter={filters[key]}
                attribute={key}
                onFilterChange={onFilterChange}
                socket={socket}
                profanity={profanity}
            />
        );
    });
}


export function CategoryPage(props) {
    const location = useLocation();
    const isWorldbuilding = location.pathname.startsWith("/worldbuilding");

    const [visible, setVisibility] = useState(false);
    const socket = useWebSocketFacade()
    const profanity = props.profanityFilter

    
    
    
    
         
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
        socket.changePageSameFile()
        let paths = path;
        if (!paths.startsWith("/")) {
            paths = "/" + paths.replace(/\/$/, '').trim();
        }
        paths = paths.replace(/\/$/, '').trim()
        const jsonPath = `/data${paths}.json`;
        fetch(jsonPath)
        .then((res) => res.json())
        .then((data) =>{
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
        socket.subscribe({url:path, type:"getCards", collection, commandId:"getCards", query:{filter, sort:sortOptions.value},setData:setList})
    }, [path, filter, sortOptions])
    
    
    if(loading){
        <main className={`${isWorldbuilding ? "with-subnav" : ""}`}>
             <p>Loading</p>
        </main>
    }
    else if (error){
        <main className={`${isWorldbuilding ? "with-subnav" : ""}`}><p style={{color:"red"}}>{error}</p></main>
    }
    else{
        return (
        
            <main className={`${isWorldbuilding ? "with-subnav" : ""}`}>
                
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
                            <FormGenerator handleClose={handleClose} />

                            
                        </OffcanvasBody>
                    </Offcanvas>
                    
                    <div className="theme-h adaptive expanded">
                        {
                            page.filter &&<div className="filterAndSort theme-h adaptive">
                                <h4>Filter:</h4> 
                                <FilterGenerator filters={page.filter} onFilterChange={handleFilterChange} socket={socket} profanity={profanity}/>
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
                    <CardsRenderer cards={list} profanity={profanity} formatting={page.cards}/>
                    
                    
            </main>
        );
    }

    
}