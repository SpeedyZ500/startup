import React, { useEffect, useState, useMemo, useRef} from 'react';
import {useWebSocketFacade} from './utility.jsx'
import Select from 'react-select'
import Creatable from 'react-select/creatable';
import { AuthState } from '../login/authState.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { ButtonGroup } from 'react-bootstrap';
import './form.css';
import './../select.css'

export const selectSources = {
    races:"/worldbuilding/races",
    characters:"/characters",
    worlds:"/worldbuilding/worlds",
    countries:"/worldbuilding/countries",
    towns:"/worldbuilding/countries",
    continents:"/worldbuilding/worlds",
    magicsystems:"/worldbuilding/magicsystems",
    organizations:"/worldbuilding/organizations",
    wildlife:"/worldbuilding/wildlife",
    flora:"/worldbuilding/flora",
    biomes:"/worldbuilding/biomes"
}
export const mapOptions = [
    "towns",
    "continents"
]

export const creatableSources = {
    racestypes:"/worldbuilding/races",
    charactertypes:"/characters",
    countrytypes:"/worldbuilding/countries",
    magictypes:"/worldbuilding/magicsystems",
    organizationtypes:"/worldbuilding/organizations",
    floratypes:"/worldbuilding/flora",
    wildlifetypes:"/worldbuilding/wildlife",
    genres:"/stories",
    contentwarnings:"/stories",
}

export function extractIDfromURL(){
    let path = window.location.pathname;
    if(!path.startsWith("/")){
        path = "/" + path;
    }
    for(const [fieldkey, value] of Object.entries(selectSources)){
        if(path.startsWith(value)){
            const id = path.replace(value, "").replace(/^\/|\/$/g, ""); // Remove trailing slash if any
            return {url:value, id }
        }
    }
    return { url: path }; // Optionally return null for id if not found
}

const handleErrors = async (res) => {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.msg || "Unknown error");
    }
    return res.json();
};

const handleModify = async (id, formData, form, socket) => {
    if(id){
        // console.log("handling modify")
        for(const fieldkey of Object.keys(form)){
            // console.log(fieldkey)
            if(form[fieldkey].type === "modify-others"){
                const {method, source, list} = form[fieldkey];
                const ids = formData[fieldkey]
                const url = selectSources[source]
                // console.log(JSON.stringify(ids))
                if(method && source && url && id && ids && (!Array.isArray(ids) || ids.length > 0)){
                    fetch(`/api${url}/${list}/${method}`, {
                        method:"PATCH",
                        headers: {"content-type": "application/json"},
                        body: JSON.stringify({ids, id})
                    })
                    .then(handleErrors)
                    .then (() => {
                        const affectedIds = Array.isArray(ids) ? ids : [ids];
                        affectedIds.forEach(modifiedId => {
                        socket.notify({
                            collection:url,
                            type: "PATCH",
                            id: modifiedId
                        });
                    });

                    })
                    .catch(error =>{
                        console.error(error.message);
                    })

                }
            }
        }
    }
}

