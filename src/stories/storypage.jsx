import React, {Fragment, useEffect, useState } from "react";
import { useParams, useNavigate, NavLink} from "react-router-dom";
import ReactFlow, {MiniMap, Controls, Background, Handle, StraightEdge} from "reactflow";
import { ButtonGroup } from 'react-bootstrap';
import ELK from 'elkjs/lib/elk.bundled.js';




import Button from 'react-bootstrap/Button';

//import { AuthState } from '../login/authState.js';
import Select from 'react-select'
import Creatable from 'react-select/creatable';

import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
import 'reactflow/dist/style.css';


import {sanitizeId, formatJSONDate, filterProfanity} from'../utility/utility.js';
import { useWebSocketFacade } from'../utility/utility.jsx';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import "../app.css"
import "../utility/form.css"
import "../select.css"

const handleErrors = async (res) => {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.msg || "Unknown error");
    }
    return res.json();
};



  


export function ChapterForm({ handleClose, storyId, chapterId, profanity}){
    const socket = useWebSocketFacade()
    const [formData, setData] = useState({})
    const [chapters, setChapters] = useState([])
    const [sameStoryChapters, setSameStoryChapters] = useState([])
    const [chapterOptions, setChapterOptions] = useState([])
    const [sameStoryOptions, setSameStoryOptions] = useState([])
    const [genreOptions, setGenreOptions] = useState([])
    const [contentWarningOptions, setContentWarningOptions] = useState([])
    const [cleanGenreOptions, setCleanGenreOptions] = useState([])
    const [cleanContentWarningOptions, setCleanContentWarningOptions] = useState([])
    const [createdGenres, updateCreatedGenres] = useState([])
    const [createdWarnings, updateCreatedWarnings] = useState([])
    const [fullGenreOptions, updateFullGenres] = useState([])
    const [fullWarningOptions, updateFullWarnings] = useState([])

    useEffect(() => {
        updateFullGenres([...cleanGenreOptions, ...createdGenres])
    }, [createdGenres, cleanGenreOptions])
    useEffect(() => {
        updateFullWarnings([...cleanContentWarningOptions, ...createdWarnings])
    }, [cleanContentWarningOptions, createdWarnings])

    
    useEffect(() => {
        async function runFilter() {
            const cleanOptions = await filterProfanity(chapters, profanity, true);
            setChapterOptions(cleanOptions);
        }
        runFilter();
    }, [chapters, profanity])
    useEffect(() => {
        async function runFilter() {
            const cleanOptions = await filterProfanity(sameStoryChapters, profanity, true);
            setSameStoryOptions(cleanOptions);
        }
        runFilter();
    }, [sameStoryChapters, profanity])
    useEffect(() => {
        async function runFilter() {
            const cleanOptions = await filterProfanity(genreOptions, profanity, true);
            setCleanGenreOptions(cleanOptions);
        }
        runFilter();
    }, [genreOptions, profanity])
    useEffect(() => {
        async function runFilter() {
            const cleanOptions = await filterProfanity(contentWarningOptions, profanity, true);
            setCleanContentWarningOptions(cleanOptions);
        }
        runFilter();
    }, [contentWarningOptions, profanity])

    const handleCreateGenre = (newOptionValue) => {
        const newOption = {
            value: newOptionValue,
            label: newOptionValue
        };
        // Add new option to created options list
        updateCreatedGenres(prevOptions => [...prevOptions, newOption]);
        // You may want to also update formData here if required
        const selected = [...(formData.genres || []), newOption.value];
        setData({...formData, genres:selected})
    };
    const handleCreateWarning = (newOptionValue) => {
        const newOption = {
            value: newOptionValue,
            label: newOptionValue
        };
        // Add new option to created options list
        updateCreatedWarnings(prevOptions => [...prevOptions, newOption]);
        // You may want to also update formData here if required
        const selected = [...(formData.contentWarnings || []), newOption.value];
        setData({...formData, contetnWarnings:selected})
    };
    useEffect(() => {
        fetch(`/api/user/me`, {
            method:"GET",             
            headers: {'Content-Type': 'application/json'},
        })
        .then((res) => {
            if(!res.ok){
                handleClose();
            }
        })
        .catch((error) =>{
            console.error(error.message)
            handleClose?.();
        });
        if(chapterId){
            fetch(`/api/stories/chapter/${chapterId}`, {
                method:"GET",
                headers:{'Content-Type': 'application/json'}
            })
            .then(handleErrors)
            .then((data) => {
                // console.log(JSON.stringify(data))
                setData(data)
            })
            .catch((error) =>{
                console.error(error.message)
                handleClose?.()
            })
        }
        socket.subscribe({url:"/stories", type:"getOptions", collection:"genres", commandId:"chapterFormGenres", setData:setGenreOptions})
        socket.subscribe({url:"/stories", type:"getOptions", collection:"contentwarnings", commandId:"chapterFormWarnings", setData:setContentWarningOptions})
        socket.subscribe({url:`/stories/${storyId}`, type:"getOptions", collection:"chapters", commandId:"sameStory", query:{filter:{storyID:storyId}}, setData:setSameStoryChapters})
        socket.subscribe({url:`/stories`, type:"getOptions", collection:"chapters", commandId:"anyStory", setData:setChapters})
    },[storyId, chapterId])
    const handleSelectionChange = (attribute, values) => {
        const selected = values.map(value => value.value);
        setData({...formData, [attribute]:selected}); 
    };
    const handleSubmit = () => {
        if(chapterId){
            fetch(`/api/stories/${storyId}/${chapterId}`,{
                method:"PUT",
                headers: {"content-type": "application/json"},
                body:JSON.stringify(formData)
            })
            .then(handleErrors)
            .then(data => {
                // console.log(`successfully updated ${id}`)
                socket.notify({collection:"/stories", type:"PUT", storyID:storyId, chapterID:data.id})
                handleClose?.()
            })
            .catch((error) =>{
                console.error(error.message)
            })
        }
        else{
            fetch(`/api/stories/${storyId}`, {
                method:"POST",
                headers: {"content-type": "application/json"},
                body:JSON.stringify(formData)
            })
            .then(handleErrors)
            .then(data => {
                socket.notify({collection:"/stories", type:"POST", storyID:storyId, chapterID:data.id})
                handleClose?.()
            })
            .catch((error) =>{
                console.error(error.message)
            })
        }
    }
    return(
        <div>
            {chapterId && <h1> Modify {formData.title}</h1>}
            {!chapterId && <h1>Create Chapter</h1>}
            <div  className="mb-2 ">
                <label htmlFor="title">Title</label>
                <input 
                    id="title"
                    type="text"
                    className="form-control"
                    value={formData.title || ''}
                    onChange={(e) => setData({...formData, title:e.target.value})}
                />
            </div>
            <div  className="mb-2 ">
                <label htmlFor="description">Description</label>
                <textarea 
                    id="description"
                    type="text"
                    className="form-control"
                    value={formData.description || ''}
                    onChange={(e) => setData({...formData, description:e.target.value})}
                    placeholder={"A short descripton of the chapter"}
                />
            </div>
            <div  className="mb-2 ">
                <label htmlFor="body">Chapter Body</label>
                <textarea 
                    id="body"
                    type="text"
                    className="form-control"
                    value={formData.body || ''}
                    onChange={(e) => setData({...formData, body:e.target.value})}
                    placeholder={"Here is where you write the body of your chapter"}
                />
            </div>
            <div  className="mb-2 ">
                <label htmlFor='genres'>Genres</label>
                <Creatable 
                        isMulti
                        id="genres"
                        options={fullGenreOptions}
                        value={fullGenreOptions.filter(opt => formData.genres?.includes(opt.value)) || []}
                        onChange={(selectedOptions) => handleSelectionChange("genres", selectedOptions)}
                        onCreateOption={handleCreateGenre} // Handle new options being created
                        className="form-control react-select-container" 
                        classNamePrefix="react-select"
            />
            </div>
            <div  className="mb-2 ">
                <label htmlFor='warnings'>Content Warnings</label>
                <Creatable 
                        isMulti
                        id="warnings"
                        options={fullWarningOptions}
                        value={fullWarningOptions.filter(opt => formData.contentWarnings?.includes(opt.value)) || []}
                        onChange={(selectedOptions) => handleSelectionChange("contentWarnings", selectedOptions)}
                        onCreateOption={handleCreateWarning} // Handle new options being created
                        className="form-control react-select-container" 
                        classNamePrefix="react-select"
            />
            </div>
            <div  className="mb-2 ">
                <label htmlFor='samePrevious'>Previous Chapters Same Story</label>
                <Select 
                        isMulti
                        id="samePrevious"
                        options={sameStoryOptions}
                        value={sameStoryOptions.filter(opt => formData.samePrevious?.includes(opt.value)) || []}
                        onChange={(selectedOptions) => handleSelectionChange("samePrevious", selectedOptions)}
                        className="form-control react-select-container" 
                        classNamePrefix="react-select"
            />
            </div>
            <div  className="mb-2 ">
                <label htmlFor='anyPrevious'>Previous Chapters Any Story</label>
                <Select 
                        isMulti
                        id="anyPrevious"
                        options={chapterOptions}
                        value={chapterOptions.filter(opt => formData.anyPrevious?.includes(opt.value)) || []}
                        onChange={(selectedOptions) => handleSelectionChange("anyPrevious", selectedOptions)}
                        className="form-control react-select-container" 
                        classNamePrefix="react-select"
            />
            </div>
            <div  className="mb-2 ">
                <label htmlFor='sameNext'>Next Chapters Same Story</label>
                <Select 
                        isMulti
                        id="sameNext"
                        options={sameStoryOptions}
                        value={sameStoryOptions.filter(opt => formData.sameNext?.includes(opt.value)) || []}
                        onChange={(selectedOptions) => handleSelectionChange("sameNext", selectedOptions)}
                        className="form-control react-select-container" 
                        classNamePrefix="react-select"
            />
            </div>
            <div  className="mb-2 ">
                <label htmlFor='anyNext'>Next Chapters Any Story</label>
                <Select 
                        isMulti
                        id="anyNext"
                        options={chapterOptions}
                        value={chapterOptions.filter(opt => formData.anyNext?.includes(opt.value)) || []}
                        onChange={(selectedOptions) => handleSelectionChange("anyNext", selectedOptions)}
                        className="form-control react-select-container" 
                        classNamePrefix="react-select"
            />
            </div>
            <ButtonGroup>
                <Button onClick={handleSubmit} variant='primary'>Submit</Button>
                <Button onClick={handleClose} variant='secondary'>Close</Button>
            </ButtonGroup>
        </div>
    )

    

}
function StoryEditForm({socket, handleClose, storyId, genreOptions, contentWarningOptions}){
    const [formData, setData] = useState({})
    const [createdGenres, updateCreatedGenres] = useState([])
    const [createdWarnings, updateCreatedWarnings] = useState([])
    const [fullGenreOptions, updateFullGenres] = useState([])
    const [fullWarningOptions, updateFullWarnings] = useState([])
    const handleSelectionChange = (attribute, values) => {
        const selected = values.map(value => value.value);
        setData({...formData, [attribute]:selected}); 
    };
    const handleSubmit = () => {
        fetch(`/api/stories/${storyId}`, {
            method:"PUT",
            headers: {"content-type": "application/json"},
            body:JSON.stringify(formData)
        })
        .then(handleErrors)
        .then(data => {
            socket.notify({collection:"/stories", type:"POST", storyID:data.id})
            handleClose?.()
        })
        .catch((error) =>{
            console.error(error.message)
        })
    }
    const handleCreateGenre = (newOptionValue) => {
        const newOption = {
            value: newOptionValue,
            label: newOptionValue
        };
        // Add new option to created options list
        updateCreatedGenres(prevOptions => [...prevOptions, newOption]);
        // You may want to also update formData here if required
        const selected = [...(formData.genres || []), newOption.value];
        setData({...formData, genres:selected})
    };
    const handleCreateWarning = (newOptionValue) => {
        const newOption = {
            value: newOptionValue,
            label: newOptionValue
        };
        // Add new option to created options list
        updateCreatedWarnings(prevOptions => [...prevOptions, newOption]);
        // You may want to also update formData here if required
        const selected = [...(formData.contentWarnings || []), newOption.value];
        setData({...formData, contetnWarnings:selected})
    };
    useEffect(() => {
        updateFullGenres([...genreOptions, ...createdGenres])
    }, [createdGenres, genreOptions])
    useEffect(() => {
        updateFullWarnings([...contentWarningOptions, ...createdWarnings])
    }, [contentWarningOptions, createdWarnings])
    useEffect(() => {

        if(storyId){
            fetch(`/api/stories/${storyId}`, {
                method:"GET",
                headers:{'Content-Type': 'application/json'}
            })
            .then(handleErrors)
            .then((data) => {
                // console.log(JSON.stringify(data))
                setData(data)
            })
            .catch((error) =>{
                console.error(error.message)
                handleClose?.()
            })
        }
    }, [storyId, handleClose])
    return(   
    <div>
        <h1> Modify {formData.title}</h1>
        <div  className="mb-2 ">
            <label htmlFor="title">Title</label>
            <input 
                id="title"
                type="text"
                className="form-control"
                value={formData.title || ''}
                onChange={(e) => setData({...formData, title:e.target.value})}
            />
        </div>
        <div  className="mb-2 ">
            <label htmlFor="body">Story Description</label>
            <textarea 
                id="body"
                type="text"
                className="form-control"
                value={formData.body || ''}
                onChange={(e) => setData({...formData, body:e.target.value})}
                placeholder={"Here is where you write the body of your chapter"}
            />
        </div>
        <div  className="mb-2 ">
            <label htmlFor='genres'>Genres</label>
            <Creatable 
                    isMulti
                    id="genres"
                    options={fullGenreOptions}
                    value={fullGenreOptions.filter(opt => formData.genres?.includes(opt.value)) || []}
                    onChange={(selectedOptions) => handleSelectionChange("genres", selectedOptions)}
                    onCreateOption={handleCreateGenre} // Handle new options being created
                    className="form-control"
            />
        </div>
        <div  className="mb-2 ">
            <label htmlFor='warnings'>Content Warnings</label>
            <Creatable 
                    isMulti
                    id="warnings"
                    options={fullWarningOptions}
                    value={fullWarningOptions.filter(opt => formData.contentWarnings?.includes(opt.value)) || []}
                    onChange={(selectedOptions) => handleSelectionChange("contentWarnings", selectedOptions)}
                    onCreateOption={handleCreateWarning} // Handle new options being created
                    className="form-control"
            />
        </div>
        <ButtonGroup>
            <Button onClick={handleSubmit} variant='primary'>Submit</Button>
            <Button onClick={handleClose} variant='secondary'>Close</Button>
        </ButtonGroup>
    </div>)

}

