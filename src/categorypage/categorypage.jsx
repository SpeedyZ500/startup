import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import {genFilter, updateFilter, sortList, SortOptions, FilterOptions, FilterItem, sanitizeId, filterProfanity} from '../utility/utility.js'
import {CardsRenderer} from '../utility/utility.jsx'
import Select from 'react-select'
import Creatable from 'react-select/creatable';
import Table from 'react-bootstrap/Table';
import { AuthState } from '../login/authState.js';


function FilterGenerator({filters, onFilterChange}){
    const handleChange = (selectedOptions, attribute) => {
        onFilterChange(attribute, selectedOptions.map(option => option.value));
    };
    return filters.map((filter, index) => {
        return(
            <div className="input-group" key={index}>
                <label className="input-group-text" htmlFor={filter.attribute}>
                    {filter.attribute}
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
const Section = ({section, updateSection, removeSection }) => {
    const handleChange = (key, value ) => {
        updateSection({...section, [key]: value})
    };

    const addSubsection = () => {
        const newSubsection = {
            id: Date.now(),
            section:"", 
            text:"", 
            subsections: []
        }
        handleChange("subsections", [...section.subsections, newSubsection]);

    }
    const updateSubsection = (index, updateSubsection) => {
        const newSubsections = [...section.subsections];
        newSubsections[index] = updateSubsection;
        handleChange("subsections", newSubsections);
    }

    const removeSubsection = (index) => {
        const newSubsections = section.subsections.filter((_, i) => i !== index);
        handleChange("subsections", newSubsections);
    }
    return(
        <div className="container">
            <input 
                type = "text" 
                value={section.section} 
                onChange={(e) => handleChange("section", e.target.value)}
                placeholder="Section Header"
                className="form-control"
            />
            <textarea
                value={section.text}
                onChange={(e) => handleChange("text", e.target.value)}
                placeholder="Enter section content..."
                className="form-control"
            />
            <div>
                <Button onClick={addSubsection}className="btn btn-primary ">Add Subsection</Button>
            </div>
            <div>
                {section.subsections.map((sub, index) => (
                    <Section
                        key={sub.id}
                        section={sub}
                        updateSection={(updatedSub) => updateSubsection(index, updatedSub)}
                        removeSection={() => removeSubsection(index)}
                    />            
                ))}
            </div>   
            <Button onClick={removeSection}className="btn btn-danger ">Remove Subsection</Button>
        </div>
    )
}

const SuperSelect = ({data, options, onCategoriesChange}) => {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        onCategoriesChange(categories);
    }, [categories, onCategoriesChange]);
    const addCategory = () => {
        setCategories([...categories, {id:Date.now(), label:"", value: [] }])
    }
    const updateCategoryName = (index, name) =>{
        const updatedCategories = [...categories];
        updatedCategories[index].label = name;
        setCategories(updatedCategories);
    }
    const updateSelections = (index, selected) => {
        const updatedCategories = [...categories];
        updatedCategories[index].selections = selected.map(option => option.value);
        setCategories(updatedCategories);
    };
    const removeCategory = (index) => {
        setCategories(categories.filter((_, i) => i !== index));
    }
    return(
        <div className="input-group">
            <h5>{data.label}</h5>
            
            <Table bordered>
                <thead>
                    <tr>
                        <th>{data.categoryLabel}</th>
                        <th>Selections</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category,index) => {
                        return(<tr key={index}>
                            <td>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={data.categoryLabel}
                                    value={category.label}
                                    onChange={(e) => updateCategoryName(index, e.target.value)}
                                />
                            </td>
                            <td>
                                <Select
                                    isMulti
                                    options={options}
                                    value={category.selections}
                                    onChange={(selected) => updateSelections(index, selected)}
                                    className="form-control"
                                />
                            </td>
                            <td>
                                <Button onClick={() => removeCategory(index)} className="btn btn-danger">
                                    Remove
                                </Button>
                            </td>
                        </tr>);
                    })}
                </tbody>
            </Table>
            <Button onClick={addCategory} className="btn btn-primary mb-2">
                Add {data.categoryLabel}
            </Button>
        </div>
    );
    
}