export function FormGenerator({handleClose}){
    const socket = useWebSocketFacade();
    const {url, id} = extractIDfromURL();
    const [form, setForm] = useState({})
    const [formData, setData] = useState({})
    const memoizedFields = useMemo(() => form.fields, [form]);


    useEffect(() => {
        fetch(`/api/user/me`, {
            method:"GET",             
            headers: {'Content-Type': 'application/json'},
        })
        .then((res) => {
            if(!res.ok){

                handleClose();
            }
        })
        .catch((error) =>{
            console.error(error.message)
            handleClose?.();


        });
        fetch(`/data${url}.json`)
        .then(handleErrors)
        .then((data) => {
            if(data.form){
                setForm(data.form)
            }
            else{
                throw new Error(`could not find ${url}.json`);
            }
        })
        .catch((error) =>{
            console.error(error.message)
            handleClose?.()
        })
        if(id){
            fetch(`/api${url}/${id}`, {
                method:"GET",
                headers:{'Content-Type': 'application/json'}
            })
            .then(handleErrors)
            .then((data) => {
                //console.log(JSON.stringify(data))
                setData(data)
            })
            .catch((error) =>{
                console.error(error.message)
                handleClose?.()
            })
        }
    }, [url,id])
    

    const handleSubmit = () => {
        if(id){
            // console.log(JSON.stringify(formData))
            // console.log(`updating ${id}`)
            fetch(`/api${url}/${id}`,{
                method:"PUT",
                headers: {"content-type": "application/json"},
                body:JSON.stringify(formData)
                
            })
            .then(handleErrors)
            .then(data => {
                // console.log(`successfully updated ${id}`)

                socket.notify({collection:url, type:"PUT", id:data.id})
                handleModify(data.id,formData,form.fields,socket)
                handleClose?.()
            })
            .catch((error) =>{
                console.error(error.message)
            })
        }
        else{
            fetch(`/api${url}`, {
                method:"POST",
                headers: {"content-type": "application/json"},
                body:JSON.stringify(formData)
            })
            .then(handleErrors)
            .then(data => {
                socket.notify({collection:url, type:"POST", id:data.id})
                handleModify(data.id,formData,form,socket)
                handleClose?.()
            })
            .catch((error) =>{
                console.error(error.message)
            })
        }
    }
    if(id){
        return(
            <div>
                <h1>Modify {formData.name}</h1>
                <GenerateForm formData={formData} form={form.fields} socket={socket} setData={setData} id={id} />
                 <ButtonGroup>
                    <Button onClick={handleSubmit} variant='primary'>Submit</Button>
                    <Button onClick={handleClose} variant='secondary'>Close</Button>
                </ButtonGroup>
            </div>
           
        )
    }
    return(
        <div>
            <h1>{form &&form.title || ""}</h1>
            <GenerateForm formData={formData} form={form.fields} socket={socket} setData={setData} />
             <ButtonGroup>
                <Button onClick={handleSubmit} variant='primary'>Submit</Button>
                <Button onClick={handleClose} variant='secondary'>Close</Button>
            </ButtonGroup>
        </div>
    )
}

function GenerateMultiSelect({formData, fieldkey, field, socket, setData}){
    const [options, updateOptions] = useState([])
    const [qualifierOptions, updateQualifierOptions] = useState([])
    const reliesOn = field.filter?.key 
    

    useEffect(() =>{
        const collection = field.source
        const url = selectSources[collection]
        if(mapOptions.includes(collection)){
            if(formData[reliesOn]){
                let data = Array.isArray(formData[reliesOn]) ? formData[reliesOn][0] : formData[reliesOn]
                if(typeof data === "object"){
                    data = data.value
                }
                const filterKey = field.filter.as
                const filter = {[filterKey]:data}
                socket.subscribe({url, type:"mapOptions", collection, commandId:fieldkey, query:{filter}, setData:updateOptions}, )
            }
            else{
                setData({...formData, [fieldkey]:undefined})
                return updateOptions([])
            }
        }
        else{
            let filter = field.filter
            if(filter && reliesOn){
                if(!formData[reliesOn]) {
                    setData({...formData, [fieldkey]:undefined})
                    return updateOptions([])
                }
                let data = Array.isArray(formData[reliesOn]) ? formData[reliesOn][0] : formData[reliesOn]
                if(typeof data === "object"){
                    data = data.value
                }
                const filterKey = field.filter.as
                filter = {[filterKey]:data}
            }
            socket.subscribe({url, type:"getOptions", collection, commandId:fieldkey, query:{filter},setData:updateOptions})
        }

    }, [fieldkey, field, formData[reliesOn]])

    useEffect(() => {
        if (!field.qualifier || !formData[field.qualifierKey]) return;
    
        const collection = field.source;
        const url = selectSources[collection];
    
        let qualifierValue = formData[field.qualifierKey];
        if (Array.isArray(qualifierValue)) qualifierValue = qualifierValue[0];
        if (typeof qualifierValue === "object") qualifierValue = qualifierValue.value;
    
        const filter = {
            ...field.qualifier?.filter,
        };
    
        socket.subscribe({
            url,
            type: "getOptions",
            collection,
            commandId: `${fieldkey}-qualifier`,
            query: { filter },
            setData: updateQualifierOptions,
        });
    }, [field.qualifier, field.qualifierKey, formData[field.qualifierKey]]);

    const selectedOptions = useMemo(() => {
        const selected = Array.isArray(formData[fieldkey]) ? formData[fieldkey] : [];
      
        const selectedPrimitives = selected.map(v =>
          typeof v === "object" ? v.value : v
        );
        return options.filter(opt => selectedPrimitives.includes(opt.value));
      }, [formData[fieldkey], options]);

    const handleChange = (selectedOption) => {
        const selected = selectedOption?.map(opt => opt.value) || [];
        setData({...formData, [fieldkey]:selected})
    };
    if(field.qualifierKey && !qualifierOptions.some(q => q.value === formData[field.qualifierKey])){
        setData({...formData, [fieldkey]:[]})
        return null;
    }
    return (
    <div key={fieldkey} className="mb-2 ">
        <span >{field.span}</span>
        <Select 
                name={fieldkey}
                id={fieldkey}
                isMulti
                options={options}
                value={selectedOptions}
                onChange={(selected) => handleChange(selected)}
                className="form-control react-select-container" 
                classNamePrefix="react-select"
    
        />
    </div>
)}

