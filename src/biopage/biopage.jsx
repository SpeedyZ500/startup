import React, {Fragment, useEffect, useState, useRef} from "react";
import { useParams } from "react-router-dom";

import {NavLink } from 'react-router-dom';


import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import "./biopage.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import Accordion from 'react-bootstrap/Accordion';
import {sanitizeId, formatJSONDate, filterProfanity} from'../utility/utility.js';
import { ButtonGroup } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Select from 'react-select'
import Creatable from 'react-select/creatable';



const Heading = ({ level, children, ...props }) => {
    const Tag = `h${level}`;
    return <Tag {...props}>{children}</Tag>;
  };

function generateRows(data){
    return data.map((entry, index) => {
        if (!entry || !entry.value || entry.value === "No Input" ) return null;
        if(Array.isArray(entry.value)){
            if(entry.value.length < 1){
                return
            }
            const isSubTable = entry.value.every(
                (item) => typeof item === "object" && Object.values(item).some(Array.isArray)
            );
            if(isSubTable){
                return(
                    <tr key={index}>
                        <td colSpan={2} style={{padding:0, margin:0}}>
                            <Table width="100%">
                                <thead>
                                    <tr>
                                        <th colSpan={2}>
                                            {entry.label}
                                        </th>
                                    </tr>
                                    
                                </thead>
                                <tbody>
                                    {generateRows(entry.value)}
                                </tbody>
                            </Table>
                        </td>
                    </tr>
                );     
            }
            else if(entry.value.every((item) => typeof item === "object")){
                return(
                    <tr key={index}>
                        <th>{entry.label}</th>
                        <td>
                            <Fragment>
                                {entry.value.map((item,subIndex) =>(
                                    <Fragment key={subIndex}>
                                        {typeof item === "object" && item.value !== null & item.value !== "" ? (
                                        item.path ? (
                                            <NavLink to={item.path}>{item.value}</NavLink>
                                        ) : (
                                            
                                            <span>{item.value}</span>
                                        ) ) : (
                                            <span>{item}</span>
                                        )}
                                        {subIndex < entry.value.length - 1 && <span>, </span>}
                                    </Fragment>
                                ))}
                            </Fragment>
                        </td>
                    </tr>
                )

            }
            else{
                return(
                    <tr key={index}>
                        <th>{entry.label}</th>
                        <td>
                            <Fragment>
                                {entry.value.map((item,subIndex) =>(
                                    <Fragment key={subIndex}>
                                        <span>{item}</span>
                                        {subIndex < entry.value.length - 1 && <br />}
                                    </Fragment>
                                ))}
                            </Fragment>
                        </td>
                    </tr>
                );
            }
        }
        return (
            <tr key={index}>
                <th>{entry.label}</th>
                <td>{typeof entry.value === "object" && entry.value !== undefined && entry.value.value !== null && entry.value.value !== "" ? (
                            entry.value.path ? (<NavLink to={entry.value.path}>{entry.value.value}</NavLink>
                        ): (
                            <span>{entry.value.value}</span>
                        )
                        ): <span>{entry.value}</span>
                    }
                </td>
            </tr>
          );
    });
};

function InfoCard({name, cardData, created, modified}) {
    return(
        <Table className="infocard adaptive">
            <thead>
                <tr>
                    <th colSpan={2}>{name}</th>
                </tr>
            </thead>
            <tbody>
                {generateRows(cardData)}
            </tbody>
            <tfoot>
                <tr>
                    <th>Created:</th>
                    <td>{formatJSONDate(created)}</td>
                </tr>
                <tr>
                    <th>Modified:</th>
                    <td>{formatJSONDate(modified)}</td>
                </tr>
            </tfoot>
        </Table>
    );

};