const elk = new ELK()

const NavLinkNode = ({ data, id }) => {
    return (
      <div className="bg-white border border-gray-300 px-4 py-2 rounded shadow text-center">
        <Handle type="target" position="top" />
        <h3>{data.label}</h3>
        <NavLink to={data.url}>Go to {data.label}</NavLink>
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

function ChapterCardNode({data}){
    return(
        <div className="chapter-node" >
            <Handle type="target" position="top" />
            <h4> <NavLink to={data.url}>{data.title}</NavLink></h4>
            <h6>By: {data.author}</h6>
            <p className="scrollable">{data.description}</p>
            <ButtonGroup className="button-footer">
                <OverlayTrigger 
                    trigger="click"
                    placement="bottom"
                    overlay={
                        <Popover>
                            <Popover.Header as="h4">Genres:</Popover.Header>
                            <Popover.Body>
                                {data.genres.join(', ') }
                            </Popover.Body>
                        </Popover>
                    }
                >
                    <Button variant="secondary">Genres</Button>
                </OverlayTrigger>
                <OverlayTrigger 
                    trigger="click"
                    placement="bottom"
                    overlay={
                        <Popover>
                            <Popover.Header as="h4">Content Warnings: </Popover.Header>
                            <Popover.Body>
                                {data.contentWarnings.join(', ') }
                            </Popover.Body>
                        </Popover>
                    }
                >
                    <Button variant="secondary">Content Warnings</Button>
                </OverlayTrigger>
            </ButtonGroup>
            <Handle type="source" position="bottom" />
        </div>
    )
}

const myNodes = { chapterCard: ChapterCardNode }
const edgeTypes = {elkEdge:ElkEdge}

const getPathFromSection = (section) => {
    const { startPoint, bendPoints = [], endPoint } = section;
    const points = [startPoint, ...bendPoints, endPoint];
  
    return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
};

function ElkEdge({id, data}){
    // console.log(JSON.stringify(data))
    const path = getPathFromSection(data.section);

    return (
        <g className="elk-edge">
          <path id={id} d={path} className="custom-edge-path" />
        </g>
      );
}
function ChapterGraph({socket, profanity, filter, id}){
    const [graphData, setGraphData] = useState({})
    const [children, setChildren] = useState([])
    const [edges, setEdges] = useState([])
    const [flow, setFlow] = useState({})
    useEffect(()=> {
        if(id && socket){
            socket.subscribe({url:"/stories",commandId:"getStoryGraph", type:"getGraph", id, filter, setData:setGraphData})
        }
    }, [socket, filter, id])

    useEffect(() => {
        async function runFilter() {
            const cleanChildren = await filterProfanity(graphData.children, profanity);
            setChildren(cleanChildren);
        }
        if(graphData.children && graphData.edges){
            runFilter();
            setEdges(graphData.edges)
        }
    }, [profanity, graphData])
    useEffect(() => {
        if(children.length){
            const graph ={
                id: 'root',
                layoutOptions: {
                    'elk.algorithm': 'layered',
                    'elk.direction': 'DOWN',
                    "elk.layered.nodePlacement.strategy": "SIMPLE",  // Simple placement encourages tree-like spacing

                    'elk.spacing.nodeNode': '50',
                    'elk.spacing.edgeEdge': '20',
                    'elk.spacing.edgeNode': '20',
                    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
                    
                    "elk.layered.edgeStraightening": "IMPROVE_STRAIGHTNESS",
                    "elk.layered.edgeRouting": "POLYLINE",                
                    'elk.layered.allowNonFlowPorts': true,
                    'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
                    "elk.layered.crossingMinimization.strategy": "LAYER_SWAP" // Try minimizing messy edge routing

                  
                },
                children,
                edges
            }
            elk
            .layout(graph)
            .then((layoutedGraph) => {
                const nodes = layoutedGraph.children.map((node) => ({
                    ...node,
                    position:{x: node.x, y: node.y}
                }))
                const flowEdges = layoutedGraph.edges.map((edge) => ({
                    ...edge,
                    data:{
                        section:edge.sections[0]
                    },
                    type:"elkEdge"
                }))
                setFlow({nodes, edges:flowEdges})
                //setFlow({nodes, edges:layoutedGraph.edges})
            })
        }
        else{
            setFlow({})
        }
    }, [children, edges])
    // useEffect(() => {
    //     // console.log(JSON.stringify(flow))

    // }, [flow])
    

    return(
        <div className="flow-graph-container">
            <ReactFlow
                nodes={flow.nodes}
                edges={flow.edges}
                nodeTypes={myNodes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Controls/>
                <MiniMap/>
            </ReactFlow>
        </div>
            
    )
}

export function StoryPage(props) {
    const socket = useWebSocketFacade()
    const [authorOptions, setAuthorOptions] = useState([])
    const [genreOptions, setGenreOptions] = useState([])
    const [contentWarningOptions, setContentWarningOptions] = useState([])
    const [cleanAuthorOptions, setCleanAuthorOptions] = useState([])
    const [cleanGenreOptions, setCleanGenreOptions] = useState([])
    const [cleanContentWarningOptions, setCleanContentWarningOptions] = useState([])
    const [isAuthor, setIsAuthor] = useState(false); // Track if the logged-in user is the author
    
    const [story, setStory] = useState({});
    const [cleanStory, setCleanStory] = useState({});
    const [filter, setFilter] = useState({})
    const [visible, setVisibility] = useState(false);
    const [chapters, setChaptersMap] = useState({});
    const [editing, setEditing] = useState(false);
    
    const handleClose = () => setVisibility(false);
         
    const handleOpen = () => setVisibility(true);
    const path = window.location.pathname;
    const profanity = props.profanityFilter
    function toggleEditing(){
        setEditing(prevEditing => !prevEditing);
    }
    

    const [loading, setLoading] = useState(true);
    const { storyId } = useParams(); 
    const handleFilterChange = (attribute, values) => {

        const selected = values.map(value => value.value);
        if(!selected.length){
            setFilter({...filter, [attribute]:undefined});

        }
        else{
            setFilter({...filter, [attribute]:selected});
        }
        
    };

    useEffect(() => {
            fetch(`/api/stories/author/${storyId}`)
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
    }, [storyId, props.user])

    useEffect(() => {
        setLoading(true)

        //Get full path
        let paths = path;
        if(!paths.startsWith("/")){
            paths = "/" + paths;
        }
        socket.subscribe({url:path, type:"getDisplayable", collection:"stories", commandId:"getDisplayable", id:storyId,setData:setStory})
        socket.subscribe({url:"/users", type:"getOptions", collection:"users", commandId:"getAuthorFilter",setData:setAuthorOptions})
        socket.subscribe({url:"/stories", type:"getOptions", collection:"genres", commandId:"getGenreFilter",setData:setGenreOptions})
        socket.subscribe({url:"/stories", type:"getOptions", collection:"contentwarnings", commandId:"getContentWarningsFilter",setData:setContentWarningOptions})


        
    }, [storyId, path]);
    useEffect(() => {
        async function runFilter() {
            const cleanOptions = await filterProfanity(authorOptions, profanity, true);
            setCleanAuthorOptions(cleanOptions);
        }
        runFilter();
    }, [authorOptions, profanity])
    useEffect(() => {
        async function runFilter() {
            const cleanOptions = await filterProfanity(genreOptions, profanity, true);
            setCleanGenreOptions(cleanOptions);
        }
        runFilter();
    }, [genreOptions, profanity])
    useEffect(() => {
        async function runFilter() {
            const cleanOptions = await filterProfanity(contentWarningOptions, profanity, true);
            setCleanContentWarningOptions(cleanOptions);
        }
        runFilter();
    }, [contentWarningOptions, profanity])

    useEffect(() => {
        async function runFilter() {
            const tempStory = await filterProfanity(story, profanity);
            setCleanStory(tempStory);
        }
        runFilter();
    }, [story, profanity]);
    if(editing){
        return(<main>
            <StoryEditForm 
                socket={socket} 
                handleClose={toggleEditing} 
                storyId={storyId}
                genreOptions={cleanGenreOptions}
                contentWarningOptions={cleanContentWarningOptions}

            />
        </main>)

    }
    else{
        return (
            <main>
                <h1 className="theme-h adaptive"id="title">{cleanStory.title}</h1>
                
                <h3 className="theme-h adaptive"id="title">By: {cleanStory.author}</h3>
                {isAuthor && <Button variant ="primary" onClick={toggleEditing} >
                        Edit
                    </Button>}
    
                <button onClick={handleOpen} /*disabled={props.authState !== AuthState.Authenticated*/ className="btn btn-primary button-align"  data-bs-toggle="offcanvas" data-bs-target="#offcanvas" aria-controls="offcanvas">New Chapter</button>
                <Offcanvas show={visible} className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
                    
                    <OffcanvasHeader className="offcanvas-header">
                        <button onClick={handleClose}type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </OffcanvasHeader>
                    <OffcanvasBody className="new">
                        <ChapterForm handleClose={handleClose} profanity={profanity} storyId={storyId}/>
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
                                })}
                            </td>
                        </tr>
                        }
                        {story.created && 
                        <tr>
                            <th>Created</th>
                            <td>{formatJSONDate(story.created)}</td>
                        </tr>
                        }
                        {story.modified && 
                        <tr>
                            <th>Modified</th>
                            <td>{formatJSONDate(story.modified)}</td>
                        </tr>
                        }
                        {story.expanded && 
                        <tr>
                            <th>Expanded</th>
                            <td>{formatJSONDate(story.expanded)}</td>
                        </tr>
                        }
                    </tbody>
                </table>
                <div className="textbody">
                    <p>{cleanStory.body}</p>
                </div>
                <div className="filterAndSort theme-h adaptive expanded">
                    <h4>Filter:</h4> 
                    <div className="input-group" key="author">
                        <label className="input-group-text" htmlFor="author">
                            Author
                        </label>
                        <Select 
                            isMulti 
                            options={cleanAuthorOptions} 
                            onChange={(selectedOptions) => handleFilterChange("author", selectedOptions)}
                            name="author"
                            className="form-control react-select-container" 
                            classNamePrefix="react-select"

                        />
                    </div>
                    <div className="input-group" key="genre">
                        <label className="input-group-text" htmlFor="genre">
                            Genre
                        </label>
                        <Select 
                            isMulti 
                            options={cleanGenreOptions} 
                            name="genre"
                            onChange={(selectedOptions) => handleFilterChange("genres", selectedOptions)}
                            className="form-control react-select-container" 
                            classNamePrefix="react-select"

                        />
                    </div>
                    <div className="input-group" key="contentwarning">
                        <label className="input-group-text" htmlFor="contentwarning">
                            Content Warning
                        </label>
                        <Select 
                            isMulti 
                            options={cleanContentWarningOptions} 
                            name="contentwarning"
                            onChange={(selectedOptions) => handleFilterChange("contentwarnings", selectedOptions)}
                            className="form-control react-select-container" 
                            classNamePrefix="react-select"

    
                        />
                    </div>
                </div>
                <div className="flow-view-container" >
                    <ChapterGraph id={storyId} profanity={profanity} filter={filter} socket={socket}/>
                </div>
                
                
            
        
            </main>);
    }

    
    
    
    
}