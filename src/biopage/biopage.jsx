import React, {Fragment, useEffect, useState, useRef} from "react";

import {NavLink, useLocation} from 'react-router-dom';


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



function processValue({value, formatting, valueKey}){
    if(Array.isArray(value)){
        return (
            <span key={valueKey}>
                {value.map((v, i) => (
                    <span key={i}>
                        {processValue({value:v, formatting, valueKey:`${i}value`})}
                        {
                            i < value.length - 1 && 
                            (formatting === "vertical" ? <br /> : <span>, </span>)                        }
                    </span>
                ))}
            </span>
        )
    }
    else if (typeof value === "object"){
        if(value.url){
            return (<NavLink to={value.url} key={valueKey}>
                {
                    formatting==="time" 
                    ? formatJSONDate(value.time || value.value || JSON.stringify(value) || new Date().toJSON())
                    : value.name || value.title || value.value || value.label ||JSON.stringify(value) || " "
                }
            </NavLink>)
        }
        else{
            return (<span key={valueKey}>
                {
                    formatting==="time" 
                    ? formatJSONDate(value.time || value.value || JSON.stringify(value) || new Date().toJSON())
                    : value.name || value.title || value.value || value.label ||JSON.stringify(value) || " "
                }
            </span>)
        }
    }
    else{
        return <span key={valueKey}>{formatting==="time" ? formatJSONDate(value ||new Date().toJSON()) : value || " "}</span>
    }
}

function generateRow({label, value, formatting, rowKey}){

    if(!value || (Array.isArray(value) && !value.length)){
        return
    }
    if(!label){
        return (
            <tr key={rowKey}>
                <th  colSpan={2}>
                    {processValue({value, formatting, valueKey:`${rowKey}-value`})}
                </th>
            </tr>
        )
    }
    else{
        return (
            <tr key={rowKey}>
                <th>{label}</th>
                <td>
                    {processValue({value, formatting, valueKey:`${rowKey}-value`})}
                </td>
            </tr>
        )
    }

}
function processCondition(condition, data){
    const conditions = [
        "includes",
        "if",
        'lengthGreaterThan'
    ]
    if (!condition ) return true;
    if(typeof condition !== "object" ) return data[condition]
    if (Array.isArray(condition)) {
        return false;
    }
    if ('and' in condition) {
        return condition.and.every(sub => processCondition(sub, data));
    }
    if ('or' in condition) {
        return condition.or.some(sub => processCondition(sub, data));
    }
    if ('not' in condition) {
        return !processCondition(condition.not, data);
    }
    for (const [field, test] of Object.entries(condition)) {
        if(conditions.includes(field)){
            return false
        }
        const value = data[field];
    
        if (typeof test === 'object') {
          // Example: { includes: "Religion" }
            if ('includes' in test ) {
                if(Array.isArray(value)){
                    if(!value.includes(test.includes)) return false
                }
                else{
                    if(![value].includes(test.includes)) return false;
                }
            }
            if ('lengthGreaterThan' in test && Array.isArray(value)) {
                if (value.length <= test.lengthGreaterThan) return false;
            }
          // Could add more operators here like `equals`, `gt`, `lt`, etc.
        } else {
          // Simple equality check
          if (value !== test) return false;
        }
    }
    return true
}

function generateCardTable(data){
    if(!data || !Array.isArray(data)) return
    return data.map((value, rowKey) => {
        if(typeof value !== "object"){
            return generateRow({value, rowKey})
        }
        return generateRow({label:value.label, label:value.value, rowKey})
    })
}

function generateCustomRows(custom, rowKey){
    console.log(rowKey);
    if(!custom || !Array.isArray(custom)) return null;
    return custom.map((value, index) => {
        if(typeof value !== "object"){
            return generateRow({ value, rowKey:`${rowKey}${index}`});
        }
        if(value.format === "table"){
            return(
                <tr key={`${rowKey}${index}`}>
                    <td colSpan={2} style={{padding:0, margin:0}}>
                        <Table width="100%">
                                {value.label && <thead>
                                    <tr>
                                        <th colSpan={2}>
                                            {value.label}
                                        </th>
                                    </tr>
                                </thead>}
                                <tbody>
                                    {generateCardTable(value.value)}
                                </tbody>
                        </Table>
                    </td>
                </tr>
            )
        }
        return generateRow({label:value.label, value:value.value, rowKey:`${rowKey}${index}`} )
    })
}

