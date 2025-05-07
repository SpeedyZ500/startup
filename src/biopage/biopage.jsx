import React, {Fragment, useEffect, useState, useRef, useMemo} from "react";

import {NavLink, useLocation} from 'react-router-dom';


import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import "./../app.css"
import "./biopage.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import Accordion from 'react-bootstrap/Accordion';
import {sanitizeId, formatJSONDate, filterProfanity} from'../utility/utility.js';
import { ButtonGroup } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import {extractIDfromURL, FormGenerator, selectSources} from './../utility/form.jsx'
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
        return generateRow({label:value.label, value:value.value, rowKey})
    })
}

function generateCustomRows(custom, rowKey){
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
            return generateRow({ label: config, value: row, rowKey:`${key}${i}`});
        }
        if(config.format && config.format === "table"){

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

function NavGen({data}){
    if (!data || !data.length) return null;
    return data.map((entry, index) =>{
        return(
            <Fragment key={index}>
                <li>
                    <NavLink to={`#${entry.id}`}>
                        {`${entry.prefix}-${entry.section}`}
                    </NavLink>
                </li>
                {entry.subsections && Array.isArray(entry.subsections) && entry.subsections.length > 0&&(
                    <ul className="internal-menu">
                        <NavGen data= {entry.subsections} />
                    </ul>
                )}
            </Fragment>
            
        )
    }) 
}

function SectionsParse({data, level=2}){
    if (!data || !data.length  ) return null;
    return data.map((entry, index)=>{
        return(
            <div key={index} id={entry.id}>
                <Heading level={level} >{entry.section}</Heading>
                {entry.text && <p>{entry.text}</p>}
                {Array.isArray(entry.subsections) && entry.subsections.length > 0 && (
                    <SectionsParse data={entry.subsections}  level={level + 1} />
                )}
            </div>
        )
    })
}

function generateCardGroupIDs({index, label, value, groupKey}){
    return `cards-${index}-${groupKey}-${sanitizeId(label)}-${sanitizeId(value)}`;
}
function generateCardGroupLabels({index, label, join, value}){
    if(join){
        return index || index === 0 ? `${index}-${label} ${join} ${value}` : `${label} ${join} ${value}`
    }
    return index || index === 0 ? `${index}-${label} ${value}` : `${label} ${value}`

}

function generateCardGroup({label, join, list, cleanList, groupKey}){
    if(!Array.isArray(list) || !list.length || !Array.isArray(cleanList) || !list.length) return
    const result = list.map((value, index) => {
        const id =  generateCardGroupIDs({index, label, join, value, groupKey})
        const nav =  generateCardGroupLabels({index, label, join, value:cleanList[index]})
                return(<li key={`cards-${index}-${groupKey}`}>
                    <NavLink  to={`#${id}`}>
                        {nav}
                    </NavLink>
                </li>)
    })
    const finalId = generateCardGroupIDs({index:list.length, label:"all", value:label, groupKey})
    const finalNav = generateCardGroupLabels({index:list.length, label:"All", value:label})
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
                result.push(<ul key={`${index}-group`} className="internal-menu">{generateCardGroup({
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
                    <ul className="internal-menu" key={`${index}-${key}-group`}>
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

function ProcessAppend({appendData, bio, socket, commandId, nextIndex=1, appendArray, updateData}){
    const [data, setData] = useState([])
    const [append, setAppend] = useState([])
    
    useEffect(() => {
        if (appendData.condition && !processCondition(appendData.condition, bio)) {
            setData([]); // skip processing by sending empty
            return
        }
        const filter = {}
        const {collection, sort} = appendData
        const url =selectSources[collection]

        if(appendData.filter){
            const tempFilter = appendData.filter
            Object.entries(tempFilter).forEach(([key, entry]) => {
                if(typeof entry !== "object"){
                    filter[key] = bio[entry]
                }
                else{
                    filter[key] = entry.literal
                }
            })
        }
        const query = { filter, sort}
        socket.subscribe({
            url,
            type:"getCards",
            collection,
            commandId,
            query,
            setData,
        });    
    }, [appendData, bio])
    useEffect(() => {
        if(Array.isArray(data) && Array.isArray(append)){
            updateData([...data, ...append])
        }
        else if(Array.isArray(data)){
            updateData([...data])
        }
        else if(Array.isArray(append)){
            updateData([...append])
        }
        
    }, [data, append])
    if(appendArray.length < nextIndex || !appendArray.length || (nextIndex === 0 && !appendData.append )) return null
    return <ProcessAppend 
        appendData={appendArray[nextIndex]} 
        nextIndex={nextIndex+1} 
        updateData={setAppend} 
        bio={bio}
        socket={socket}
        appendArray={appendArray}
        commandId={`${commandId}${nextIndex}`}
    />
}

function ParseCardSection({cardKey="", cardSection={}, bio={}, currFilter,  profanity=true, socket }){
    const [cards, setCards] = useState([])
    const [data, setData] = useState([])
    const [append, setAppend] = useState([])
    useEffect(() => {
        const filter = {...currFilter}
        const {collection, sort} = cardSection
        const url =selectSources[collection]

        if(cardSection.filter){
            const tempFilter = cardSection.filter
            Object.entries(tempFilter).forEach(([key, entry]) => {
                if(typeof entry !== "object"){
                    filter[key] = bio[entry]
                }
                else{
                    filter[key] = entry.literal
                }
            })
        }
        const query = { filter, sort}
        socket.subscribe({
            url,
            type:"getCards",
            collection,
            commandId:cardKey,
            query,
            setData,
        });    
    }, [cardSection, bio, currFilter])
    useEffect(() => {
        if(Array.isArray(data) && Array.isArray(append)){
            setCards([...data, ...append])
        }
        else if(Array.isArray(data)){
            setCards([...data])
        }
        else if(Array.isArray(append)){
            setCards([...append])
        }
        
    }, [data, append])

    const stableAppendData = useMemo(() => cardSection, [cardSection]);
    const stableBio = useMemo(() => bio, [bio]);
    const appendArray = stableAppendData.append
    const stabelCommandId = useMemo(() => cardKey, [cardKey]);
    return(<>
        {cardSection.append && cardSection.append.length && <ProcessAppend 
        
        appendData={cardSection.append[0]} 
        bio={stableBio}
        commandId={`${stabelCommandId}0`}
        socket={socket}
        updateData={setAppend}
        appendArray={appendArray }
    />}
        
        <CardsRenderer cards={cards} profanity={profanity} />
    </>)
}

function ParseCardGroup({cardKey, cardSection, data, cleanData, profanity, socket}){
    const { group, label } = cardSection;
    if (!group) return null;
    let groupValues = [];
    let cleanGroupValues = [];
    let join = ""
    if (typeof group === "string") {
        groupValues = data[group];
        cleanGroupValues = cleanData[group];
    } else if (typeof group === "object" && group.by) {
        groupValues = data[group.by];
        cleanGroupValues = cleanData[group.by];
        join = group.labelJoin
    }
    if (!Array.isArray(groupValues) || !Array.isArray(cleanGroupValues)) return null;
    const result = groupValues.map((value, index) => {
        const id =  generateCardGroupIDs({index, label, join, value, groupKey:cardKey})
        const nav =  generateCardGroupLabels({label, join, value:cleanGroupValues[index]})
        const filter = {[group.by]:value}
                return(<div className="card-sections" key={`cards-${index}-${cardKey}`} id={id} >
                    <h3 >{nav}</h3>
                    <MemoizedParseCardSection
                        cardKey={`${cardKey}${value}`}
                        cardSection={cardSection}
                        bio={data}
                        profanity={profanity}
                        socket={socket}
                        currFilter={filter}
                    />

                </div>)
    })
    const finalId = generateCardGroupIDs({index:groupValues.length, label:"all", value:label, groupKey:cardKey})
    const finalNav = generateCardGroupLabels({ label:"All", value:label})
    result.push(<h3 key={`cards-final-${cardKey}`} id={finalId}>{finalNav}</h3>)
    return result
}

function ParseCardSections({cardSections, data, cleanData, profanity, socket}){
    
    if (!cardSections || 
        typeof cardSections !== "object" || 
        !Object.keys(cardSections).length || 
        !data || 
        typeof data !== "object" ||
        !Object.keys(data).length || 
        !cleanData ||
        typeof cleanData !== "object" ||
        !Object.keys(cleanData).length 
    ) return null;
    return  Object.entries(cardSections).map(([key, entry], index) => {
        if(entry && entry.condition && !processCondition(entry.condition, data)){
            return null
        }
        return (
            <div className="card-sections" key={index} id={`cards-${key}`}>
                <h2>{entry.label}</h2>
                {entry.group &&  <div className="card-sections"> <MemoizedParseCardGroup 
                    cardKey={key} 
                    cardSection={entry} 
                    data={data} 
                    cleanData={cleanData}
                    profanity={profanity}
                    socket={socket}
                /> 
                </div>}
                <MemoizedParseCardSection
                    cardKey={key} 
                    cardSection={entry} 
                    bio={data} 
                    cleanData={cleanData}
                    profanity={profanity}
                    socket={socket}
                    currFilter={{}}
                />
            </div>
        )
    })

}

const MemoizedNavGen = React.memo(NavGen);
const MemoizedSectionsParse = React.memo(SectionsParse);
const MemoizedParseCardSections = React.memo(ParseCardSections);
const MemoizedParseCardGroup = React.memo(ParseCardGroup);
const MemoizedParseCardSection= React.memo(ParseCardSection);
const MemoizedProcessAppend= React.memo(ProcessAppend);

function ScrollToHash() {
    const { hash } = useLocation();
  
    useEffect(() => {
        if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        }
    }, [hash]);

    return null;
}
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
    const socket = useWebSocketFacade()

    function toggleEditing(){
        setEditing(prevEditing => !prevEditing);
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
        socket.changePageSameFile()
        const collection = url.startsWith("/worldbuilding/")
        ? url.replace("/worldbuilding/", "")
        : url.replace(/^\//, "");  
        socket.subscribe({url:path, type:"getDisplayable", collection, commandId:"getDisplayable", id,setData:setBio})
    }, [path, id, url])

    useEffect(() => {
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
        <main className={`bio ${isWorldbuilding ? "with-subnav" : ""}`}>
            <ScrollToHash/>
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
                                        {formatter.sections && cleanBio.sections && <MemoizedNavGen data={cleanBio.sections}/>}
                                        {formatter.cardSections && <CardSectionNavGen cardSections={formatter.cardSections} data={bio} cleanData={cleanBio}/>}
                                    </menu>
                                </nav>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )
            }
            {formatter.sections && cleanBio.sections && <MemoizedSectionsParse data={cleanBio.sections}/>}

            {formatter.cardSections && 
            <div className="card-sections">
                <MemoizedParseCardSections cardSections={formatter.cardSections} data={bio} cleanData={cleanBio} profanity={profanity} socket={socket}/>

            </div>
            }
        </main>
    )
}

