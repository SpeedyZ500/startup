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
import {extractIDfromURL, FormGenerator} from './../utility/form.jsx'
import {CardsRenderer, useWebSocketFacade} from './../utility/utility.jsx'



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
                                            <NavLink to={item.url}>{item.value}</NavLink>
                                        ) : (
                                            
                                            <span>{item.url}</span>
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



   

export function BioPage(props){
    const [url, id] = extractIDfromURL
    
    const [formatter, setFormatter] = useState(null);
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
    
    useEffect(() => {


    }, [url, id])

    
    
    

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