function renderCardSegment(data, formatting){
    if(!formatting){
        return
    }
    return Object.entries(formatting).flatMap(([key, config], i) => {
        let row = data[key]
        if(!row || (Array.isArray(row) && !row.length)) {
            return
        }
        if (typeof config !== "object") {
            console.log("I got here")
            console.log(JSON.stringify(row))
            return generateRow({ label: config, value: row, rowKey:`${key}${i}`});
        }
        if(config.format && config.format === "table"){
            console.log("I got here Table")

            return(
                <tr key={`${key}${i}`}>
                    
                    <td colSpan={2} style={{padding:0, margin:0}}>
                        <Table width="100%">
                                {config.label && <thead>
                                    <tr>
                                        <th colSpan={2}>
                                            {config.label}
                                        </th>
                                    </tr>
                                </thead>}
                                <tbody>
                                    {generateCardTable(row)}
                                </tbody>
                        </Table>
                    </td>
                </tr>
            )
        }
        if(config.format === "custom"){
            console.log("I got to custom")
            return generateCustomRows(row, `${key}${i}`)
        }
        if(config.append){
            row = Array.isArray(row) ? row : [row]
            const append = config.append
            if(typeof append !== "object"){
                row.push(data[key] || append)
            }
            else{
                Object.entries(append).forEach(([k, condition]) =>{
                    if(processCondition(condition, data)){
                        row.push(data[k])
                    }
                })
            }
        }
        
        return generateRow({ label: config.label, formatting:config.format, value: row, rowKey:`${key}${i}`});
    })
}

function InfoCard({cardFormatter, data}) {
    return(
        <Table className="infocard adaptive">
            {cardFormatter.head && 
                <thead key="head">
                    {renderCardSegment(data, cardFormatter.head)}
                </thead>
            }
            {cardFormatter.body && 
                <tbody key="body">
                    {renderCardSegment(data, cardFormatter.body)}

                </tbody>
            }
            {cardFormatter.foot && 
                <tfoot key="foot">
                    {renderCardSegment(data, cardFormatter.foot)}
                </tfoot>
            }
        </Table>
    );

};

function NavGen({data, cleanData, sectionPref=""}){
    if (!data || !data.length) return null;
    return data.map((entry, index) =>{
        return(
            <Fragment key={index}>
                <li>
                    <NavLink to={`#${sectionPref}${index}-${sanitizeId(entry.section)}`}>
                        {`${sectionPref}${index}-${cleanData[index].section}`}
                    </NavLink>
                </li>
                {entry.subsections && Array.isArray(entry.subsections) && entry.subsections.length > 0&&(
                    <ul>
                        <NavGen data= {entry.subsections} cleanData={cleanData[index].subsections} sectionPref={`${sectionPref}${index}.`} />
                    </ul>
                )}
            </Fragment>
            
        )
    }) 
}

function SectionsParse({data, level=2, sectionPref="", cleanData}){
    if (!data || !data.length  ) return null;
    return data.map((entry, index)=>{
        return(
            <Fragment key={index}>
                <Heading level={level} id={`${sectionPref}${index}-${sanitizeId(entry.section)}`}>{cleanData[index].section}</Heading>
                {cleanData[index].text && <p>{cleanData[index].text}</p>}
                {Array.isArray(entry.subsections) && entry.subsections.length > 0 && (
                    <SectionsParse data={entry.subsections} cleanData={cleanData[index].subsections} level={level + 1} sectionPref={`${sectionPref}${index}.`}/>
                )}
            </Fragment>
        )
    })
}

function generateCardGroupIDs({index, label, value, groupKey}){
    return `cards-${index}-${groupKey}-${sanitizeId(label)}-${sanitizeId(value)}`;
}
function generateCardGroupLabels({index, label, join, value}){
    if(join){
        return `${index}-${label} ${join} ${value}`
    }
    return `${index}-${label} ${value}`

}

function generateCardGroup({label, join, list, cleanList, groupKey}){
    if(!Array.isArray(list) || !list.length) return
    const result = list.map((value, index) => {
        const id =  generateCardGroupIDs({index, label, join, value, groupKey})
        const nav =  generateCardGroupIDs({index, label, join, value, groupKey})
                return(<li key={`cards-${index},-${groupKey}`}>
                    <NavLink  to={`#${id}`}>
                        {nav}
                    </NavLink>
                </li>)
    })
    const finalId = generateCardGroupIDs({index:list.length, label:"all", value:label, groupKey})
    const finalNav = generateCardGroupLabels({index:list.length, label:"all", value:label})
    result.push(<li key={`cards-final-${groupKey}`}>
                    <NavLink  to={`#${finalId}`}>
                        {finalNav}
                    </NavLink>
                </li>)
    return result
}

