import React, {Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {MiniMap, Controls, Background} from "reactflow";

import { NavLink } from 'react-router-dom';
import "../../app.css"

import 'bootstrap/dist/css/bootstrap.min.css';
import {sanitizeId, fetchJSONByPath, fetchListByPath, formatJSONDate} from'../../utility/utility.js';

const generateGraph = (chapters) => {
    const nodes = chapters.map((chapter) => ({
      id: chapter.chapterId.toString(),
      position: { x: chapter.chapterId * 200, y: chapter.chapterNumber * 100 },
      data: { label: `${chapter.chapterNumber}: ${chapter.title}` },
    }));
  
    const edges = [];
    chapters.forEach((chapter) => {
      if (chapter.previous) {
        edges.push({
          id: `e${chapter.previous}-${chapter.chapterId}`,
          source: chapter.previous.toString(),
          target: chapter.chapterId.toString(),
        });
      }
      chapter.branches.forEach((branchId) => {
        edges.push({
          id: `e${chapter.chapterId}-${branchId}`,
          source: chapter.chapterId.toString(),
          target: branchId.toString(),
        });
      });
    });
  
    return { nodes, edges };
  };

  
  

export function StoryPage() {
    const [story, setStory] = useState({});
    const [list, setList] = useState([]);
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { storyId } = useParams(); 

    useEffect(() => {

        //Get full path
        let path = window.location.pathname;
        if(!path.startsWith("/")){
            path = "/" + path;
        }
        const jsonPath = `/data${path}.json`
        console.log("Fetching from:", jsonPath);
        fetchJSONByPath(jsonPath).then((data) => {
            setStory(data);
            setError(null);
        })
        .catch((err) => {
            console.warn("Fetch failed, checking local storage:", err.message);
            const localData = localStorage.getItem(`${path}`);
            if (localData){
                setStory(JSON.parse(localData));
                setError(null)
            }
            else{
                setError(err.message)
            }
        }
            
        )
        fetchListByPath(`/data${path}`).then((data => {
            const storedData = JSON.parse(localStorage.getItem(`${path}/list`) ?? '[]');
            data.push(...storedData);
            setList(data);
            setError(null);

        }))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    }, [storyId]);
    const { nodes, edges } = generateGraph(list);

    
    return (
    <main>
        <h1 className="theme-h adaptive"id="title">{story.Name}</h1>
        <h3 className="theme-h adaptive"id="title">{story.Author}</h3>

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
        <div className="textbody">
            <p>{story.description}</p>
        </div>
        
        <div style={{ width: "100vw", height: "90vh" }}>
            <ReactFlow nodes={nodes} edges={edges} fitView>
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>
            </div>
    

    </main>
    );
}