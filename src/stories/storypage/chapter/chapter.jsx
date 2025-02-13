import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import './chapter.css';


export function Chapter() {
    return (
    <main className="chapter">
        <h1 id="title" className="theme-h adaptive">Chapter Title</h1>
        <table className="theme-h adaptive">
            <tr>
                <th>Genres:</th>
                <td>Genre List here</td>
            </tr>
            <tr>
                <th>Content Warnings:</th>
                <td>Content Warnings List here</td>
            </tr>
        </table>
        <div className="buttons border-bottom" width="80%">
            <NavLink className="btn btn-primary" >Previous</NavLink>
            <NavLink className="btn btn-primary">Back to Story Page</NavLink>
            <NavLink className="btn btn-primary" >Next</NavLink>
        </div>
        


        <div className="textbody">
            <p>
                Behold the body of the chapter, here is where you would read the chapter, if there was a chapter that existed
                Yes I know that I will be needing to change the next button to like a dropdown, but this is just an example for now.
                I'll make it so that you can select what branch you want to go down. Also think about adding a new chapter/branch button
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