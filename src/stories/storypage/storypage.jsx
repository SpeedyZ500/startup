import React, {Fragment, useEffect, useState } from "react";
import { useParams, useNavigate, NavLink} from "react-router-dom";
import ReactFlow, {MiniMap, Controls, Background, Handle} from "reactflow";

import "../../app.css"

import 'bootstrap/dist/css/bootstrap.min.css';
import {sanitizeId, fetchJSONByPath, fetchListByPath, formatJSONDate} from'../../utility/utility.js';

const CustomNode = ({data}) => {
    const navigate = useNavigate();

    return(<div className="bg-white border border-gray-300 px-4 py-2 rounded shadow text-center"
    onClick={(e) => {e.stopPropagation()}}
    >
        <Handle type="target" position="top" />
        <span onClick={() => navigate(data.path)}>{data.label}</span>
       
        <Handle type="source" position="bottom" />
    </div>);
}
const generateGraph = (chapters) => {
    const nodes = chapters.map((chapter) => ({
      id: chapter.chapterId.toString(),
      type:"custom",
      position: { x: chapter.chapterId * 200, y: chapter.chapterNumber * 100 },
      data: { label: `${chapter.chapterNumber}: ${chapter.title}`, path: chapter.path },
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
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={{ custom: CustomNode }} fitView>
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>
            </div>
    

    </main>
    );
}