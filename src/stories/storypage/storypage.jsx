import React, {Fragment, useEffect, useState } from "react";
import { useParams, useNavigate, NavLink} from "react-router-dom";
import ReactFlow, {MiniMap, Controls, Background, Handle} from "reactflow";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

//import { AuthState } from '../login/authState.js';
import Select from 'react-select'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';

import "../../app.css"

import 'bootstrap/dist/css/bootstrap.min.css';
import {sanitizeId, formatJSONDate} from'../../utility/utility.js';

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
function widthCalculator(chapters){
    const visited = new Set();
    const minWidths = new Map();
    const dfs = (chapter) => {
        if(visited.has(chapter.chapterId)){
            return minWidths[chapter.chapterId] || NODE_WIDTH + NODE_SPACING;
        }
        visited.add(chapter);

    }

    chapters.forEach((chapter) => {
        if(!visited.has(chapter.chapterId)){
            dfs(chapter)
        }
    });

    return minWidths;
}
const generateEdges = (chapters) => {
    const edges = [];
    chapters.forEach((chapter) => {
        if(chapter.previous){
            if(Array.isArray(chapter.previous)){
                chapter.previous.forEach((previousID) => {
                    edges.push({
                        id: `e${previousID}-${chapter.chapterId}`,
                        source: previousID.toString(),
                        target: chapter.chapterId.toString()
                    });
                });
            }
            else{
                edges.push({
                    id: `e${chapter.previous}-${chapter.chapterId}`,
                    source: chapter.previous.toString(),
                    target: chapter.chapterId.toString()
                });
            }
        }
    });
    return edges;
}

const NODE_WIDTH = 200;
const NODE_SPACING = 50;
  
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
    const [story, setStory] = useState({});
    const [list, setList] = useState([]);
    const [visible, setVisibility] = useState(false);
    const [chapters, setChaptersMap] = useState({});
    const [selections, setSelections] = useState([]);
    const [pervious, setPrevious] = useState([])
    const [next, setNext] = useState([])
    const handleClose = () => setVisibility(false);
         
    const handleOpen = () => setVisibility(true);
    const path = window.location.pathname;

    
    
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
        
        fetch(`/api${paths}`)
            .then((response) => response.json())
            .then((data) => {
                setStory(data);
                setError(null);
            }).catch ((err) => {
                setError(err.message);
            })
        fetch(`/api${paths}/chapters`)
        .then((res) => res.json())
        .then((data) => {
            setList(data)
        })
        .catch ((err) => {
            setError(err.message);
        })
        .finally (() => {
            setLoading(false); // Make sure loading state is reset
        })
    }, [storyId]);

    useEffect(() => {
        const newChaptersMap = list.map(chapter => {
            return{label:chapter.title, 
                value:{title:chapter.title, chapterId:chapter.chapterId, chapterNumber:chapter.chapterNumber,  path:chapter.path}}
        });
        setChaptersMap(newChaptersMap);
    }, [list])

    const updatePrevious = (selected) => {
        const updatedPrevious = selected.map(option => option.value);
        setPrevious(updatedPrevious)
    }

    const updateNext = (selected) => {
        const updatedNext = selected.map(option => option.value);
        setNext(updatedNext)
    }

    const updateSelections = (label, selected) => {
        const updatedSelections = [...selections];
        const index = updatedSelections.findIndex(item => item.label === label)
        if(index !== -1){
            updatedSelections[index].value = selected.map(option => option.value);
        }
        else{
            const values = selected.map(option => option.value);
            updatedSelections.push({label:label, value:values});
        }
        setSelections(updatedSelections);
    };

    const handleSubmit = async (event) =>{
        const formData = new FormData(event.target);

        const chapterId = Math.max(...list.map(item => item.chapterId)) + 1;
        const previous = selections.find(item => item.label === "previous").value;
        const previousIds = previous ? previous.map(item => item.chapterId) : [];
        const next = selections.find(item => item.label === "next").value;
        const nextIds = next ? next.map(item => item.chapterId) : [];

        const previousChapter = Array.isArray(previous) ?  previous.reduce((acc, curr) => acc + curr.chapterNumber): next ? next : 0;
        const nextChapter = Array.isArray(next) ?  next.reduce((acc, curr) => acc + curr.chapterNumber): next ? next : null;

        const chapterNumber = previousChapter 
        ? (nextChapter ? (previousChapter + nextChapter)/
        ((Array.isArray(previous) ? (previous.length) : 1) + (Array.isArray(next) ? (next.length) : 1)  )
        : (previousChapter/Array.isArray(previous) ? (previous.length) : 1) + 1) 
        : (nextChapter ? (nextChapter/(Array.isArray(next) ? (next.length) : 1)) - 1 : 1);
        let paths = path;
        if(!paths.startsWith("/")){
            paths = "/" + paths;
        }
        const genres = formData.genre.split(";").map(item => item.trim()).filter(item => item !== '');
        const contentwarning = formData.contentwarning.split(";").map(item => item.trim()).filter(item => item !== '');
        const created = new Date().toJSON();


        const chapterOutput = {
            story:{title:story.title, path:paths},
            title:formData.title,
            genre:genres,
            contentwarning:contentwarning,
            author:props.user.username,
            body:formData.body,
            chapterId:chapterId,
            chapterNumber:chapterNumber,
            previous:previous,
            next:next,
            created:created,
            modified:created
        }
        const fileName = sanitizeId(`${chapterOutput.chapterId}_${chapterOutput.title}`);
        const filePath = `${paths}/${fileName}`;
        const listOutput = {
            title:formData.title,
            path:filePath,
            genre:genres,
            contentwarning:contentwarning,
            author:props.user.username,
            chapterId:chapterId,
            chapterNumber:chapterNumber,
            previous:previousIds,
            branches:nextIds,
            created:created
        }
        const localListData = localStorage.getItem(`${path}/list`) ?? '[]';
        const localList = JSON.parse(localListData);
        localList.push(listOutput);
        localStorage.setItem(`${path}/list`, JSON.stringify(localList));
        //will need to add a way to update the story page, to be able to update the recently expanded tag
        localStorage.setItem(filePath, JSON.stringify(chapterOutput));
    }

    if(loading){
        <main>
             <p>Loading</p>
        </main>
    }
    else if (error){
        <main><p style={{color:"red"}}>{error}</p></main>
    }
    else{
        return (
            <main>
                <h1 className="theme-h adaptive"id="title">{story.title}</h1>
                <h3 className="theme-h adaptive"id="title">{story.author}</h3>


                <button onClick={handleOpen} /*disabled={props.authState !== AuthState.Authenticated*/ className="btn btn-primary button-align"  data-bs-toggle="offcanvas" data-bs-target="#offcanvas" aria-controls="offcanvas">New Chapter</button>
                <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
                    
                    <OffcanvasHeader className="offcanvas-header">
                        <h4 className="offcanvas-title" id="offcanvasLabel">New Chapter</h4>
                        <button onClick={handleClose}type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </OffcanvasHeader>
                    <OffcanvasBody className="new">
                        <form onSubmit={handleSubmit} className="form-container">
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
        
        
                {chaptersError ? <p>Error Loading Chapters</p> :
                    <div style={{ width: "100vw", height: "90vh" }}>
                        <StoryFlow list={list}/>
                    </div>
                }
            
        
            </main>
        );
    }
    
}