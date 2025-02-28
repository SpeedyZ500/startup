import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import {genFilter, updateFilter, sortList, SortOptions, fetchListByPath, FilterOptions, FilterItem} from '../utility/utility.js'
import {CardsRenderer} from '../utility/utility.jsx'
import Select from 'react-select'



export function Characters() {
    const [visible, setVisibility] = useState(false);
        
         
    const handleClose = () => setVisibility(false);
         
    const handleOpen = () => setVisibility(true);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(FilterOptions);
    const [filters, setFilters] = useState(new FilterOptions)
    const path = window.location.pathname;


    const [sortOptions, setSortOptions ] = useState(new SortOptions("created", false));
    const handleFilterChange = (event) => {
        const parseValue = JSON.parse(event.target.value)
        const temp = filter
        temp.updateFilter(parseValue.attribute, parseValue.value);
        setFilter(temp);
    };
    const handleSortChange = (event) => {
        const parsedValue = JSON.parse(event.target.value);
        setSortOptions(new SortOptions(parsedValue.category, parsedValue.az));
    };
    
    useEffect(() => {
        let paths = path;
        if(!paths.startsWith("/")){
            paths = "/" + paths;
        }
        const jsonPath = `/data${paths}`
        fetchListByPath(jsonPath).then((data => {
            setList(data);
            setError(null);

        }))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, [path]);
    useEffect(() => {
        const newFilter = new FilterOptions;
        list.forEach((card) => {
            card.details.forEach((detail) => {
                if((!detail.filter || detail.filter === true) 
                    && detail.label && detail.value){
                    newFilter.addOption(detail.label,detail.value);
                }
            })
        })
        setFilters(newFilter);

    }, [list])
    

    return (
        
    <main>
        <div className="theme-h adaptive textbody">
                <h1>Characters</h1>
                <aside>All the Characters that are currently on the site.</aside>
            </div>
            <button onClick={handleOpen}className="btn btn-primary button-align"  data-bs-toggle="offcanvas" data-bs-target="#offcanvasCharacter" aria-controls="offcanvasCharacter">New Character</button>
            <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id="offcanvasCharacter" aria-labelledby="offcanvasCharacterLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasCharactertLabel">New Character</h4>
                    <button onClick={handleClose}type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="newCharacter">
                    <div className="form-popup" id="newCharacter">
                        <form className="form-container">
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="name">Name:</label>
                                <input className="form-control" type="text" placheolder="name" name="name" required/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="world">world:</label>
                                <select className="form-select" placheolder="world" name="type"> 
                                    <option defaultValue>Choose a world</option>
                                    <option>The Void</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="type">Type:</label>
                                <input className="form-control" type="text" placheolder="type" name="type" required/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="titles">title(s):</label>
                                <input className="form-control" type="text" placheolder="title(s)" name="titles"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="descripton">Description:</label>
                                <textarea className="form-control" id="description" placheolder="Describe your Character" name="description" required> </textarea>

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="race">Race:</label>
                                <input className="form-control" type="text" placheolder="race" name="race"/> 

                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="gender">Gender:</label>
                                <input className="form-control" type="text" placheolder="gender" name="gender"/>
                            </div>                             
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="pronouns">Pronouns:</label>
                                <input className="form-control" type="text" placheolder="he/him, they/them, she/her, they/them (colective), etc." name="pronouns"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="abilities">Abilities:</label>
                                <input className="form-control" type="text" placheolder="abilities" name="abilities"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="allies">allies:</label>
                                <input className="form-control" type="text" placheolder="Ally" name="allies"/> 
                            </div>
                            <div className="input-group">
                                <label className="input-group-text" htmlFor="enemies">Enemies:</label>
                                <input className="form-control" type="text" placheolder="Enemy" name="enemies"/> 
                            </div>

                            <div className="input-group">
                                <label className="input-group-text" htmlFor="relation">Related to:</label>
                                <input className="form-control" type="text" placheolder="Related to" name="relation"/> 
                            </div>    
                            <div className="btn-group">
                                <button className="btn btn-primary" type="submit">Create</button>
                                <button onClick={handleClose} type="button" className="btn btn-secondary cancel" data-bs-dismiss="offcanvas" aria-label="Close">Cancel</button>
                            </div>
                        </form>
    
                    </div>

                </OffcanvasBody>
            </Offcanvas>
            
            <div className="theme-h adaptive expanded">
                
                <form className="filterAndSort theme-h adaptive" action="" method="get">
                    <h4>Filter:</h4>
                    

                    <div className="input-group mb-3">
                        <label className="input-group-text"htmlFor="world">World </label>
                        <select className="form-select" id="world" name="varWorld">
                            <option defaultValue>All</option>
                            <option>The Void</option>
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <label className="input-group-text"htmlFor="type">Type </label>
                        <select className="form-select" id="type" name="varType">
                            <option defaultValue>All</option>
                            <option>Heroes</option>
                            <option>Villanes</option>
                            <option>Anti-Heroes</option>
                            <option>Anti-Villanes</option>
                            <option>Side-Characters</option>
                            <option>Wolrd Hoppers</option>

                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <label className="input-group-text"htmlFor="race">Race </label>
                        <select className="form-select" id="race" name="varRace">
                            <option defaultValue>All</option>
                            <option>???</option>
                            <option>Remgulus</option>
                            <option>Human</option>

                        </select>
                    </div>
                    <div className="input-group mb-3">
                         <label className="input-group-text" htmlFor="author">Author </label>
                        <select className="form-select" id="author" name="varAuthor">
                            <option defaultValue>All</option>
                            <option>Spencer Zaugg</option>
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <label className="input-group-text" htmlFor="sort" name="varSort" >Sort </label>
                        <select defaultValue={JSON.stringify(new SortOptions("created", false))} className="form-select" id="sort" name="varSort" onChange={handleSortChange}>
                            <option  value="">Popular</option>
                            <option value={JSON.stringify(new SortOptions("created", false))}>New to Old</option>
                            <option value={JSON.stringify(new SortOptions("created", true))}>Old to New</option>
                            <option value={JSON.stringify(new SortOptions("Name", true))}>A-Z Name</option>
                            <option value={JSON.stringify(new SortOptions("Name", false))}>Z-A Name</option>
                            <option value={JSON.stringify(new SortOptions("Author", true))}>A-Z Author</option>
                            <option value={JSON.stringify(new SortOptions("Author", false))}>Z-A Author</option>
                        </select>
                    </div>
                   
                    
                </form>

               
            </div>
            {loading ? 
                (
                    <p>Loading</p>
                ) : (error ? (<p style={{color:"red"}}>{error}</p>)
                : (<CardsRenderer cards={list} filters ={filter} sort={sortOptions}/>))
            }
            
    </main>);
}