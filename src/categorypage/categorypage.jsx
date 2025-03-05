import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import {genFilter, updateFilter, sortList, SortOptions, fetchListByPath, FilterOptions, fetchJSONByPath, FilterItem, sanitizeId} from '../utility/utility.js'
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

function FormGenerator({form, sections, setSections, onCategoriesChange, onSelectionChange}){
    const [optionsMap, setOptionsMap] = useState({});
    const [selections, setSelections] = useState([]);
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
                        try {
                            const optionsList = await fetchListByPath(data.source);
                            newOptionsMap[data.source] = optionsList.map((item) => {
                                const option = item.details.find(detail => detail.label === "name");
                                return !option.path
                                    ? { value: { value:option.value }, label:option.value }:
                                    { value: { value:option.value, path:option.path }, label: option.value };
                            });
                        } catch (error) {
                            console.error(`Error fetching options for ${data.source}:`, error);
                            newOptionsMap[data.source] = [];
                        }
                    }
                })
            );
            setOptionsMap(newOptionsMap);
        }

        fetchOptions();
    }, [form])

    return form.map((data, index) => {
        if(data.hidden === true){
            return;
        }
        if(data.source &&   ["select", "multi-select", "creatable", "super-select"].includes(data.type)){
            
            const options = optionsMap[data.source] || []; 
            const SelectComponent = data.type === "creatable" ? Creatable : Select;
            const isMulti = data.type === "multi-select";
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
                        onChange={(selected) => updateSelections(data.label, selected)}
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
        //event.preventDefault();
        const formData = new FormData(event.target);
        
        const keys = formData.keys();
        
        const authorRequirements = page.form.fields.find(item => item.label === "Author");
        const created = new Date().toJSON();

        const listOutput = {id:created, author:props.userName, details:[
            {label:"Author", value:props.userName, hidden:authorRequirements.hidden, filter:authorRequirements.filter},
            {label:"created", hidden:true, filter:false, value:created}]};
        const bioOutput = {id:created, infoCard:{cardData:[{label:"Author", value:props.userName}], created: created, modified:created}};

        const findSuperSelect = page.form.fields.find(item => item.type === "super-select");
        if(findSuperSelect){
            const superOut = {label:findSuperSelect.label, type:findSuperSelect.type, source:findSuperSelect.source, value:[]}
            superOut.value = categories.map(item => {
                return {label:item.label, value:item.selections}
            });
            if(findSuperSelect.onCard === true){
                bioOutput.infoCard.cardData.push(superOut);
            }
            else{
                bioOutput[findSuperSelect.label] = superOut;
            }
            if(findSuperSelect.inList === true){
                listOutput.push(superOut);
            }
        }
        const findModified = page.form.fields.find(item => item.label === "modified");
        if(findModified.inList === true){
            listOutput.push({label:findModified.label, value:created, hidden:findModified.hidden, filter:findModified.filter})
        }
        const findAddPath = page.form.fields.find(item => item.addPath === true);
        let fileName =  null;
        let filePath = `${path}/`;
        const findSectionAdder = page.form.fields.find(item => item.type === "section-adder");
        
        if(findSectionAdder){
            bioOutput.sections= sections;
        }
        formData.forEach((value, key) => {
            const requirements = page.form.fields.find(item => item.label === key);
            const data = {label: key,
                type:requirements.type,
                location:requirements.location, 
                filter:requirements.filter,
                hidden:requirements.hidden,
            }
            if(["select", "multi-select", "creatable", "super-select"].includes(requirements.type)){
                return;
            }
        
            data.value = requirements.split ? 
            value.split(requirements.split).map(item => item.trim()).filter(item => item !== ''):value;
            
            if(page.form.createBioPage !== false){
                if(requirements.onCard === true){
                    if(location === "head"){
                        bioOutput.infoCard[key] = value;
                    }
                    bioOutput.infoCard.cardData.push(data);
                }
                else if(requirements.location === "body"){
                    bioOutput[key] = value;
                }
                else{
                    bioOutput[key] = data;
                }
            }
            if(requirements.inList === true){
                if(requirements.location === "body"){
                    listOutput[key] = value;
                }
                else{       
                    if(requirements.addPath === true){
                        fileName = sanitizeId(`${value}_${props.userName}`);
                        filePath = `${filePath}${fileName}`
                        data.path = filePath;
                    }
                    listOutput.details.push(data);
                }

            }
        });
        selections.forEach(selection => {
            const requirements = page.form.fields.find(item => item.label === selection.label);
            const data = {label: selection.label,
                type:requirements.type,
                location:requirements.location, 
                filter:requirements.filter,
                hidden:requirements.hidden,
                source:requirements.source,
                value:selection.value
            }
            if(page.form.createBioPage !== false){
                if(requirements.onCard === true){
                    bioOutput.infoCard.cardData.push(data);
                }
            }
            else if(requirements.location === "body"){
                bioOutput[selection.label] = value;
            }
            else{
                bioOutput[selection.label] = data;
            }
        })

         
        

       


        
        const localListData = localStorage.getItem(`${path}/list`) ?? '[]';
        const localList = JSON.parse(localListData);

        
       
        localList.push(listOutput);
        localStorage.setItem(`${path}/list`, JSON.stringify(localList));
        if(page.form.createBioPage !== false){
            localStorage.setItem(filePath, JSON.stringify(bioOutput));
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
            try {
                // Fetch the page data
                const pageData = await fetchJSONByPath(`${jsonPath}.json`);
                setPage(pageData);
                setSortOptions(pageData.sort[0]);
                setError(null);
    
                // Fetch list data
                const listData = await fetchListByPath(jsonPath);
                const storedData = JSON.parse(localStorage.getItem(`${paths}/list`) ?? '[]');
                listData.push(...storedData); // Merge fetched data with localStorage data
                setList(listData);
                setError(null);
    
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false); // Make sure loading state is reset
            }
        };
    
        fetchData(); // Call the async function
    }, [path]);
    useEffect(() => {
        let newFilter = new FilterOptions();
        list.forEach((card) => {
            if(!Array.isArray(card.details)){
                return;
            }
            card.details.forEach((detail) => {
                if(( detail.filter !== false) 
                    && detail.label && detail.value){
                    newFilter.addOption(detail.label, detail.value);
                }
            })
        })
       const filterTemp = ([]);
       newFilter.filters.forEach((filter) =>{
        const options = ([]);
        filter.values.forEach((value) => {
            options.push({label:`${value}`, value:`${value}`});
        })
        filterTemp.push({attribute:`${filter.attribute}`, value:options});
       })
        setFilters(filterTemp);
        

    }, [list])
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
                                <FormGenerator form={page.form.fields} sections={sections} setSections={setSections} onCategoriesChange={onCategoriesChange} onSelectionChange={onSelectionChange}/>
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