import React, {Fragment, useEffect, useState } from "react";
import { useParams, useNavigate, NavLink} from "react-router-dom";
import ReactFlow, {MiniMap, Controls, Background, Handle} from "reactflow";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

//import { AuthState } from '../login/authState.js';
import Select from 'react-select'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';

import "../app.css"

import 'bootstrap/dist/css/bootstrap.min.css';
import {sanitizeId, formatJSONDate, filterProfanity} from'../utility/utility.js';
import { useWebSocketFacade } from'../utility/utility.jsx';

const NavLinkNode = ({ data, id }) => {
    return (
      <div className="navlink-node">
        <Handle type="target" position="top" />
        <h3>{data.label}</h3>
        <NavLink to={data.path}>Go to {data.label}</NavLink>
         <Handle type="source" position="bottom" />
      </div>
    );
  };

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
      position: { x: chapter.chapterId * 200, y: (chapter.chapterNumber - 1) * 100 },
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

  
function StoryFlow({list}){
    const { nodes, edges } = generateGraph(list);
    

    const handleNodeClick = (_, node) => navigate(`/${node.data.path}`);


    return(
        <ReactFlow 
        nodes={nodes} 
        edges={edges}         
        onNodeClick={handleNodeClick} 
        nodeTypes={{ custom: NavLinkNode }} 
        fitView>
            <MiniMap />
            <Controls />
            <Background />
        </ReactFlow>
    );

}

export function StoryPage(props) {
    const socket = useWebSocketFacade()

    const [story, setStory] = useState({});
    const [cleanStory, setCleanStory] = useState({});
    const [list, setList] = useState([]);
    const [visible, setVisibility] = useState(false);
    const [chapters, setChaptersMap] = useState({});
    const [selections, setSelections] = useState([]);
    const handleClose = () => setVisibility(false);
         
    const handleOpen = () => setVisibility(true);
    const path = window.location.pathname;
    const profanity = props.profanityFilter
    
    
    const [error, setError] = useState(null);
    const [chaptersError, setChaptersError] = useState(null);

    const [loading, setLoading] = useState(true);
    const { storyId } = useParams(); 


    useEffect(() => {
        setLoading(true)

        //Get full path
        let paths = path;
        if(!paths.startsWith("/")){
            paths = "/" + paths;
        }
        socket.subscribe({url:path, type:"getDisplayable", collection:"stories", commandId:"getDisplayable", id:storyId,setData:setStory})

        
        
    }, [storyId]);

    useEffect(() => {
        async function runFilter() {
            const tempStory = await filterProfanity(story, profanity);
            setCleanStory(tempStory);
        }
        runFilter();
    }, [story, profanity]);


    return (
        <main>
            <h1 className="theme-h adaptive"id="title">{cleanStory.title}</h1>
            <h3 className="theme-h adaptive"id="title">{cleanStory.author}</h3>


            <button onClick={handleOpen} /*disabled={props.authState !== AuthState.Authenticated*/ className="btn btn-primary button-align"  data-bs-toggle="offcanvas" data-bs-target="#offcanvas" aria-controls="offcanvas">New Chapter</button>
            <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
                
                <OffcanvasHeader className="offcanvas-header">
                    <h4 className="offcanvas-title" id="offcanvasLabel">New Chapter</h4>
                    <button onClick={handleClose}type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </OffcanvasHeader>
                <OffcanvasBody className="new">
                    <form  className="form-container">
                        <div className="input-group" >
                            <label className="input-group-text" htmlFor="title">
                                Title
                            </label>
                            <input className="form-control" placeholder="Title" type="text" name="title" required/> 
                        </div>
                        <div className="input-group" >
                            <label className="input-group-text" htmlFor="genre">
                                Genres
                            </label>
                            <input className="form-control" placeholder="a list of genres separated by semicolons ;" type="text" name="genre"/> 
                        </div>
                        <div className="input-group" >
                            <label className="input-group-text" htmlFor="contentwarning">
                                Content Warnings
                            </label>
                            <input className="form-control" placeholder="a list of content warnings separated by semicolons ;" type="text" name="contentwarning" /> 
                        </div>
                        <div className="input-group">
                            <label className="input-group-text" htmlFor="previous">
                                Previous Chapter(s)
                            </label>
                            <Select 
                            
                                options={chapters}
                                isMulti
                                className="form-control"
                                name="previous"
                                onChange={(selected) => updatePrevious(selected)}
                            />
                        </div>
                        
                        <div className="input-group">
                        <label className="input-group-text" htmlFor="body">
                                Chapter Body
                            </label>
                            <textarea className="form-control" placeholder="Here is your chapter's Body" type="text" name="body" required/> 
                        </div>
                        <div className="btn-group">
                            <button className="btn btn-primary" type="submit">Create</button>
                            <button onClick={handleClose} type="button" className="btn btn-secondary cancel" data-bs-dismiss="offcanvas" aria-label="Close">Cancel</button>
                        </div>
                        <div className="input-group">
                            <label className="input-group-text" htmlFor="next">
                                Next Chapter(s)
                            </label>
                            <Select 
                            
                                options={chapters}
                                isMulti
                                className="form-control"
                                name="next"
                                onChange={(selected) => updateNext(selected)}
                            />
                        </div>
                    </form>
                </OffcanvasBody>
            </Offcanvas>
            <table>
                <tbody>
                    {cleanStory.genres && 
                    <tr>
                        <th>Genres</th>
                        <td>{cleanStory.genres.map((value, index) =>{
                            return <span key={index}>{value} {index < cleanStory.genres.length - 1 && <span>, </span>}</span>
                        })}</td>
                    </tr>
                    }
                    {cleanStory.contentWarnings && 
                    <tr>
                        <th>Content Warnings</th>
                        <td>{cleanStory.contentWarnings.map((value, index) =>{
                            return <span key={index}>{value} {index < cleanStory.contentWarnings.length - 1 && <span>, </span>}</span>
                        })}</td>
                    </tr>
                    }
                </tbody>
            </table>
            <div className="textbody">
                <p>{cleanStory.body}</p>
            </div>
    
    
            {chaptersError ? <p>Error Loading Chapters</p> :
                <div style={{ width: "100vw", height: "90vh" }}>
                    <StoryFlow list={list}/>
                </div>
            }
        
    
        </main>
    );
    
    
}