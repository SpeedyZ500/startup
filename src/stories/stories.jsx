import React from 'react';
export function Stories() {
    return (
    <main>
        <div class="theme-h adaptive textbody">
                <h1>Stories</h1>
                <aside> All the wonderful User Generated Stories.</aside>
            </div>
            <button class="btn btn-primary button-align" onClick="openForm()" data-bs-toggle="offcanvas" data-bs-target="#offcanvasStory" aria-controls="offcanvasStory">New Story</button>
            <div class="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasStory" aria-labelledby="offcanvasStoryLabel">
                <div class="offcanvas-header">
                    <h4 class="offcanvas-title" id="offcanvasStoryLabel">New Story</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>

                </div>
                <div class="offcanvas-body">
                    <div class="form-popup" id="newStory">
                    
                        <form class="form-container">
                            <div class="input-group mb-3">
                                <lable class="input-group-text" for="title">Title:</lable>
                                <input class="form-control" type="text" placheolder="title" name="title" required /> 
                            </div>
                            <div class="input-group mb-3">
                                <lable class="input-group-text" for="descripton">Description:</lable>
                                <input class="form-control" type="text" placheolder="description" name="description" />  
                            </div>
                            <div class="input-group mb-3">
                                <lable class="input-group-text" for="chapterTitle">Chapter Title:</lable>
                                <input class="form-control" type="text" placheolder="Chapter Title" name="chapterTitle"/> 
                            </div>
                            <div class=" mb-3">
                                <lable for="story" class="form-label">Chapter Body</lable>
                                <textarea class="form-control" id="story" placheolder="your story" name="story"> </textarea>    
                            </div>
                            <div class="input-group mb-3">
                                <lable class="input-group-text" for="genre">Genre(s):</lable>
                                <input class="form-control" type="text" placheolder="genre" name="genre" /> 
                            </div>
                            <div class="input-group mb-3">
                                <lable class="input-group-text" for="contentwarning">Content Warning(s):</lable>
                                <input class="form-control" type="text" placheolder="content warning" name="contentwarning"/> 
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-primary" type="submit">Create</button>
                                <button type="button" class="btn btn-secondary cancel" data-bs-dismiss="offcanvas" aria-label="Close">Cancel</button>
                            </div>
                        </form>   
                    </div>             
                </div>
            </div>
            <div class="theme-h adaptive expanded" style="margin-bottom:20px">
                <form class="filterAndSort" action="" method="get">
                    <h4>Filter:</h4>    
                    <div class="input-group mb-3">
                        <lable class="input-group-text"for="genre">Genre: </lable>
                        <select class="form-select" id="genre" name="varGenre">
                            <option selected>All</option>
                            <option>Example</option>
                        </select>
                    </div>
                    <div class="input-group mb-3">
                         <lable class="input-group-text" for="author">Author: </lable>
                        <select class="form-select" id="author" name="varAuthor">
                            <option selected>All</option>
                            <option>Spencer Zaugg</option>
                        </select>
                    </div>
                    <div class="input-group mb-3">
                        <lable class="input-group-text" for="sort">Sort: </lable>
                        <select class="form-select" id="sort" name="varSort">
                            <option selected>Popular</option>
                            <option>New to Old</option>
                            <option>Old to New</option>
                            <option>A-Z Title</option>
                            <option>Z-A Title</option>
                            <option>A-Z Author</option>
                            <option>Z-A Author</option>
                            <option>Recently Expanded</option>
                        </select>
                    </div>
                   
                    
                </form>
            </div>
            <div class="card-columns d-flex" id="stories">
                <div class="card" style="width: 18rem">
                    <div class="card-header theme-c adaptive">
                        <h4><a class="card-link" href="templates/themoonlitealchemist.html"> The Moonlit Alchemist</a></h4>

                     </div>
                    <div class="card-body theme adaptive">
                        <h6 class="card-subtitle">by: Spencer Zaugg</h6>
                        <p>
                            The story of a mysterious Alchemist who's alchemy is enhanced by moonlight, displaced from his world
                        </p>
                        
                    </div>
                    <div class="card-footer theme-c adaptive">
                        // Note Popers won't work until I add the nessisary Java Script stuff, I will deal with that later
                        <button type="button" class="btn btn-sm btn-secondary" data-bs-toggle="popover" data-bs-title="Genres" data-bs-content="Example">Genre</button>
                        <button type="button" class="btn btn-sm btn-secondary" data-bs-toggle="popover"  data-bs-title="Content Warnings" data-bs-content="Fallen Universe">Content Warnings</button>

                    </div>
                </div>              
            </div>
    </main>);
}