function NavGen({data, sectionPref=""}){
    if (!data || data.length === 0) return null;
    return data.map((entry, index) =>{
        return(
            <Fragment key={index}>
                <li>
                    <NavLink to={`#${sectionPref}${index}-${sanitizeId(entry.section)}`}>
                        {`${sectionPref}${index}-${entry.section}`}
                    </NavLink>
                </li>
                {entry.subsections && Array.isArray(entry.subsections) && entry.subsections.length > 0&&(
                    <ul>
                        <NavGen data= {entry.subsections} sectionPref={`${sectionPref}${index}.`} />
                    </ul>
                )}
            </Fragment>
            
        )
    }) 
}

function SectionsParse({data, level=2, sectionPref=""}){
    if (!data || data.length === 0) return null;
    return data.map((entry, index)=>{
        return(
            <Fragment key={index}>
                <Heading level={level} id={`${sectionPref}${index}-${sanitizeId(entry.section)}`}>{entry.section}</Heading>
                {entry.text && <p>{entry.text}</p>}
                {entry.subsections && 
                    <SectionsParse data={entry.subsections} level={level + 1} sectionPref={`${sectionPref}${index}.`}/>
                }
            </Fragment>
        )
    })
}

const MemoizedNavGen = React.memo(NavGen);
const MemoizedSectionsParse = React.memo(SectionsParse);
const MemoizedInfoCard = React.memo(InfoCard);

