import React, {Fragment, useEffect, useState, useRef} from "react";
import { useParams } from "react-router-dom";

import {NavLink } from 'react-router-dom';


import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import "./biopage.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import Accordion from 'react-bootstrap/Accordion';
import {sanitizeId, fetchJSONByPath, formatJSONDate, filterProfanity} from'../utility/utility.js';


const Heading = ({ level, children, ...props }) => {
    const Tag = `h${level}`;
    return <Tag {...props}>{children}</Tag>;
  };

function generateRows(data){
    return data.map((entry, index) => {
        if (!entry) return null;
        if(Array.isArray(entry.value)){
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
                                        {typeof item === "object" && item.value ? (
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
                <td>{typeof entry.value === "object" && entry.value.value ? (
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
                {entry.subSections &&(
                    <ul>
                        <NavGen data= {entry.subSections} sectionPref={`${sectionPref}${index}.`} />
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
                {entry.subSections && 
                    <SectionsParse data={entry.subSections} level={level + 1} sectionPref={`${sectionPref}${index}.`}/>
                }
            </Fragment>
        )
    })
}

const MemoizedNavGen = React.memo(NavGen);
const MemoizedSectionsParse = React.memo(SectionsParse);
const MemoizedInfoCard = React.memo(InfoCard);



export function BioPage(){
    const { id } = useParams(); 
    
    const [bio, setBio] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        //Get full path
        let path = window.location.pathname;
        if(!path.startsWith("/")){
            path = "/" + path;
        }
        const jsonPath = `/data${path}.json`
        console.log("Fetching from:", jsonPath);
        fetchJSONByPath(jsonPath).then((data) => {
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
        .finally(() => {
            setLoading(false);
        });

        

    }, [id]);

    const [cleanBio, setCleanBio] = useState(bio);

    const prevBio = useRef(bio);

    const [profanity, setProfanity] = useState(true);

    useEffect(() => {
        async function fetchProfanitySetting() {
            try {
                const res = await fetch('/api/user/prof', { method: 'GET' });
                const data = await res.json(); 
                setProfanity(data.profanityFilter);
            } catch {
                setProfanity(true);
            }
        }

        fetchProfanitySetting();
    }, []);
    const prevProfanity = useRef(profanity);


    useEffect(() => {
        if (prevBio.current === bio && prevProfanity.current === profanity) {
            return; // No changes, avoid unnecessary updates
        }
        prevBio.current = bio;
        prevProfanity.current = profanity;

        async function cleanData() {
            const cleaned = await filterProfanity(bio, profanity);
            setCleanBio(cleaned);
        }

        cleanData();
    }, [bio, profanity]);
    

    
    if (loading) return <main><p>Loading...</p></main>;
    if (error) return <main><p style={{color:"red"}}>{error}</p></main>
    if (!cleanBio || !cleanBio.infoCard || !cleanBio.sections) {
        return <p>Error: Missing or invalid data.</p>;
    }
    return(
        <main className="bio">
            <MemoizedInfoCard {...cleanBio.infoCard} />
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
                                {BioPage.sections && <MemoizedNavGen data={cleanBio.sections}/>}
                                
                            </menu>
                        </nav>
                    </Accordion.Body>
                </Accordion.Item>
                        
            </Accordion>
            {BioPage.sections && <MemoizedSectionsParse data={cleanBio.sections}/>}
        </main>
    )
}
