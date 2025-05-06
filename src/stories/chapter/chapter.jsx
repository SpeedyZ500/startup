import React, {Fragment, useEffect, useState } from "react";

import { useWebSocketFacade } from'../../utility/utility.jsx';
import {sanitizeId, formatJSONDate, filterProfanity} from'../../utility/utility.js';

import { useParams, useNavigate, NavLink} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import './chapter.css';


export function Chapter(props) {
    const socket = useWebSocketFacade()
    const { storyId, chapterId } = useParams(); 
    const [chapter, setChapter] = useState({});
    const [cleanChapter, setCleanChapter] = useState({});
    const path = window.location.pathname;
    const [isAuthor, setIsAuthor] = useState(false); // Track if the logged-in user is the author
    const profanity = props.profanityFilter

    useEffect(() => {
            fetch(`/api/stories/author/chapter/${chapterId}`)
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
    return (
    <main className="chapter">
        {cleanChapter && cleanChapter.title && <h1 id="title" className="theme-h adaptive">{cleanChapter.title}</h1>}
        
        <div className="buttons border-bottom" width="80%">
            <NavLink className="btn btn-primary" >Previous</NavLink>
            <NavLink to={`/stories/${storyId}`} className="btn btn-primary">Back to Story Page</NavLink>
            <NavLink className="btn btn-primary" >Next</NavLink>
        </div>
        


        {cleanChapter && cleanChapter.body && <div className="textbody">
            <p>
                {cleanChapter.body}
            </p>
        </div>}
        <div className="buttons border-top" width="80%">
            <NavLink className="btn btn-primary" >Previous</NavLink>
            <NavLink className="btn btn-primary">Back to Story Page</NavLink>
            <NavLink className="btn btn-primary" >Next</NavLink>
        </div>

    </main>
    );
}