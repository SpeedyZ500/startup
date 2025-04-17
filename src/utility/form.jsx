import React, { useEffect, useState, useMemo} from 'react';
import {useWebSocketFacade} from './utility.jsx'
import Select from 'react-select'
import Creatable from 'react-select/creatable';
import { AuthState } from '../login/authState.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { ButtonGroup } from 'react-bootstrap';


const selectSources = {
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
    biomes:"/worldbuilding/biomes",
}
const mapOptions = [
    "towns",
    "continents"
]

const creatableSources = {
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

function extractIDfromURL(){
    let path = window.location.pathname;
    if(!path.startsWith("/")){
        path = "/" + path;
    }
    for(const [fieldkey, value] of Object.entries(selectSources)){
        if(path.startsWith(value)){
            const id = path.replace(value, "").replace(/\/$/, ""); // Remove trailing slash if any
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
        for(fieldkey in form){
            if(form[fieldkey].type === "modify-others"){
                const {method, source} = form[fieldkey];
                const ids = formData[fieldkey]
                const url = selectSources[source]
                if(method && source && url && id && ids && (!Array.isArray(ids) || ids.length > 0)){
                    fetch(`/api${url}/${source}/${method}`, {
                        method:"PATCH",
                        headers: {"content-type": "application/json"},
                        body: JSON.stringify({ids, id})
                    })
                    .then(handleErrors)
                    .then (() => {
                        const affectedIds = Array.isArray(ids) ? ids : [ids];
                        affectedIds.forEach(modifiedId => {
                        socket.notify?.({
                            collection: url,
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
            consol.error(error.message)
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
            consol.error(error.message)
            handleClose?.()
        })
        if(id){
            fetch(`/api${url}/${id}`, {
                method:"GET",
                headers:{'Content-Type': 'application/json'}
            })
            .then(handleErrors)
            .then((data) => {
                consol.error(null);
                setData(data)
            })
            .catch((error) =>{
                consol.error(error.message)
                handleClose?.()
            })
        }
    }, [url,id])

    const handleSubmit = () => {
        if(id){
            fetch(`/api${url}/${id}`,{
                method:"PUT",
                headers: {"content-type": "application/json"},
                body:JSON.stringify(formData)
                
            })
            .then(handleErrors)
            .then(data => {
                socket.notify({collection:url, type:"PUT", id:data.id})
                handleModify(data.id,formData,form,socket)
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
                console.log(JSON.stringify(data))
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
                 <ButtonGroup>
                    <GenerateForm formData={formData} form={memoizedFields} socket={socket} setData={setData} currUrl={url}/>
                    <Button onClick={handleSubmit} variant='primary'>Submit</Button>
                    <Button onClick={handleClose} variant='secondary'>Close</Button>
                </ButtonGroup>
            </div>
           
        )
    }
    return(
        <div>
            <h1>{form &&form.title || ""}</h1>
             <ButtonGroup>
                <GenerateForm formData={formData} form={memoizedFields} socket={socket} setData={setData} currUrl={url}/>
                <Button onClick={handleSubmit} variant='primary'>Submit</Button>
                <Button onClick={handleClose} variant='secondary'>Close</Button>
            </ButtonGroup>
        </div>
    )
}

function GenerateMultiSelect({formData, fieldkey, field, socket, setData}){
    const [options, updateOptions] = useState([])
    const [qualifierOptions, updateQualifierOptions] = useState([])
    useEffect(() =>{
        const collection = field.source
        const url = selectSources[collection]
        if(mapOptions.includes(collection)){
            const reliesOn = field.filter.key 
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
            if(filter && filter.key){
                if(!formData[filter.key]) {
                    setData({...formData, [fieldkey]:undefined})
                    return updateOptions([])
                }
                let data = Array.isArray(formData[filter.key]) ? formData[filter.key][0] : formData[filter.key]
                if(typeof data === "object"){
                    data = data.value
                }
                const filterKey = field.filter.as
                filter = {[filterKey]:data}
            }
            socket.subscribe({url, type:"getOptions", collection, commandId:fieldkey, query:{filter},setData:updateOptions})
        }

    }, [fieldkey, field, formData])

    useEffect(() => {
        if (!field.qualifier || !formData[field.qualifierKey]) return;
    
        const collection = field.source;
        const url = selectSources[collection];
    
        let qualifierValue = formData[field.qualifierKey];
        if (Array.isArray(qualifierValue)) qualifierValue = qualifierValue[0];
        if (typeof qualifierValue === "object") qualifierValue = qualifierValue.value;
    
        const filter = {
            ...field.qualifier.filter,
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


    const handleChange = (selectedOption) => {
        const selected = selectedOption?.map(opt => opt.value) || [];
        setData({...formData, [fieldkey]:selected})
    };
    if(field.qualifierKey && !qualifierOptions.some(q => q.value === formData[field.qualifierKey])){
        setData({...formData, [fieldkey]:[]})
        return null;
    }
    return (
    <Select 
        isMulti
        options={options}
        value={options.filter(opt => (formData[fieldkey] || []).includes(opt.value))}
        onChange={(selected) => handleChange(selected)}
        className="form-control"
    />
)}

function GenerateSelect({formData, fieldkey, field, socket, setData}){
    const [options, updateOptions] = useState([])
    useEffect(() =>{
        const collection = field.source
        const url = selectSources[collection]
        if(mapOptions.includes(collection)){
            const reliesOn = field.filter.key 
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
            if(filter && filter.key){
                if(!formData[filter.key]) {
                    setData({...formData, [fieldkey]:undefined})

                    return updateOptions([])
                    
                }
                let data = Array.isArray(formData[filter.key]) ? formData[filter.key][0] : formData[filter.key]
                if(typeof data === "object"){
                    data = data.value
                }
                const filterKey = field.filter.as
                filter = {[filterKey]:data}
            }
            socket.subscribe({url, type:"getOptions", collection, commandId:fieldkey, query:{filter},setData:updateOptions})
        }

    }, [fieldkey, field, formData])
    const handleChange = (selectedOption) => {
        const selected = selectedOption?.value;
        setData({...formData, [fieldkey]:selected})

    };

    return (
    <div key={fieldkey}>
        <label htmlFor={fieldkey}>{field.label || ""}</label>
        <Select 
            name={fieldkey}
            options={options}
            value={(options|| []).find(opt => formData[fieldkey] && opt.value === formData[fieldkey]) || null}
            onChange={(selected) => handleChange(selected)}
            className="form-control"
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
    }, [fieldkey, field, formData])
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
        <div key={fieldkey}>
            <label htmlFor={fieldkey}>{field && field.label || ""}</label>
            <Creatable 
                isMulti
                options={options}
                value={options.filter(opt => formData[fieldkey]?.includes(opt.value)) || []}
                onChange={handleChange}
                onCreateOption={handleCreateOption} // Handle new options being created
                className="form-control"
            />
        </div>
    )
}

function SuperSelect({ formData, fieldkey, socket, field, setData}){
    const [categories, setCategories] = useState([]);
    const [options, setOptions] = useState([]);

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
        setCategories(updatedCategories);
        setData({...formData, [fieldkey]:updatedCategories})
    };

    // Update the name of a category
    const updateCategoryName = (index, name) => {
        const updatedCategories = [...categories];
        updatedCategories[index].label = name;
        setCategories(updatedCategories);
        setData({...formData, [fieldkey]:updatedCategories})
    };

    // Update the selections of a specific category
    const updateSelections = (index, selected) => {
        const updatedCategories = [...categories];
        updatedCategories[index].value = selected.map(option => option.value);
        setCategories(updatedCategories);
        setData({...formData, [fieldkey]:updatedCategories})
    };

    // Remove a category from the list
    const removeCategory = (index) => {
        const updatedCategories = categories.filter((_, i) => i !== index);
        setCategories(updatedCategories);
        setData({...formData, [fieldkey]:updatedCategories})
    };

    return (
        <div className="input-group" key={fieldkey}>
            <h5>{field.label}</h5>

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
                                    className="form-control"
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
    );
};



function GenerateTextCreatable({formData, fieldkey, field, setData}){
    const textCreatableValues = formData[fieldkey] ? formData[fieldkey].map(val => ({
        label: val,  // Use the string itself as the label
        value: val   // Store the string as the value
    })) : [];

    // State for handling input and dynamic creation of options
    const [inputValue, setInputValue] = useState('');
    const [selectedValues, setSelectedValues] = useState(textCreatableValues);

    const handleInputChange = (newInputValue) => {
        setInputValue(newInputValue);
    };

    const handleKeyDown = (event) => {
        if (!inputValue) return;
        switch (event.key) {
            case 'Enter':
            case 'Tab':
                const newOption = {
                    label: inputValue,
                    value: inputValue,
                };
                
                // Add new option to selected values
                setSelectedValues((prev) => [...prev, newOption]);
                const updatedValues = [...(value || []), inputValue];
                setData({...formData, [fieldkey]:updatedValues})
                setInputValue(''); // Clear input field
                event.preventDefault();
                break;
            default:
                break;
            }
};

return (
    <div className="mb-3" key={fieldkey}>
        <label htmlFor={fieldkey}>{field.label}</label>
        <Creatable
            name={fieldkey}
            isMulti
            options={selectedValues} // Use selectedValues as options, so it contains both initial and dynamically added options
            value={selectedValues}
            onChange={(newValue) => {
                setSelectedValues(newValue);
                const updatedValues = newValue.map(opt => opt.value);
                setData({...formData, [fieldkey]:updatedValues})

            }}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            inputValue={inputValue}
            placeholder="Type and press Enter to add new item..."
            className="form-control"
        />
    </div>
);
}



function GenerateModifyOthers({formData, fieldkey, field, socket, currUrl, setData}){
    const [options, setOptions] = useState([]);
    useEffect(() => {
        const collection = Object.keys(selectSources).find(collect => selectSources[collect] === currUrl);
        const url = selectSources[field.source]
        const id = formData.id
        if(id && field.method === "remove"){
            const query = {filter:{[collection]:id}}
            socket.subscribe({
                url,
                type:"getOptions",
                collection:field.source,
                setData:setOptions,
                query

            })
        }
        else if(field.method === "add"){
            const filter = {}
            if(id){
                filter[`excludes${collection}`] = id
            }
            const query = {filter}
            socket.subscribe({
                url,
                type:"getOptions",
                collection:field.source,
                setData:setOptions,
                query

            })
        }
    },[field, formData, currUrl, socket])
    const handleChange = (selectedOption) => {
        const selected = (selectedOption|| []).map(opt => opt.value) || [];
        setData({...formData, [fieldkey]:selected})
    };
    
    return (
    <div key={fieldkey}>
        <label htmlFor={fieldkey}>{field.label}</label>
        <Select 
            name={fieldkey}
            isMulti
            options={options}
            value={options.filter(opt => (formData[fieldkey] || []).includes(opt.value))}
            onChange={(selected) => handleChange(selected)}
            className="form-control"
        />
    </div>
)}

const Section = ({ section, updateSection, removeSection }) => {
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
    const [sections, setSections] = useState(formData[fieldkey] || []);
    const addSection = () => {
        const newSection = { id: Date.now(), section: "", text: "", subsections: [] };
        const newSections = [...sections, newSection]
        setSections(newSections);
        setData({ ...formData, [fieldkey]: newSections });  // immediately update parent
    };

    const updateSection = (index, updatedSection) => {
        const newSections = [...sections];
        newSections[index] = updatedSection;
        setSections(newSections);
        setData({ ...formData, [fieldkey]: newSections });  // immediately update parent

    };

    const removeSection = (index) => {
        const newSections = sections.length > 1 ? sections.filter((_, i) => i !== index) : [];
        setSections(newSections);
        setData({ ...formData, [fieldkey]: newSections });  // immediately update parent
    };
    return (
        <div className="formData-editor" key={fieldkey}>
            <label className="input-group-text" htmlFor={fieldkey}>{field.label}</label>
            <div name ={fieldkey}>
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
            
        </div>
    );

}

function GenerateForm({formData, form, socket, setData, currUrl}){

    const renderField = (fieldkey, field) => {
        switch(field.type){
            case 'text':
                return(
                    <div key={fieldkey}>
                        <label htmlFor={fieldkey}>{field.label}</label>
                        <input 
                            name={fieldkey}
                            type="text"
                            value={formData[fieldkey] || ''}
                            onChange={(e) => setData({...formData, [fieldkey]:e.target.value})}
                        />
                    </div>
                )
            case 'text-area':
                return(
                    <div key={fieldkey}>
                        <label htmlFor={fieldkey}>{field.label}</label>
                        <textarea 
                            name={fieldkey}
                            type="text"
                            value={formData[fieldkey] || ''}
                            onChange={(e) => setData({...formData, [fieldkey]:e.target.value})}
                            placeholder={field.placeholder || ''}
                        />
                    </div>
                )
            case 'select':
                return <GenerateSelect 
                        formData={formData} 
                        key={fieldkey} 
                        field={field} 
                        socket={socket} 
                        setData={setData} 
                    />
            case 'multi-select':
                return <GenerateMultiSelect 
                    formData={formData} 
                    key={fieldkey} 
                    field={field} 
                    socket={socket} 
                    setData={setData} 
                />
            case 'checkbox':
                return (
                    <label key={fieldkey}>
                        <input
                            type="checkbox"
                            name={fieldkey}
                            checked={formData[fieldkey] || false}
                            onChange={(e) => setData({ ...form, [fieldkey]: e.target.checked })}
                        />
                        {field.label}
                    </label>
                );
            case "super-select":
                return <SuperSelect 
                    formData={formData} 
                    key={fieldkey} 
                    field={field} 
                    socket={socket} 
                    setData={setData} 
                />
            case "creatable":
                return <GenerateCreatable 
                    formData={formData} 
                    key={fieldkey} 
                    field={field} 
                    socket={socket} 
                    setData={setData} 
                />
            case "text-creatable":
                return <GenerateTextCreatable 
                    formData={formData} 
                    key={fieldkey} 
                    field={field} 
                    setData={setData} 
                />
            case "modify-others":
                return <GenerateModifyOthers 
                    formData={formData} 
                    key={fieldkey} 
                    field={field} 
                    socket={socket} 
                    setData={setData} 
                    currUrl={currUrl}
                />
            case "section-adder":
                return <SectionAdder 
                    formData={formData}
                    key={fieldkey}
                    setData={setData}
                    field={field}
                />
            case "custom-adder":
                return <CustomAdder 
                    formData={formData} 
                    key={fieldkey} 
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
                    return (
                        <div key={fieldkey}>
                            <label htmlFor={fieldkey}>{field.label}</label>
                            {renderField(fieldkey, field)}
                        </div>
                    );
                })
            }
        </div>
    )
}

function CustomAdder({ formData, setData, field, fieldkey, socket }) {
    const [customFields, setCustomFields] = useState(formData[fieldkey] || []);
    const addCustomField = () => {
        const newCustom = {
            id: Date.now(),
            label: "",
            type: "",  // the edit type
            source: "",
            values: [],
        };
        const newList = [...customFields, newCustom];
        setCustomFields(newList);
        setData({ ...formData, [fieldkey]: newList });
    };

    const updateCustomField = (index, updated) => {
        const newList = [...customFields];
        newList[index] = updated;
        setCustomFields(newList);
        setData({ ...formData, [fieldkey]: newList });
    };

    const removeCustomField = (index) => {
        const newList = customFields.filter((_, i) => i !== index);
        setCustomFields(newList);
        setData({ ...formData, [fieldkey]: newList });
    };
    return (
        <div className="formData-editor" key={fieldkey}>
            <label className="input-group-text">{field.label}</label>
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
    );

}

function CustomSelect({ custom, index, socket, updateCustom }) {
    const [options, setOptions] = useState([]);
    const { source, values = [] } = custom;

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
        updateCustom({ ...custom, values: selectedValues });
    };

    const selectedOptions = options.filter(opt => values.includes(opt.value));

    return (
        <Select
            isMulti
            options={options}
            value={selectedOptions}
            onChange={handleChange}
            placeholder={`Select ${custom.label || 'values'}`}
            className="form-control"
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
        <div className="custom-field">
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
            className="mb-2"
          />
    
          {edit === "select" && (
            <Select
              options={sourceOptions}
              value={sourceOptions.find(opt => opt.value === source)}
              onChange={(selected) => handleChange("source", selected?.value)}
              placeholder="Select Source"
              className="mb-2"
            />
          )}

        {edit === "text" && (
        <input
            type="text"
            className="form-control mb-2"
            value={custom.values?.[0] || ""}
            onChange={(e) =>
            updateCustom({ ...custom, values: [e.target.value] })
            }
            placeholder="Enter value"
        />
        )}

        {edit === "text-area" && (
        <textarea
            className="form-control mb-2"
            value={custom.values?.[0] || ""}
            onChange={(e) =>
            updateCustom({ ...custom, values: [e.target.value] })
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