function GenerateSelect({formData, fieldkey, field, socket, setData}){
    const [options, updateOptions] = useState([])
    const reliesOn = field.filter?.key;
    

    
    useEffect(() =>{
        const collection = field.source
        const url = selectSources[collection]
        if(mapOptions.includes(collection)){
            if(formData[reliesOn]){
                let data = Array.isArray(formData[reliesOn]) ? formData[reliesOn][0] : formData[reliesOn]
                if(typeof data === "object"){
                    data = data.value
                }
                const filterKey = field.filter.as
                const filter = {[filterKey]:data}
                socket.subscribe({url, type:"mapOptions", collection, commandId:fieldkey, query:{filter}, setData:updateOptions}, )
            }
            else{
                setData({...formData, [fieldkey]:undefined})
                return updateOptions([])
            }
        }
        else{
            let filter = field.filter
            if(filter && reliesOn){
                if(!formData[reliesOn]) {
                    setData({...formData, [fieldkey]:undefined})

                    return updateOptions([])
                    
                }
                let data = Array.isArray(formData[reliesOn]) ? formData[reliesOn][0] : formData[reliesOn]
                if(typeof data === "object"){
                    data = data.value
                }
                const filterKey = field.filter.as
                filter = {[filterKey]:data}
            }
            socket.subscribe({url, type:"getOptions", collection, commandId:fieldkey, query:{filter},setData:updateOptions})
        }

    }, [fieldkey, field, formData[reliesOn]])
    const handleChange = (selectedOption) => {
        const selected = selectedOption?.value;
        setData({...formData, [fieldkey]:selected})

    };

    return (
        <div>
            <span >{field.label}</span>
            <Select 
                id={fieldkey}
                name={fieldkey}
                options={options}
                value={(options|| []).find(opt => formData[fieldkey] && opt.value === formData[fieldkey]) || null}
                onChange={(selected) => handleChange(selected)}
                className="form-control react-select-container" 
                classNamePrefix="react-select"
            />
        </div>
)}