function CardSectionNavGen({cardSections, data, cleanData}){
    if (!cardSections || typeof cardSections !== "object" || !Object.keys(cardSections).length) return null;
    return Object.entries(cardSections).flatMap(([key, parameters], index) => {
        const result = []
        if(parameters.condition && !processCondition(parameters.condition, data)){
            return
        }
        result.push(
            <li key={index}>
                <NavLink to={`#cards-${key}`}>
                        {parameters.label}
                </NavLink>
            </li>
        )
        if(parameters.group && !Array.isArray(parameters.group) && data && cleanData){
            const group =parameters.group
            if(typeof group !== "object"){
                result.push(<ul key={`${index}-group`}>{generateCardGroup({
                    label:parameters.label,
                    list:data[group],
                    cleanList:cleanData[group],
                    groupKey:key
                })}</ul>)
            }
            else{
                const keys = group.by
                const list = data[keys]
                const cleanList = cleanData[keys]
                result.push(
                    <ul key={`${index}-${key}-group`}>
                        {generateCardGroup({
                            label:parameters.label,
                            list,
                            cleanList,
                            join:group.labelJoin,
                            groupKey:key
                        })}
                    </ul>
                )
            }
        }
        return result
    })


}

function parseCardSections({}){

}

const MemoizedNavGen = React.memo(NavGen);
const MemoizedSectionsParse = React.memo(SectionsParse);
const MemoizedInfoCard = React.memo(InfoCard);


   

export function BioPage(props){
    const location = useLocation();
    const isWorldbuilding = location.pathname.startsWith("/worldbuilding");

    const {url, id} = extractIDfromURL()    
    const path = window.location.pathname;
    const profanity = props.profanityFilter
    const [formatter, setFormatter] = useState({});
    const [bio, setBio] = useState({});
    const [cleanBio, setCleanBio] = useState(bio);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthor, setIsAuthor] = useState(false); // Track if the logged-in user is the author
    const [editing, setEditing] = useState(false);
    const webSocket = useWebSocketFacade()

    function toggleEditing(){
        console.log("toggling editing")
        setEditing(prevEditing => !prevEditing);
        console.log(editing)

    }
    
    useEffect(() => {
        fetch(`/api${url}/author/${id}`)
        .then(res => {
            if(!res.ok){
                throw new Error("Unknown error"); 
            }
            return res.json();
        })
        .then((data) => {
            setIsAuthor(data.isAuthor)
        })
        .catch(e => {
            setIsAuthor(false)
        })
    }, [url, id, props.user])

    
    useEffect(() => {
        console.log(JSON.stringify(url))
        fetch(`/data/bio${url}.json`)
        .then((res) => res.json())
        .then((data) => {
            setFormatter(data)
            setError(null);
        })
        .catch(e => {
            setError(`Get Bio Formatting error: ${e.message}`);
        })
        .finally(() => setLoading(false))

    }, [url, id])

    useEffect(() => {
        const collection = url.startsWith("/worldbuilding/")
        ? url.replace("/worldbuilding/", "")
        : url.replace(/^\//, "");  
        console.log(JSON.stringify(collection))
        webSocket.subscribe({url:path, type:"getDisplayable", collection, commandId:"getDisplayable", id,setData:setBio})
    }, [path, id, url])

    useEffect(() => {
        console.log(JSON.stringify(bio))
       async function runFilter() {
            const tempBio = await filterProfanity(bio, profanity);
            setCleanBio(tempBio);
        }
        runFilter();
    }, [bio, profanity]);
    

    
    if (loading) return <main className={`${isWorldbuilding ? "with-subnav" : ""}`}><p>Loading...</p></main>;
    if (error) return <main className={`${isWorldbuilding ? "with-subnav" : ""}`} ><p style={{color:"red"}}>{error}</p></main>
    if (!cleanBio) {
        return <p>Error: Missing or invalid data.</p>;
    }
    if(editing){
        return(<main className={`${isWorldbuilding ? "with-subnav" : ""}`}><FormGenerator handleClose={toggleEditing}/></main>)
    }
    return(
        <main className="bio">
            {formatter.card && <InfoCard cardFormatter={formatter.card} data={cleanBio} />}
            {isAuthor && (
                <Button variant ="primary" onClick={toggleEditing}>
                    Edit
                </Button>
            )}
            {formatter.description && cleanBio.description && (
                <div id="description">
                    <h2>{formatter.description}</h2>
                    <p>{cleanBio.description}</p>
                </div>
            )}
            {(formatter.sections || formatter.cardSections) &&
                (
                    <Accordion width="50%" className="internal-nav">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Nav</Accordion.Header>

                            <Accordion.Body>

                                <nav>

                                    <menu className="internal-menu">
                                        {formatter.sections && cleanBio.sections && <MemoizedNavGen data={bio.sections} cleanData={cleanBio.sections}/>}
                                        {formatter.cardSections && <CardSectionNavGen cardSections={formatter.cardSections} data={bio} cleanData={cleanBio}/>}
                                    </menu>
                                </nav>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )
            }
            {formatter.sections && cleanBio.sections && <MemoizedSectionsParse data={bio.sections} cleanData={cleanBio.sections}/>}
        </main>
    )
}

