import React, {Fragment, useEffect, useState } from "react";
import { useParams, useNavigate, NavLink} from "react-router-dom";
import ReactFlow, {MiniMap, Controls, Background, Handle} from "reactflow";
import { ButtonGroup } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

//import { AuthState } from '../login/authState.js';
import Select from 'react-select'
import Creatable from 'react-select/creatable';

import Offcanvas from 'react-bootstrap/Offcanvas';
import { OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';

import "../app.css"

import {sanitizeId, formatJSONDate, filterProfanity} from'../utility/utility.js';
import { useWebSocketFacade } from'../utility/utility.jsx';
const handleErrors = async (res) => {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.msg || "Unknown error");
    }
    return res.json();
};
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
            fetch(`/api/story/chapter/${chapterId}`, {
                method:"GET",
                headers:{'Content-Type': 'application/json'}
            })
            .then(handleErrors)
            .then((data) => {
                console.log(JSON.stringify(data))
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
                console.log(`successfully updated ${id}`)
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
            <div  className="mb-2 ">
                <label htmlFor='samePrevious'>Previous Chapters Same Story</label>
                <Select 
                        isMulti
                        id="samePrevious"
                        options={sameStoryOptions}
                        value={sameStoryOptions.filter(opt => formData.samePrevious?.includes(opt.value)) || []}
                        onChange={(selectedOptions) => handleSelectionChange("samePrevious", selectedOptions)}
                        className="form-control"
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
                        className="form-control"
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
                        className="form-control"
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
                        className="form-control"
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
                console.log(JSON.stringify(data))
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


        
    }, [storyId]);
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
                            })}</td>
                        </tr>
                        }
                    </tbody>
                </table>
                <div className="textbody">
                    <p>{cleanStory.body}</p>
                </div>
                <div className="filterAndSort theme-h adaptive">
                    <h4>Filter:</h4> 
                    <div className="input-group" key="author">
                        <label className="input-group-text" htmlFor="author">
                            Author
                        </label>
                        <Select 
                            isMulti 
                            options={cleanAuthorOptions} 
                            className="form-control" 
                            onChange={(selectedOptions) => handleFilterChange("author", selectedOptions)}
                            name="author"
                        />
                    </div>
                    <div className="input-group" key="genre">
                        <label className="input-group-text" htmlFor="genre">
                            Genre
                        </label>
                        <Select 
                            isMulti 
                            options={cleanGenreOptions} 
                            className="form-control" 
                            name="genre"
                            onChange={(selectedOptions) => handleFilterChange("genres", selectedOptions)}
                        />
                    </div>
                    <div className="input-group" key="contentwarning">
                        <label className="input-group-text" htmlFor="contentwarning">
                            Content Warning
                        </label>
                        <Select 
                            isMulti 
                            options={cleanContentWarningOptions} 
                            className="form-control" 
                            name="contentwarning"
                            onChange={(selectedOptions) => handleFilterChange("contentwarnings", selectedOptions)}
    
                        />
                    </div>
                </div>
                
                <div style={{ width: "100vw", height: "90vh" }}>
                </div>
                
            
        
            </main>);
    }

    
    
    
    
}