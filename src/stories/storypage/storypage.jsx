import React from 'react';
import { NavLink } from 'react-router-dom';
import "../../app.css"

import 'bootstrap/dist/css/bootstrap.min.css';

export function StoryPage() {
    return (
    <main>
        <h1 className="theme-h adaptive"id="title">Story title here</h1>
        <table>
            <tr>
                <th>Genres:</th>
                <td>Genre List here</td>
            </tr>
            <tr>
                <th>Content Warnings:</th>
                <td>Content Warnings List here</td>
            </tr>
        </table>
        <div className="textbody">
            description of the story here 
        </div>
        <div className="textbody">
            <p>
                Put a Navigation element that pulls from `chapter/chapters/&lt;storytitle&gt;/list.json` here, 
                format it such that the chapters of that list appear in a tree, chapter 1 at the top, then the branches to the various 
                chapter 2s and then branches to chapter 3s and so on, each chapter including the title description, genre, and content warnings. 
                No I do not feel that I need to do so now, because it would need to be completely redone once I start doing my JSON
            </p>
        </div>

    </main>
    );
}