const Section = ({ section, updateSection, removeSection }) => {
    const handleChange = (key, value) => {
        updateSection({ ...section, [key]: value });
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


function SectionsEditor({bio, updateBio}){
    const [sections, setSections] = useState(bio.sections || []);
    const addSection = () => {
        const newSection = { id: Date.now(), section: "", text: "", subsections: [] };
        setSections([...sections, newSection]);
    };

    const updateSection = (index, updatedSection) => {
        const newSections = [...sections];
        newSections[index] = updatedSection;
        setSections(newSections);
    };

    const removeSection = (index) => {
        const newSections = sections.length > 1 ? sections.filter((_, i) => i !== index) : [];
        setSections(newSections);
    };

    // When sections change, update bio.sections in the parent component
    const saveSections = () => {
        updateBio({ ...bio, sections });
    };
    return (
        <div className="bio-editor">
            <label className="input-group-text">Bio Sections</label>
            <Button onClick={addSection} className="btn btn-primary">Add Section</Button>
            {sections.map((section, i) => (
                <Section
                    key={section.id}
                    section={section}
                    updateSection={(updated) => updateSection(i, updated)}
                    removeSection={() => removeSection(i)}
                />
            ))}
            <Button onClick={saveSections} className="btn btn-success">Save Sections</Button>
        </div>
    );

}



// ✅ SuperUpdater Component
function SuperUpdater({ value, valueUpdater, options }) {
    const [categories, setCategories] = useState(value || []);

    useEffect(() => {
        valueUpdater(categories);
    }, [categories, valueUpdater]);

    const handleAddCategory = () => {
        setCategories([...categories, { label: "", value: [] }]);
    };

    

    const handleCategoryNameChange = (index, value) => {
        const updatedCategories = [...categories];
        updatedCategories[index].label = value;
        setCategories(updatedCategories);
    };
    
    const handleCategorySelectionsChange = (index, selected) => {
        const updatedCategories = [...categories];
        updatedCategories[index].value = selected.map(option => option.value);
        setCategories(updatedCategories);
    };

    const handleRemoveCategory = (index) => {
        const updatedCategories = categories.filter((_, i) => i !== index);
        setCategories(updatedCategories);
    };

    return (
        <div>
            {categories.map((category, index) => (
                <div key={index} className="category-container">
                    <div>
                        <input
                            type="text"
                            className="form-control"
                            value={category.label}
                            onChange={(e) => handleCategoryNameChange(index, e.target.value)}
                            placeholder="Category Name"
                        />
                    </div>
                    <div>
                        <Select
                            isMulti
                            options={options}
                            value={category.value.map(value => ({ value, label: value.value || value.label || value }))}
                            onChange={(selected) => handleCategorySelectionsChange(index, selected)}
                            className="form-control"
                        />
                    </div>
                    <button
                        onClick={() => handleRemoveCategory(index)}
                        className="btn btn-danger"
                    >
                        Remove Category
                    </button>
                </div>
            ))}
            <button onClick={handleAddCategory} className="btn btn-primary">
                Add Category
            </button>
        </div>
    );
}



function CardDataEditor({ bio, updateBio }) {
    const [cardData, setCardData] = useState(bio.infoCard.cardData ? [...bio.infoCard.cardData] : []);
    const [sources, setSources] = useState([]);
    const [optionsMap, setOptionsMap] = useState({});

    useEffect(() => {
        fetch("/api/sources/bio",{
            method:"GET",
            headers:{'Content-Type': 'application/json'},
        })
        .then(res => res.json())
        .then((data) => {
            setSources(data);
            const newOptionsMap = {};
            Promise.all(data.map(async (source) => {
                return fetch(`/api${source}`, {
                    method:"GET",
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(resp => resp.json())
                .then((options) => {
                    newOptionsMap[source] = options.map(item => ({
                        label: item.name || item.label || item.value || item.id || item,  // Use flexible labels
                        value: {
                            value: item.value || item.label || item.name || item.id  || item,  // Store unique identifiers
                            path: item.path || item.url ||  null,
                            type: item.type || null,
                            id: item.id || null
                        }
                    }));
                }).catch((error) => {
                    console.error(`Error fetching ${source}:`, error);
                    newOptionsMap[source] = [];
                })

            }))
            
            setOptionsMap(newOptionsMap);
        })
        .catch((error) => {                
            console.error("Error loading sources or options:", error);
        })
    }, [bio])

    // ✅ Updates standard fields by label
    const dataUpdater = (label, value) => {
        const dataIndex = cardData.findIndex(data => data.label === label);
        if (dataIndex !== -1) {
            const tempData = [...cardData];
            tempData[dataIndex].value = value;
            setCardData(tempData);
        }
    };

    // ✅ Updates custom fields
    const customUpdater = (id, label, value, edit, source, type, qualifier) => {
        const dataIndex = cardData.findIndex(data => data.id === id);
        const tempData = [...cardData];
        tempData[dataIndex] = { id, label, value, edit, source, type, qualifier, custom: true };
        setCardData(tempData);
    };

    // ✅ Add a new custom field
    const addCustom = () => {
        const newCustom = { id: Date.now(), label: "", value: "", edit: "text", custom: true };
        setCardData([...cardData, newCustom]);
    };

    const handleRemoveCustom = (index) => {
        if(cardData[index].custom){
            const updatedCardData = cardData.filter((_, i) => i !== index);
            setCardData(updatedCardData);
        }
        {
            console.warn("Cant remove a non custom field")
        }



    }

    // ✅ Handles changing the edit type
    const changeCustomEdit = (id, edit) => {
        const customIndex = cardData.findIndex(data => data.id === id);
        if (customIndex === -1) return;

        const custom = { ...cardData[customIndex] };

        if (custom.edit === edit) return;  // Skip if no change
        custom.edit = edit;
        // Handle reset logic when switching types
        switch (edit) {
            case "text":
                custom.value = typeof custom.value === "string" ? custom.value : "";
                custom.source = undefined;
                custom.type = undefined;
                custom.qualifier = undefined;
                break;

            case "super-select":
                custom.value = [{
                    label: "",
                    value: Array.isArray(custom.value) ? custom.value : []
                }];
                custom.source = custom.source ?? "";
                custom.type = custom.type ?? "";
                custom.qualifier = undefined;
                break;

            case "multi-select":
            case "creatable":
                custom.value = Array.isArray(custom.value) ? custom.value : [custom.value].filter(Boolean);
                custom.qualifier = undefined;
                custom.source = custom.source ?? "";
                custom.type = custom.type ?? "";
                break;

            case "select":
                if (custom.qualifier) {
                    custom.value = Array.isArray(custom.value)
                        ? [custom.value.find(val =>
                            Array.isArray(custom.qualifier)
                                ? custom.qualifier.includes(val?.type)
                                : custom.qualifier === val?.type
                        ) ?? custom.value[0]].filter(Boolean)
                        : [];
                } else {
                    custom.value = Array.isArray(custom.value) ? [custom.value[0]].filter(Boolean) : [];
                }
                custom.qualifier = undefined;
                custom.source = custom.source ?? "";
                custom.type = custom.type ?? "";
                break;

            case "special-select":
                if (!custom.qualifier) {
                    custom.value = Array.isArray(custom.value) ? [custom.value[0]] : [];
                    custom.qualifier = "";
                }
                custom.source = custom.source ?? "";
                custom.type = custom.type ?? "";
                break;
            case "text-creatable":
                custom.value = [];
                custom.source = undefined;
                custom.type = undefined;
                custom.qualifier = undefined;

            default:
                console.warn(`Unhandled edit type: ${edit}`);
                break;
        }

        const tempData = [...cardData];
        tempData[customIndex] = custom;
        setCardData(tempData);
    };

    const handleSelectionChange = (index, selected) => {
        let processedValue;
    
        // Multi-value selection
        if (Array.isArray(selected)) {
            processedValue = selected.map(item => 
                typeof item === "object" && item !== null ? item.value : item
            );
        }
        // Single-value selection
        else if (typeof selected === "object" && selected !== null) {
            processedValue = selected.value || selected;
        }
        // Plain value
        else {
            processedValue = selected;
        }
    
        handleFieldChange(index, "value", processedValue);
    };

    const handleFieldChange = (index, field, value) => {
        const currentItem = cardData[index];
        const currentFieldValue = currentItem[field];
        if(value !== currentFieldValue){
            const updatedCardData = [...cardData];
            if (field === "edit") {
                // Use `changeCustomEdit` for complex logic
                if(updatedCardData[index].custom){
                    changeCustomEdit(updatedCardData[index].id, value);
                }
                else{
                    console.warn("You cannot change the edit field of a non custom item");
                }
            } else {
                if(field === "value"){
                    updatedCardData[index][field] = value;
                }
                else if (updatedCardData[index].custom){
                    updatedCardData[index][field] = value;
                    // Reset value if type changes
                    if (["source", "type"].includes(field)) {
                        updatedCardData[index].value = [];  // Clear selections on type change
                    }
                }
                else{
                    console.warn(`You cannot edit the ${field} of a non custom object`);
                }
                setCardData(updatedCardData);
            }
        }
    };

    // ✅ Handle Save and Update
    const handleSave = () => {
        updateBio({
            ...bio,
            infoCard: {
                ...bio.infoCard,
                cardData: cardData
            }
        });
    };

    const getFilteredOptions = (options, type) => {
        if (!type) return options;  // No filter applied if type is not specified
        return options.filter(option => 
            (Array.isArray(option.value.type) && option.value.type.includes(type) || option.value.type === type)
        );
    };

    const addOptionToMap = (newOptions, source) => {
        if (!Array.isArray(newOptions) || newOptions.length === 0) return;
   
        setOptionsMap((prevMap) => {
            const updatedMap = { ...prevMap };
            
            if (!updatedMap[source]) {
                updatedMap[source] = [];
            }
   
            newOptions.forEach((newOption) => {
                if (!updatedMap[source].some(opt => opt.value === newOption.value)) {
                    updatedMap[source].push(newOption);
                }
            });
   
            return updatedMap;
        });
    };
   

    const renderInput = (item, index) =>{
        if(!item){
            return;
        }
        const {edit, value, source, type, qualifier} = item;
        switch(edit){
            case "text":
                return(
                    <div key={index} className="mb-3">
                        <input
                        type="text"
                        className="form-control"
                        value={value}
                        onChange={(e) => handleFieldChange(index, "value", e.target.value)}
                        placeholder="Enter text"
                    />
                    </div>
                )
                break;
            case "select":
            case "multi-select":
            case "special-select":
                const options = optionsMap[source] || [];
                const filteredOptions = getFilteredOptions(options, type)
                const mappedValues = value ? Array.isArray(value) ? value.map(val => ({
                    label: val.label || val.name || val.value || val,  // Fallback for label
                    value: val        // Ensure the full value is preserved
                })) : [{label:value.label || value.name || value.value || value, value: value}]: [];
                const isMultiSelect = edit === "multi-select" || 
                edit === "special-select" && Array.isArray(value) && value.some(val => 
                    Array.isArray(val) 
                    ? val.some(typ => qualifier.includes(typ))
                    : (typeof val === "object" && qualifier.includes(val.value)));
                    return (
                        <div key={index} className="mb-3">
                            <Select
                                isMulti={isMultiSelect}
                                options={filteredOptions}
                                value={mappedValues}
                                onChange={(selected) => handleSelectionChange(index, selected)} // Update value
                                className="form-control"
                            />
                        </div>
                    );
                
                break;
            case "super-select":
                const superOptions = optionsMap[source] || [];
                const filteredSuperOptions = getFilteredOptions(superOptions, type)

                return(<SuperUpdater 
                    value={value} 
                    options={filteredSuperOptions} 
                    valueUpdater={(updatedValue) => handleFieldChange(index, "value", updatedValue)} 
                    />)
            case "creatable":
                const creatableOptions = optionsMap[source] || [];
                const creatableValues = value ? value.map(val => ({
                    label: val.label || val.name || val.value || val,  // Fallback for label
                    value: val        // Ensure the full value is preserved
                })) : [];

                const handleCreatableChange = (newValue) => {
                    // Extract new options that aren't in the optionsMap
                    const newOptions = newValue.filter((val) => 
                        !(optionsMap[source] || []).some((opt) => opt.value === val.value)
                    );
    
                    if (newOptions.length > 0) {
                        // Add new options directly to the optionsMap
                        addOptionToMap(newOptions, source);
                    }
    
                    handleSelectionChange(index, newValue);
                };
                return (
                    <div key={index} className="mb-3">
                        <Creatable
                            isMulti
                            options={creatableOptions}
                            value={creatableValues}
                            onChange={handleCreatableChange} // Update value
                            className="form-control"
                        />
                    </div>
                );
            case "text-creatable":
                const textCreatableValues = value ? value.map(val => ({
                        label: val.label || val.name || val.value || val,  // Fallback for label
                        value: val        // Ensure the full value is preserved
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

                            handleFieldChange(index, "value", updatedValues);
                            setInputValue(''); // Clear input field
                            event.preventDefault();
                            break;
                        default:
                            break;
                        }
                };
    
                return (
                    <div key={index} className="mb-3">
                        <Creatable
                            isMulti
                            options={selectedValues} // Use selectedValues as options, so it contains both initial and dynamically added options
                            value={selectedValues}
                            onChange={(newValue) => {
                                setSelectedValues(newValue) 
                                const updatedValues = newValue.map(opt => opt.value);
                                handleFieldChange(index, "value", updatedValues)
                            }} // Update selected values
                            onInputChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            inputValue={inputValue}
                            placeholder="Type and press Enter to add new item..."
                            className="form-control"
                        />
                    </div>
                );

            default:
                return null;



        }
    }

    return (
        <div>
            <h3>Card Data Editor</h3>
            <div>
                {cardData.map((item, index) => (
                    <div key={index} className="card border p-2 mb-2">
                        {item.custom ? (
                            <>
                                <div className="mb-2">
                                    <label>Label:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item.label}
                                        onChange={(e) => handleFieldChange(index, "label", e.target.value)}
                                        placeholder="Label"
                                    />
                                </div>
                    
                                {/* Edit Type Selector */}
                                <div className="mb-2">
                                    <label>Edit Type:</label>
                                    <select
                                        className="form-control"
                                        value={item.edit}
                                        onChange={(e) => handleFieldChange(index, "edit", e.target.value)}
                                    >
                                        <option value="text">Text</option>
                                        <option value="select">Select</option>
                                        <option value="multi-select">Multi-Select</option>
                                        <option value="creatable">Creatable</option>
                                        <option value="special-select">Special-Select</option>
                                        <option value="super-select">Super-Select</option>
                                        <option value="text-creatable">Text-Creatable (for when you need a list of plaintext)</option>

                                    </select>
                                </div>
                    
                                {/* Source Selector (Only if source exists) */}
                                {item.source !== undefined && (
                                    <div className="mb-2">
                                        <label>Source:</label>
                                        <select
                                            className="form-control"
                                            value={item.source || ""}
                                            onChange={(e) => handleFieldChange(index, "source", e.target.value)}
                                        >
                                            <option value="">None</option>
                                            {sources.map((src) => (
                                                <option key={src} value={src}>
                                                    {src}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Type Requirement Selector (Only if type exists) */}
                                {item.type !== undefined && (
                                    <div className="mb-2">
                                        <label>Type Requirement:</label>
                                        <select
                                            className="form-control"
                                            value={item.type || ""}
                                            onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                                        >
                                            <option value="">None</option>

                                            {item.source && item.source !== "" && typeof item.source === "string" && !item.source.includes("types") && 
                                                optionsMap[`${item.source}/types`]?.map((opt, index) => (
                                                    <option key={ opt.label} value={opt.label}>
                                                        {opt.label}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}

                                {/* Qualifier Selector (Only for Special-Select if qualifier exists) */}
                                {item.qualifier !== undefined && (
                                    <div className="mb-2">
                                        <label>Qualifier:</label>
                                        <select
                                            className="form-control"
                                            value={item.qualifier || ""}
                                            onChange={(e) => handleFieldChange(index, "qualifier", e.target.value)}
                                        >
                                            <option value="">None</option>
                                            {item.source && item.source !== "" && typeof item.source === "string" && !item.source.includes("types") && 
                                                optionsMap[`${item.source}/types`]?.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}
                    
                                {/* Remove Custom Button */}
                                <div className="mt-2">
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleRemoveCustom(index)}
                                    >
                                        Remove Custom
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="mb-2">
                                <label>Label:</label>
                                <p className="form-control-plaintext">{item.label}</p>
                            </div>
                        )}
                        {renderInput(item, index)}
                    </div>
                ))}
            </div>

            <div className="mt-3">
                <Button onClick={addCustom} className="btn btn-primary">Add Custom Field</Button>
                <Button onClick={handleSave} className="btn btn-success ml-2">Save Changes</Button>
            </div>
        </div>
    );
}

const MemoizedCardDataEditor = React.memo(CardDataEditor);
const MemoizedSectionsEditor = React.memo(SectionsEditor);


export function BioPage(props){
    const { id } = useParams(); 
    
    const [bio, setBio] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthor, setIsAuthor] = useState(false); // Track if the logged-in user is the author

    const [editing, setEditing] = useState(false);

    const updateBio = (updatedBio) => {
        setBio(updatedBio);
    };

    function toggleEditing(){
        console.log("toggling editing")
        setEditing(prevEditing => !prevEditing);
        console.log(editing)

    }
    function reloadPage(){
        window.location.reload;
    }
    function handleSave(){
        let path = window.location.pathname;
        if(!path.startsWith("/")){
            path = "/" + path;
        }

        fetch(`/api${path}`,{
            method:"PUT",
            headers:{'Content-Type': 'application/json'},
            body:JSON.stringify(bio)
        })
        .then(res => res.json())
        .then(data => {
            console.log("Save successful:", JSON.stringify(data, null, 2)); // Pretty print response data
        })
        .catch(error => {
            console.error("Error during save operation:", error); // Log full error
        })
        .finally(reloadPage());
    }

    
    
    useEffect(() => {
        //Get full path
        let path = window.location.pathname;
        if(!path.startsWith("/")){
            path = "/" + path;
        }
            
        fetch(`/api${path}`, {
            method:"GET",             
            headers: {'Content-Type': 'application/json'},
        }).then(rsp => rsp.json())
        .then((data) => {
            console.log(JSON.stringify(data));
            setBio(data);
            setError(null);
        })
        .catch((err) => {
            console.warn("Fetch failed, checking local storage:", err.message);
            const localData = localStorage.getItem(`${path}`);
            if (localData){
                setBio(JSON.parse(localData));
                setError(null)
            }
            else{
                setError(err.message)
            }
        }
            
        )
        
        
        fetch(`/api/user/me`, {
            method:"GET",             
            headers: {'Content-Type': 'application/json'},
        })
        .then(res => res.json())
        .then((userData) => {
            console.log(JSON.stringify(userData));
            fetch(`/api${path}?author=${props.user.username}`)
            .then(resp => resp.json())
            .then(bool => setIsAuthor(bool.isAuthor))
            .catch(setIsAuthor(false))
        })
        .catch(setIsAuthor(false))
        .finally(() => {
            setLoading(false);
        });
    }, [id]);

    const [cleanBio, setCleanBio] = useState(bio);

    const previBio = useRef(bio);

    const [profanity, setProfanity] = useState(true);

    useEffect(() => {
        async function fetchProfanitySetting() {
            try {
                const res = await fetch('/api/user/prof', { method: 'GET',  });
                const data = await res.json(); 
                console.log(JSON.stringify(data))
                setProfanity(data.profanityFilter);
            } catch {
                setProfanity(true);
            }
        }

        fetchProfanitySetting();
    }, []);
    const prevProfanity = useRef(profanity);


    useEffect(() => {
        if (previBio.current === bio && prevProfanity.current === profanity) {
            return; // No changes, avoid unnecessary updates
        }
        previBio.current = bio;
        prevProfanity.current = profanity;

        async function cleanData() {
            const cleaned = await filterProfanity(bio, profanity);
            setCleanBio(cleaned);
        }

        cleanData();
    }, [bio, profanity]);
    
    const updateDescription = (e) => {
        setBio(prevBio => ({
            ...prevBio, description: e.target.value
        }));
    }

    

    
    if (loading) return <main><p>Loading...</p></main>;
    if (error) return <main><p style={{color:"red"}}>{error}</p></main>
    if (!cleanBio || !cleanBio.infoCard) {
        return <p>Error: Missing or invalid data.</p>;
    }
    if(editing){
        return(<main className="bio">
            <ButtonGroup>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="secondary" onClick={toggleEditing}>
                    Preview
                </Button>
                <Button variant="danger" onClick={reloadPage}>
                    Cancel
                </Button>
            </ButtonGroup>
            <h1>{bio.infoCard.name}</h1>
            <MemoizedCardDataEditor bio={bio} updateBio={updateBio} />
            <textarea value={bio.description} onChange={updateDescription}/>
            <MemoizedSectionsEditor bio={bio} updateBio={updateBio} />
            <ButtonGroup>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="secondary" onClick={toggleEditing}>
                    Preview
                </Button>
                <Button variant="danger" onClick={reloadPage}>
                    Cancel
                </Button>
            </ButtonGroup>
        </main>)
    }
    return(
        <main className="bio">
            
            <MemoizedInfoCard {...cleanBio.infoCard} />
            {isAuthor && (
                <Button variant ="primary" onClick={toggleEditing}>
                    Edit
                </Button>
            )}
            <div>
                <h2>Description</h2>
                <p>{cleanBio.description}</p>
            </div>
            <Accordion width="50%" className="internal-nav">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Nav</Accordion.Header>

                    <Accordion.Body>

                        <nav>

                            <menu className="internal-menu">
                                {cleanBio.sections && <MemoizedNavGen data={cleanBio.sections}/>}
                                
                            </menu>
                        </nav>
                    </Accordion.Body>
                </Accordion.Item>
                        
            </Accordion>
            {cleanBio.sections && <MemoizedSectionsParse data={cleanBio.sections}/>}
        </main>
    )
}