function FormGenerator({form, sections, setSections, onCategoriesChange, onSelectionChange, profanity}){
    const [optionsMap, setOptionsMap] = useState({});
    const [selections, setSelections] = useState([]);
    const getKey = (data) => {
        return data.category ? sanitizeId(`${data.source}_${data.category}`) : data.source;
    }
    useEffect(() => {
        onSelectionChange(selections);
    }, [selections, onSelectionChange]);

    const updateSelections = (label, selected) => {
        const updatedSelections = [...selections];
        const index = updatedSelections.findIndex(item => item.label === label)
        if(index !== -1){
            updatedSelections[index].value = selected.map(option => option.value);
        }
        else{
            const values = selected.map(option => option.value);
            updatedSelections.push({label:label, value:values});
        }
        setSelections(updatedSelections);
    };

    useEffect(() => {
        async function fetchOptions() {
            const newOptionsMap = {};
    
            await Promise.all(
                form.map(async (data) => {
                    if (data.source && ["select", "multi-select", "creatable", "super-select"].includes(data.type)) {
                        if(data.values){
                            newOptionsMap[data.source] = data.values;
                        }
                        else{
                            try {
                                const url = `/api${data.source}` + (data.category ? `?${data.category}` : "")
                                const listData = await fetch(url, {
                                    method:"GET",             
                                    headers: {'Content-Type': 'application/json'},
                                });
                                if(listData.ok){
                                    const optionsList = await listData.json()
                                    const key = getKey(data);
                                    newOptionsMap[key] = await Promise.all(
                                        optionsList.filter(item => item).map(async (item) => {
                                            const option = typeof item === "object" && item.details ? 
                                            item.details.find(detail => detail.label === "name") || item : 
                                            item;
                                            const filteredLabel = await filterProfanity(option.value || option, profanity);
            
                                            return { 
                                                value: typeof option === "string" 
                                                    ? option 
                                                    : { value: option.value, path: option.path, id: item.id }, 
                                                label: filteredLabel 
                                            };
                                        })
                                    );
                                }
                                
                            } catch (error) {
                                console.error(`Error fetching options for ${data.source}:`, error);
                                newOptionsMap[data.source] = [];
                            }
                        }
                    }
                })
            );
    
            setOptionsMap(newOptionsMap);
        }
    
        fetchOptions();
    }, [form, profanity]);

    // Function to handle adding a new created option to the optionsMap
    const handleCreateOption = (data, newOption) => {
        setOptionsMap((prevOptionsMap) => {
            const updatedMap = { ...prevOptionsMap };

            // Find the relevant key in the map
            const key = getKey(data)

            // Add the new option to the existing options
            const existingOptions = updatedMap[key] || [];
            updatedMap[key] = [...existingOptions, newOption];
            return updatedMap;
        });    
    };

    return form.map((data, index) => {
        if(data.hidden === true){
            return;
        }
        if(data.source &&   ["select", "multi-select", "creatable", "super-select"].includes(data.type)){
            const key = getKey(data);
            const options = optionsMap[key] || []; 
            const SelectComponent = data.type === "creatable" ? Creatable : Select;
            const isMulti = data.type === "multi-select" || data.type === "creatable";
            if(data.type === "super-select"){
                return <SuperSelect key={index} data={data} options={options} onCategoriesChange={onCategoriesChange}/>
            }
            else{
                return(
                    <div className="input-group" key={index}>
                        <label className="input-group-text" htmlFor={data.label}>
                            {data.label}
                        </label>
                        <SelectComponent isMulti={isMulti} options={options} className="form-control" name={data.label}
                        onChange={(selected) => updateSelections(data.label, selected)
                            
                        }
                        onCreateOption={(inputValue) => {
                            const newOption = { label: inputValue, value: inputValue };
                            // Add new option to options array
                            handleCreateOption(data, newOption)
                          }}
                        
                        />
                    </div>
                );
            }
            
            
        }
        else if (data.type === "text"){
            if(data.required === true){
                return(
                    <div className="input-group" key={index}>
                        <label className="input-group-text" htmlFor={data.label}>
                            {data.label}
                        </label>
                        <input className="form-control" placeholder={data.placeholder} type="text" name={data.label} required/> 
                    </div>
                )
            }
            else{
                return(
                    <div className="input-group" key={index}>
                        <label className="input-group-text" htmlFor={data.label}>
                            {data.label}
                        </label>
                        <input className="form-control" placeholder={data.placeholder} type="text" name={data.label}/> 
                    </div>
                )
            }

        }
        else if(data.type === "text-area"){
            if(data.required === true){
                return(
                    <div className="input-group" key={index}>
                        <label className="input-group-text" htmlFor={data.label}>
                            {data.label}
                        </label>
                        <textarea className="form-control" placeholder={data.placeholder} type="text" name={data.label} required/> 
                    </div>
                )
            }
            else{
                return(
                    <div className="input-group" key={index}>
                        <label className="input-group-text" htmlFor={data.label}>
                            {data.label}
                        </label>
                        <textarea className="form-control" placeholder={data.placeholder} type="text" name={data.label}/> 
                    </div>
                )
            }
        }
        else if(data.type === "section-adder"){
            const addSection = () => {
                setSections([...sections, { id: Date.now(), section: "", text: "", subsections: [] }]);
            }
            const updateSection = (index, updatedSection) =>{
                const newSections = [...sections];
                newSections[index] = updatedSection;
                setSections(newSections);
            }
            const removeSection = (index) => {
                const newSections = sections.length > 1 ? sections.subsections.filter((_, i) => i !== index) : ([]);

                setSections(newSections);
            }
            return (
                <div key={index} className="input-group">
                    <label className="input-group-text">{data.label}</label>
                    <Button onClick={addSection} className="btn btn-primary">Add Section</Button>
                    {sections.map((section, i) => (
                        <Section
                            key={section.id}
                            section={section}
                            updateSection={(updated) => updateSection(i, updated)}
                            removeSection={() => removeSection(i)}
                        />
                    ))}
                </div>
            );
        }
        else{
            return
        }
    })
}

