import React, {Fragment, useEffect, useState } from "react";

import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import './chapter.css';


export function Chapter() {
    const [chapter, setChapter] = useState(null);
    useEffect(() => {

        //Get full path
        let path = window.location.pathname;
        if(!path.startsWith("/")){
            path = "/" + path;
        }
        const jsonPath = `/data${path}.json`
        console.log("Fetching from:", jsonPath);
        fetchJSONByPath(jsonPath).then((data) => {
            setChapter(data);
            setError(null);
        }).catch((err) => {
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
        .finally(() => setLoading(false));
    })
    return (
    <main className="chapter">
        <h1 id="title" className="theme-h adaptive">{chapter.Name}</h1>
        <table>
                    <tbody>
        
                        {Array.isArray(story.info) && story.info.map((entry, index) => (
                            <tr key={index}>
                                <th>{entry.label}</th>
                                <td>
                                    <Fragment>
                                        {entry.value.map((item,subIndex) =>(
                                            <Fragment key={subIndex}>
                                                
                                                <span>{item}</span>
                                                
                                                {subIndex < entry.value.length - 1 && <span>, </span>}
                                            </Fragment>
                                        ))}
                                    </Fragment>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
        <div className="buttons border-bottom" width="80%">
            <NavLink className="btn btn-primary" >Previous</NavLink>
            <NavLink className="btn btn-primary">Back to Story Page</NavLink>
            <NavLink className="btn btn-primary" >Next</NavLink>
        </div>
        


        <div className="textbody">
            <p>
                {chapter.content}
            </p>
        </div>
        <div className="buttons border-top" width="80%">
            <NavLink className="btn btn-primary" >Previous</NavLink>
            <NavLink className="btn btn-primary">Back to Story Page</NavLink>
            <NavLink className="btn btn-primary" >Next</NavLink>
        </div>

    </main>
    );
}