function GenerateCreatable({formData,fieldkey, field, socket, setData}){
    const [gotOptions, updateGotOptions] = useState([])
    const [createdOptions, updateCreatedOptions] = useState([])
    const [options, updateOptions] = useState([])
    useEffect(() =>{
        const collection = field.source
        const url = creatableSources[collection]
        socket.subscribe({url, type:"getOptions", collection, commandId:fieldkey, setData:updateGotOptions})
    }, [fieldkey, field])
    useEffect(() => {
        // Combine options from both sources
        updateOptions([...gotOptions, ...createdOptions]);
    }, [gotOptions, createdOptions]);
    const handleCreateOption = (newOptionValue) => {
        const newOption = {
            value: newOptionValue,
            label: newOptionValue
        };
        // Add new option to created options list
        updateCreatedOptions(prevOptions => [...prevOptions, newOption]);
        // You may want to also update formData here if required
        const selected = [...(formData[fieldkey] || []), newOption.value];
        setData({...formData, [fieldkey]:selected})
    };
    const handleChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setData({...formData, [fieldkey]:selectedValues})
    };
    return(
        <div key={fieldkey} className="mb-2 ">
            <span >{field.label}</span>
            <Creatable 
                    isMulti
                    id={fieldkey}
                    name={fieldkey}
                    options={options}
                    value={options.filter(opt => formData[fieldkey]?.includes(opt.value)) || []}
                    onChange={handleChange}
                    onCreateOption={handleCreateOption} // Handle new options being created
                    className="form-control react-select-container" 
                    classNamePrefix="react-select"
    />
        </div>
    )
}

