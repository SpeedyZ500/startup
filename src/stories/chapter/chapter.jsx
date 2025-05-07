import React, {Fragment, useEffect, useState } from "react";

import { useWebSocketFacade } from'../../utility/utility.jsx';
import {sanitizeId, formatJSONDate, filterProfanity} from'../../utility/utility.js';
import Table from 'react-bootstrap/Table';

import { useParams, useNavigate, NavLink} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import {ChapterForm} from './../storypage.jsx'
import NavDropdown from 'react-bootstrap/NavDropdown';

import './chapter.css';

function ProcessDropdown({cards}){
    return cards.map((chapter, index) => {
        if(!chapter || typeof chapter !== "object" || !chapter.url) return null
        return(
            <NavDropdown.Item 
                as={NavLink} 
                to={chapter.url}
                key={chapter.id || index}
            >
                {chapter.title} - {chapter.author}
            </NavDropdown.Item>
        )
    })
}

function ChapterDropdown({previous, next, storyId, direction="down"}){
    return(
        <div className={`buttons ${direction === "down" ? "border-bottom" : "border-top"}`} width="90%">
            {previous && Array.isArray(previous) && 
            <NavDropdown title="Previous" className="btn btn-primary" drop={direction} id={`previous-dropdown-nav-${direction}`}>
                <ProcessDropdown cards={previous}/>
            </NavDropdown>}
            <Button as={NavLink} to={`/stories/${storyId}`}  className="btn btn-primary">Back to Story Page</Button>
            {next && Array.isArray(next) && 
            <NavDropdown title="Next" className="btn btn-primary" drop={direction} id={`next-dropdown-nav-${direction}`}>
                <ProcessDropdown cards={next}/>
            </NavDropdown>}
            
        </div>
    )

}

export function Chapter(props) {
    const socket = useWebSocketFacade()
    const { storyId, chapterId } = useParams(); 
    const [chapter, setChapter] = useState({});
    const [cleanChapter, setCleanChapter] = useState({});
    const path = window.location.pathname;
    const [isAuthor, setIsAuthor] = useState(false); // Track if the logged-in user is the author
    const profanity = props.profanityFilter
    const [editing, setEditing] = useState(false);
    const [previous, setPrevious] = useState([])
    const [next, setNext] = useState([])
    const [cleanPrevious, setCleanPrevious] = useState([])
    const [cleanNext, setCleanNext] = useState([])
    function toggleEditing(){
        setEditing(prevEditing => !prevEditing);
    }

    useEffect(() => {
            fetch(`/api/stories/author/chapter/${chapterId}`)
            .then(res => {
                if(!res.ok){
                    throw new Error("Unknown error"); 
                }
                return res.json();
            })
            .then((data) => {
                console.log('I got here')
                setIsAuthor(data.isAuthor)
            })
            .catch(e => {
                setIsAuthor(false)
            })
        }, [chapterId, props.user])
    useEffect(() => {
        let paths = path;
        if(!paths.startsWith("/")){
            paths = "/" + paths;
        }
        socket.subscribe({url:paths, type:"getDisplayable", collection:"chapter", commandId:"getChapter", id:chapterId,setData:setChapter})
    }, [path, storyId, chapterId])
    useEffect(() => {
        console.log(JSON.stringify(chapter))
        async function runFilter() {
            const cleanOptions = await filterProfanity(chapter, profanity);
            setCleanChapter(cleanOptions);
        }
        runFilter();
    }, [chapter, profanity])
    useEffect(() => {
        console.log(JSON.stringify(previous))
        async function runFilter() {
            const cleanOptions = await filterProfanity(previous, profanity);
            setCleanPrevious(cleanOptions);
        }
        runFilter();
    }, [previous, profanity])
    useEffect(() => {
        console.log(JSON.stringify(next))
        async function runFilter() {
            const cleanOptions = await filterProfanity(next, profanity);
            setCleanNext(cleanOptions);
        }
        runFilter();
    }, [next, profanity])
    useEffect(() => {
        let paths = path;
        if(!paths.startsWith("/")){
            paths = "/" + paths;
        }
        if(chapter.previous){
            socket.subscribe({url:paths, type:"getCards", collection:"chapter", commandId:"getPrevious", query:{filter:{id:chapter.previous}}, setData:setPrevious})
        }
        else{
            socket.unsubscribe(paths, "getPrevious")
        }
        if(chapter.next){
            socket.subscribe({url:paths, type:"getCards", collection:"chapter", commandId:"getNext", query:{filter:{id:chapter.next}}, setData:setNext})
        }
        else{
            socket.unsubscribe(paths, "getNext")
        }

    }, [chapter, path])
    if(editing){
        return(<main>
                    <ChapterForm  
                        handleClose={toggleEditing}
                        storyId={storyId}
                        chapterId={chapterId}
                        profanity={profanity}
                    />
                </main>)
    }
    return (
    <main className="chapter">
        <Table className="infocard adaptive">
            <thead>
                <tr>
                    <th colSpan={2}>{cleanChapter.title}</th>
                </tr>
                <tr>
                    <th>Author</th>
                    <td>{cleanChapter.author}</td>
                </tr>
            </thead>
            <tbody>
                {cleanChapter.genres &&
                <tr>
                    <th>
                        Genres
                    </th>
                    <td>{cleanChapter.genres.map((value, index) =>{
                            return <span key={index}>{value} {index < cleanChapter.genres.length - 1 && <span>, </span>}</span>
                        })}
                    </td>
                </tr>}
                {cleanChapter.contentWarnings &&
                <tr>
                    <th>Content Warnings</th>
                    <td>{cleanChapter.contentWarnings.map((value, index) =>{
                            return <span key={index}>{value} {index < cleanChapter.contentWarnings.length - 1 && <span>, </span>}</span>
                        })}
                    </td>
                </tr>}
            </tbody>
            <tfoot>
            <tr>
                    <th colSpan={2}>
                        description
                    </th>
                </tr>
                <tr>
                    <td colSpan={2}>
                        {cleanChapter.description}
                    </td>
                </tr>
            </tfoot>
        </Table>
        {isAuthor && (
            <Button variant ="primary" onClick={toggleEditing}>
                Edit
            </Button>
        )}
        <ChapterDropdown previous={cleanPrevious} next={cleanNext} storyId={storyId}/>
        
        {cleanChapter && cleanChapter.body && <div className="textbody">
            <p>
                {cleanChapter.body}
            </p>
        </div>}
        <ChapterDropdown previous={cleanPrevious} next={cleanNext} storyId={storyId} direction="up"/>


    </main>
    );
}