export function CategoryPage(props) {
    const [visible, setVisibility] = useState(false);
    const [selections, onSelectionChange] = useState([]);
    const handleSubmit = async (event) =>{

        event.preventDefault();
        const formData = new FormData(event.target);
        const dataToSend = {author:props.user.username};
        formData.forEach((value, key) => {
            // Skip fields we don't need to send (like select/multi-select/etc.)
            const requirements = page.form.fields.find(item => item.label === key);
            if (["select", "multi-select", "creatable", "super-select"].includes(requirements.type)) {
                return;
            }
    
            // Add only the raw value to the data object, using the form field key as the label
            dataToSend[key] = requirements.split
                ? value.split(requirements.split).map(item => item.trim()).filter(item => item !== '')
                : value;
        });

        if (page.form.fields.some(item => item.type === "section-adder")) {
            dataToSend.sections = sections;
        }        

        
        const findSuperSelect = page.form.fields.find(item => item.type === "super-select");
        if(findSuperSelect){
            const superOut = categories.map(item => {
                return {label:item.label, value:item.selections}
            });
            
            dataToSend[findSuperSelect.label] = superOut;
            
        }
        let paths = path;
        if (!paths.startsWith("/")) {
            paths = "/" + paths;
        }        
        
        
        selections.forEach((selection) => {
            const requirements = page.form.fields.find(item => item.label === selection.label);

            dataToSend[selection.label] = requirements.type === "select" && Array.isArray(selection.value) ? 
            selection.value[0] :
            selection.value
        })
        console.log(paths);
        console.log((dataToSend))
       
        try {

            const response =  await fetch(`/api${paths}`, {
            method:"POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify(dataToSend),
        });

            if (!response.ok) {
                throw new Error(`Failed to submit data: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log("Data submitted successfully:", responseData);
        } catch (err) {
            console.error("Error submitting data:", err);
        }
    }
         
    const handleClose = () => setVisibility(false);
         
    const handleOpen = () => setVisibility(true);
    const [page, setPage] = useState(null);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(new FilterOptions());
    const [filters, setFilters] = useState([])
    const [sections, setSections] = useState([]);
    const [categories, setCategories] = useState([])
    const path = window.location.pathname;
    const onCategoriesChange = (event) => {
        setCategories(event)
    }

    const [sortOptions, setSortOptions ] = useState();
    const handleFilterChange = (attribute, values) => {
        const temp = new FilterOptions(filters.filter); 
        const selected = values.map(value => value);
        temp.updateFilter(attribute, selected);
        setFilter(temp);
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
            fetch(`/api${paths}`)
            .then((response) => response.json())
            .then((data) => {
                setList(data);
                setError(null);
            }).catch ((err) => {
                setError(err.message);
            }).finally (() => {
                setLoading(false); // Make sure loading state is reset
            })
        };
    
        fetchData(); // Call the async function
    }, [path]);
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
            let newFilter = new FilterOptions();
    
            for (const card of list) {
                if (!Array.isArray(card.details)) {
                    continue;
                }
    
                for (const detail of card.details) {
                    if (detail.filter !== false && detail.label && detail.value) {
                        const cleanedLabel = await filterProfanity(detail.label, profanity);
                        newFilter.addOption(cleanedLabel, detail.value);
                    }
                }
            }
    
            const filterTemp = newFilter.filters.map(filter => ({
                attribute: filter.attribute,
                value: filter.values.map(value => ({ label: value, value }))
            }));
    
            setFilters(filterTemp);
        }
    
        applyProfanityFilter();
    }, [list, profanity]);
    
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
                            <form onSubmit={handleSubmit} className="form-container">
                                <FormGenerator form={page.form.fields} sections={sections} setSections={setSections} onCategoriesChange={onCategoriesChange} onSelectionChange={onSelectionChange} profanity={profanity}/>
                                <div className="btn-group">
                                    <button className="btn btn-primary" type="submit">Create</button>
                                    <button onClick={handleClose} type="button" className="btn btn-secondary cancel" data-bs-dismiss="offcanvas" aria-label="Close">Cancel</button>
                                </div>
                            </form>
                        </OffcanvasBody>
                    </Offcanvas>
                    
                    <div className="theme-h adaptive expanded">
                        
                        <form className="filterAndSort theme-h adaptive" action="" method="get">
                            <h4>Filter:</h4>
                            <FilterGenerator filters={filters} onFilterChange={handleFilterChange}/>
        
                            
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
                    <CardsRenderer cards={list} filters ={filter.filters} sort={sortOptions.value}/>
                    
                    
            </main>
        );
    }

    
}