function SuperSelect({ formData, fieldkey, socket, field, setData}){
    const [categories, setCategories] = useState([]);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        if(formData[fieldkey]){
            setCategories(formData[fieldkey])
        }
    }, [formData[fieldkey]])

    // Fetch options based on the collection
    useEffect(() => {
        const collection = field.source; // Assuming `data.source` has the collection name
        if(mapOptions.includes(collection)) return
        const url = selectSources[collection]; // Adjust the URL accordingly

        socket.subscribe({
            url,
            type: "getOptions",  // Specify the type of request
            collection,
            commandId: fieldkey,
            setData: setOptions, // Update the options once they are fetched
        });
    }, [fieldkey, field.source, socket]);

    // Add a new category to the list
    const addCategory = () => {
        const newCategory = { id: Date.now(), label: "", value: [] };
        const updatedCategories = [...categories, newCategory];
        //setCategories(updatedCategories);
        setData({...formData, [fieldkey]:updatedCategories})
    };

    // Update the name of a category
    const updateCategoryName = (index, name) => {
        const updatedCategories = [...categories];
        updatedCategories[index].label = name;
        //setCategories(updatedCategories);
        setData({...formData, [fieldkey]:updatedCategories})
    };

    // Update the selections of a specific category
    const updateSelections = (index, selected) => {
        const updatedCategories = [...categories];
        updatedCategories[index].value = selected.map(option => option.value);
        //setCategories(updatedCategories);
        setData({...formData, [fieldkey]:updatedCategories})
    };

    // Remove a category from the list
    const removeCategory = (index) => {
        const updatedCategories = categories.filter((_, i) => i !== index);
        //setCategories(updatedCategories);
        setData({...formData, [fieldkey]:updatedCategories})
    };

    return (
        <div key={fieldkey} className="mb-2 ">
            <span >{field.label}</span>
            <div className="input-group" id={fieldkey} name={fieldkey}>
                <Table bordered>
                    <thead>
                        <tr>
                            <th>{field.categoryLabel}</th>
                            <th>Selections</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={field.categoryLabel}
                                        value={category.label}
                                        onChange={(e) => updateCategoryName(index, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <Select
                                        isMulti
                                        options={options.map(option => ({
                                            value: option.id,
                                            label: option.name,
                                        }))} // Map options into {value, label} format
                                        value={category.value.map(val => ({
                                            value: val,
                                            label: options.find(option => option.id === val)?.name,
                                        }))}
                                        onChange={(selected) => updateSelections(index, selected)}
                                        className="form-control react-select-container" 
                                        classNamePrefix="react-select"
                                    />
                                </td>
                                <td>
                                    <Button onClick={() => removeCategory(index)} className="btn btn-danger">
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Button onClick={addCategory} className="btn btn-primary mb-2">
                    Add {field.categoryLabel}
                </Button>
            </div>
        </div>
    );
    
};



function GenerateTextCreatable({formData, fieldkey, field, setData}){
    const [selectedValues, setSelectedValues] = useState([])
    const [inputValue, setInputValue] = useState('');
    const components = {
        DropdownIndicator: null,
    };
    useEffect(() => {
        if(formData[fieldkey]){
            const temp = formData[fieldkey].map(val => ({
                label: val,  // Use the string itself as the label
                value: val   // Store the string as the value
            })) 
            setSelectedValues(temp)
        }
    }, [formData[fieldkey]])
    // State for handling input and dynamic creation of options
    const handleInputChange = (newInputValue) => {
        setInputValue(newInputValue);
    };
    const handleKeyDown = (event) => {
        if (!inputValue) return;
        switch (event.key) {
            case 'Enter':
            case 'Tab':
                // Add new option to selected value
                const previousValues = selectedValues ? selectedValues.map(option => option.value) : [];
                //const newOption = {label:inputValue, value:inputValue}
                const updatedValues = [...previousValues, inputValue]
                //setSelectedValues((prev) => [...prev, newOption])
                setData({...formData, [fieldkey]:updatedValues})
                setInputValue(''); // Clear input field
                event.preventDefault();
                break;
            default:
                break;
            }
    };
    const handleChange = (selectedOptions) => {
        //setSelectedValues(selectedOptions)
        const selected = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setData({...formData, [fieldkey]:selected})
    };
    return (
        <div key={fieldkey} className="mb-2 ">
            <span >{field.label}</span>
            <Creatable
                name={fieldkey}
                id={fieldkey}
                components={components}
                isMulti
                options={selectedValues} // Use selectedValues as options, so it contains both initial and dynamically added options
                value={selectedValues}
                menuIsOpen={false}
                onChange={handleChange}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                inputValue={inputValue}
                placeholder="Type and press Enter to add new item..."
                className="form-control react-select-container" 
                classNamePrefix="react-select"
            />
        </div>
    );
}



function GenerateModifyOthers({formData, fieldkey, field, socket,  setData}){
    const [options, setOptions] = useState([]);
    const [id, setId] = useState(null)
    useEffect(() => {
        if(formData.id){
            setId(formData.id)
        }
    }, [formData.id])


    useEffect(() => {
        const collection = field.list
        const id = formData.id
        const url = selectSources[field.source]
        if(id && field.method === "remove"){
            const query = {filter:{[collection]:[id]}}
            socket.subscribe({
                url,
                type:"getOptions",
                collection:field.source,
                setData:setOptions,
                commandId: fieldkey,
                query
            })
        }
        else if(field.method === "add"){
            const filter = {}
            if(id){
                filter[`excludes${collection}`] = [id]
            }
            const query = {filter}
            socket.subscribe({
                url,
                type:"getOptions",
                collection:field.source,
                commandId: fieldkey,
                setData:setOptions,
                query

            })
        }
    },[field, id,  socket])
    const handleChange = (selectedOption) => {

        const selected = (selectedOption|| []).map(opt => opt.value) || [];

        setData({...formData, [fieldkey]:selected})
    };
    if(field.method === "remove" && !id){
        return
    }
    
    return (
    <div key={fieldkey} className="mb-2 ">
        <span >{field.label}</span>
        <Select 
            name={fieldkey}
            id={fieldkey}
            isMulti
            options={options}
            value={options.filter(opt => (formData[fieldkey] || []).includes(opt.value))}
            onChange={(selected) => handleChange(selected)}
            className="form-control react-select-container" 
            classNamePrefix="react-select"
        />
    </div>
)}

function Section({ section, updateSection, removeSection }){
    const handleChange = (fieldkey, value) => {
        updateSection({ ...section, [fieldkey]: value });
    };

    const addSubsection = () => {
        const newSubsection = {
            id: Date.now(),
            section: "",
            text: "",
            subsections: []
        };
        handleChange("subsections", [...section.subsections, newSubsection]);
    };

    const updateSubsection = (index, updatedSubsection) => {
        const newSubsections = [...section.subsections];
        newSubsections[index] = updatedSubsection;
        handleChange("subsections", newSubsections);
    };

    const removeSubsection = (index) => {
        const newSubsections = section.subsections.filter((_, i) => i !== index);
        handleChange("subsections", newSubsections);
    };

    return (
        <div className="container">
            <input
                type="text"
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
                <Button onClick={addSubsection} className="btn btn-primary">Add Subsection</Button>
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
            <Button onClick={removeSection} className="btn btn-danger">Remove Subsection</Button>
        </div>
    );
};


function SectionAdder({formData, fieldkey, setData, field}){
    const [sections, setSections] = useState([]);

    useEffect(() => {
        if(formData[fieldkey]){
            setSections(formData[fieldkey])
        }
    }, [formData[fieldkey]])

    const addSection = () => {
        const newSection = { id: Date.now(), section: "", text: "", subsections: [] };
        const newSections = [...sections, newSection]
        //setSections(newSections);
        setData({ ...formData, [fieldkey]: newSections });  // immediately update parent
    };
    
    const updateSection = (index, updatedSection) => {
        const newSections = [...sections];
        newSections[index] = updatedSection;
        //setSections(newSections);
        setData({ ...formData, [fieldkey]: newSections });  // immediately update parent
    };

    const removeSection = (index) => {
        const newSections = sections.length > 1 ? sections.filter((_, i) => i !== index) : [];
        setSections(newSections);
        setData({ ...formData, [fieldkey]: newSections });  // immediately update parent
    };
    return (
        <div key={fieldkey} className="mb-2 ">
            <span >{field.label}</span>
            <div name ={fieldkey} id={fieldkey} className="formData-editor">
                <Button onClick={addSection} className="btn btn-primary">Add Section</Button>

                {(formData[fieldkey] || []).map((section, i) => (
                    <Section
                        key={section.id}
                        section={section}
                        updateSection={(updated) => updateSection(i, updated)}
                        removeSection={() => removeSection(i)}
                    />
                ))}
                
            </div>
        </div>
    );
}

function GenerateForm({formData, form, socket, setData, id}){
    const renderField = (fieldkey, field) => {
        switch(field.type){
            case 'text':
                return(
                    <div key={fieldkey} className="mb-2 ">
                        <label htmlFor={fieldkey}>{field.label}</label>
                        <input 
                            name={fieldkey}
                            id={fieldkey}
                            type="text"
                            className="form-control"
                            value={formData[fieldkey] || ''}
                            onChange={(e) => setData({...formData, [fieldkey]:e.target.value})}
                            autoComplete='off'
                        />

                    </div>
                )
            case 'text-area':
                return(
                    <div key={fieldkey} className="mb-2 ">
                        <label htmlFor={fieldkey}>{field.label}</label>
                        <textarea 
                            name={fieldkey}
                            type="text"
                            id={fieldkey}
                            className="form-control"
                            value={formData[fieldkey] || ''}
                            onChange={(e) => setData({...formData, [fieldkey]:e.target.value})}
                            placeholder={field.placeholder || ''}
                        />
                    </div>
                    
                )
            case 'select':
                return <GenerateSelect 
                        formData={formData} 
                        className="form-control"

                        key={fieldkey} 
                        fieldkey={fieldkey} 
                        field={field} 
                        socket={socket} 
                        setData={setData} 
                    />
            case 'multi-select':
                return <GenerateMultiSelect 
                    formData={formData} 
                    className="form-control"

                    key={fieldkey} 
                    fieldkey={fieldkey} 
                    field={field} 
                    socket={socket} 
                    setData={setData} 
                />
            case 'checkbox':
                return (
                    <div key={fieldkey}  className="mb-2 form-check">
                        <label  htmlFor={fieldkey}>{field.label}</label>
                        <input
                                type="checkbox"
                                className="form-check-input"
                                id={fieldkey}
                                name={fieldkey}
                                checked={formData[fieldkey] || false}
                                onChange={(e) => setData({ ...formData, [fieldkey]: e.target.checked })}
                        />
                    </div>
                );
            case "super-select":
                return <SuperSelect 
                    formData={formData} 
                    key={fieldkey} 
                    className="form-control"

                    fieldkey={fieldkey} 
                    field={field} 
                    socket={socket} 
                    setData={setData} 
                />
            case "creatable":
                return <GenerateCreatable 
                    formData={formData} 
                    key={fieldkey} 
                    fieldkey={fieldkey} 
                    className="form-control"

                    field={field} 
                    socket={socket} 
                    setData={setData} 
                />
            case "text-creatable":
                return <GenerateTextCreatable 
                    formData={formData} 
                    className="form-control"

                    key={fieldkey} 
                    fieldkey={fieldkey} 
                    field={field} 
                    setData={setData} 
                />
            case "modify-others":
                return <GenerateModifyOthers 
                    formData={formData} 
                    key={fieldkey} 
                    fieldkey={fieldkey} 
                    className="form-control"

                    field={field} 
                    socket={socket} 
                    setData={setData}
                />
            case "section-adder":
                return <SectionAdder 
                    formData={formData}
                    key={fieldkey}
                    className="form-control"

                    fieldkey={fieldkey} 
                    setData={setData}
                    field={field}
                />
            case "custom-adder":
                return <CustomAdder 
                    formData={formData} 
                    key={fieldkey} 
                    className="form-control"

                    fieldkey={fieldkey} 
                    field={field} 
                    socket={socket} 
                    setData={setData} 
                />
            default:
                return null
            
        }
    }
    return(
        <div>
            {form && Object.keys(form).map((fieldkey) => {
                const field = form[fieldkey];
                    return (renderField(fieldkey, field));
                })
            }
        </div>
    )
}

function CustomAdder({ formData, setData, field, fieldkey, socket }) {
    const [customFields, setCustomFields] = useState(formData[fieldkey] || []);
    useEffect(() => {
        if(formData[fieldkey]){
            setCustomFields(formData[fieldkey])
        }
    }, [formData[fieldkey]])
    const addCustomField = () => {
        const newCustom = {
            id: Date.now(),
            label: "",
            type: "",  // the edit type
            source: "",
            value: [],
        };
        const newList = [...customFields, newCustom];
        //setCustomFields(newList);
        setData({ ...formData, [fieldkey]: newList });
    };

    const updateCustomField = (index, updated) => {
        const newList = [...customFields];
        newList[index] = updated;
        //setCustomFields(newList);
        setData({ ...formData, [fieldkey]: newList });
    };

    const removeCustomField = (index) => {
        const newList = customFields.filter((_, i) => i !== index);
        //setCustomFields(newList);
        setData({ ...formData, [fieldkey]: newList });
    };
    return (
        <div key={fieldkey} className="mb-2 ">
            <span >{field.label}</span>
            <div id={fieldkey} className="formData-editor" name={fieldkey}>
                <Button onClick={addCustomField} className="btn btn-primary">Add Custom Field</Button>
                {customFields.map((item, i) => (
                    <CustomField
                        key={item.id}
                        custom={item}
                        updateCustom={(updated) => updateCustomField(i, updated)}
                        removeCustom={() => removeCustomField(i)}
                        socket={socket}
                        index={i}
                    />
                ))}
            </div>
        </div>
    );
}

function CustomSelect({ custom, index, socket, updateCustom }) {
    const [options, setOptions] = useState([]);
    const { source, value = [] } = custom;
    const prevCommandIdRef = useRef(null);
    const prevUrlRef = useRef(null);

    

    useEffect(() => {
        if (!source || !selectSources[source]) return;

        const url = selectSources[source];
        const commandId = `custom-select-${index}-${source}`;

        if (prevCommandIdRef.current && prevUrlRef.current &&
            (prevCommandIdRef.current !== commandId || prevUrlRef.current !== url)) {
            socket.unsubscribe(prevUrlRef.current, prevCommandIdRef.current);
        }

        prevCommandIdRef.current = commandId;
        prevUrlRef.current = url;

        socket.subscribe({
            url,
            type: "getOptions",
            collection: source,
            commandId,
            query: {},
            setData: setOptions
            
        });

        return () => {
            socket.unsubscribe(url, commandId);
        };
    }, [source, index]);

    const handleChange = (selected) => {
        const selectedValues = selected?.map(opt => opt.value) || [];
        updateCustom({ ...custom, value: selectedValues });
    };

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    return (
        <Select
            isMulti
            options={options}
            value={selectedOptions}
            onChange={handleChange}
            placeholder={`Select ${custom.label || 'value'}`}
            className="form-control react-select-container" 
            classNamePrefix="react-select"
        />
    );
}



function CustomField({ custom, updateCustom, removeCustom, socket, index}) {
    const editOptions = [
        { label: "Text", value: "text" },
        { label: "Text Area", value: "text-area" },
        { label: "Select", value: "select" },
    ];
    const sourceOptions = [
        {label:"Races",value:"races"},
        {label:"Characters",value:"characters"},
        {label:"Worlds",value:"worlds"},
        {label:"Countries",value:"countries"},
        {label:"Magic Systems",value:"magicsystems"},
        {label:"Organizations",value:"organizations"},
        {label:"Wildlife",value:"wildlife"},
        {label:"Flora",value:"flora"},
        {label:"Biomes",value:"biomes"}
    ]

    const { label = "", edit = "text", source = null } = custom;


    const handleChange = (fieldkey, value) => {
        const updated = { ...custom, [fieldkey]: value };
    
        // Clear source if edit type changes from select
        if (fieldkey === "edit" && value !== "select") {
          updated.source = null;
        }
    
        updateCustom(updated);
      };

    return (
        <div key={index} className="custom-field">
          <input
            type="text"
            placeholder="Label"
            value={label}
            onChange={(e) => handleChange("label", e.target.value)}
            className="form-control mb-2"
          />
    
          <Select
            options={editOptions}
            value={editOptions.find(opt => opt.value === edit)}
            onChange={(selected) => handleChange("edit", selected?.value)}
            placeholder="Select Edit Type"
            className="mb-2 react-select-container" 
            classNamePrefix="react-select"
/>
    
          {edit === "select" && (
            <Select
              options={sourceOptions}
              value={sourceOptions.find(opt => opt.value === source)}
              onChange={(selected) => handleChange("source", selected?.value)}
              placeholder="Select Source"
              className="mb-2 react-select-container" 
              classNamePrefix="react-select"
            />
          )}

        {edit === "text" && (
        <input
            type="text"
            className="mb-2"
            value={Array.isArray(custom.value) ? custom.value?.[0] || "" : custom.value}
            onChange={(e) =>
            updateCustom({ ...custom, value: [e.target.value] })
            }
            placeholder="Enter value"
        />
        )}

        {edit === "text-area" && (
        <textarea
            className="form-control mb-2"
            value={Array.isArray(custom.value) ? custom.value?.[0] || "" : custom.value}
            onChange={(e) =>
            updateCustom({ ...custom, value: [e.target.value] })
            }
            placeholder="Enter text"
        />
        )}

        {edit === "select" && source && (
        <CustomSelect
            custom={custom}
            updateCustom={updateCustom}
            socket={socket}
            index={index}
        />
        )}
    
          <button className="btn btn-danger" onClick={removeCustom}>
            Remove Field
          </button>
        </div>
    );

}
