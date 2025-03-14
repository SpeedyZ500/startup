# Project Yggdrasil
![PROJECT_YGGDRASIL](ui/public/ProjectYggdrasil.png)

[My Notes](notes.md)

A shared Authoring Site where you can submitt writing prompts and build off of other people's stories. What makes it special is that you are able to create branching timelines at the chapter level, meaning if you want to continue the story, you can, if you feel like a chapter could have gone another way, and the characters could have taken a different path, go ahead and write it, make a new branch of the timeline who knows maybe the story overseer (the other of the original story part) will decide that your timeline is actuatually the main timeline. The goal is to create a site that allows for expansive multiverses, where creators can feel free to try out many different possibilites, and **colaborate** as they improve their worldbuilding, writing, and charactor development skills in an environment where they can get feedback and see examples of other people's work on the same story.


> [!NOTE]
>  This is a template for your startup application. You must modify this `README.md` file for each phase of your development. You only need to fill in the section for each deliverable when that deliverable is submitted in Canvas. Without completing the section for a deliverable, the TA will not know what to look for when grading your submission. Feel free to add additional information to each deliverable description, but make sure you at least have the list of rubric items and a description of what you did for each item.

> [!NOTE]
>  If you are not familiar with Markdown then you should review the [documentation](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) before continuing.

## 🚀 Specification Deliverable

> [!NOTE]
>  Fill in this sections as the submission artifact for this deliverable. You can refer to this [example](https://github.com/webprogramming260/startup-example/blob/main/README.md) for inspiration.

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

Have you ever had an idea for a story, but not known how to write it, or a part of a story but you don't know how to start it, or a start of a story that you don't know how to continue? Have you ever been reading/listening to/watching a story/movie/tv show and asked yourself what if **X** happened instead or **X** was there? Project Yggdrasil makes all this and more possible to work with just start by sharing what you have, the Norse Myth of Yggdrasil the World Tree is that of a tree that connects the Nine Relms, but the tree of Project Yggdrasil is the endless branching timelines, users are able to use it to read and create endlessly branching stories, provide each other feedback on their storytelling, and share writing tips. If a user is reading an otherwise compelling story, they can go to the chapter where things started going in the wrong direction and create their own branch of the story, their own timeline that others can build off of.

### Design

![Mock](Project_Yggdrisil_HomePage.png)

Here is a sequence diagram that shows how people would interact with the backend to submit a writing prompt, write a story or story part for it, and then continue or split off of the orignial branches to move in a different direction.

```mermaid
sequenceDiagram
    actor Tanner
    actor Kora
    actor Ryan
    actor Taran
    actor Dallan
    
    Tanner->>Server: Prompt, A world with regular natural disasters and yet life still persists on it
    Server->>Kora: Prompt, A world with regular natural disasters and yet life still persists on it
    Server->>Ryan: Prompt, A world with regular natural disasters and yet life still persists on it
    Server->>Taran: Prompt, A world with regular natural disasters and yet life still persists on it
    Server->>Dallan: Prompt, A world with regular natural disasters and yet life still persists on it
    Kora->>Server: Story, The Land of the Eternal Storm
    Server->>Tanner: Story, The Land of the Eternal Storm, by Kora
    Server->>Ryan: Story, The Land of the Eternal Storm, by Kora
    Server->>Taran: Story, The Land of the Eternal Storm, by Kora
    Server->>Dallan:  Story, The Land of the Eternal Storm, by Kora
    Ryan->>Server: Branch, The Land of the Eternal Storm, by Kora, Warriors forged from Storm and Ash
    Server->>Tanner: Branch, The Land of the Eternal Storm, ..., chapter 2, Warriors forged from Storm and Ash, by Ryan
    Server->>Kora: Branch, The Land of the Eternal Storm, ..., chapter 2, Warriors forged from Storm and Ash, by Ryan
    Server->>Taran: Branch, The Land of the Eternal Storm, ..., chapter 2, Warriors forged from Storm and Ash, by Ryan
    Server->>Dallan: Branch, The Land of the Eternal Storm, ..., chapter 2, Warriors forged from Storm and Ash, by Ryan
    Taran->>Server: Branch, The Land of the Eternal Storm, ..., chapter 2, Warriors forged from Storm and Ash, by Ryan, The Conquering Storm
    Server->>Tanner: Branch, The Land of the Eternal Storm, ..., from chapter 2, Warriors forged from Storm and Ash, ..., chapter 3, The Conquering Storm, by Taran
    Server->>Kora: Branch, The Land of the Eternal Storm, ..., from chapter 2, Warriors forged from Storm and Ash, ..., chapter 3, The Conquering Storm, by Taran
    Server->>Ryan: Branch, The Land of the Eternal Storm,  ..., from chapter 2, Warriors forged from Storm and Ash, ..., chapter 3, The Conquering Storm, by Taran
    Server->>Dallan: Branch, The Land of the Eternal Storm,  ..., from chapter 2, Warriors forged from Storm and Ash, ..., chapter 3, The Conquering Storm, by Taran
    Dallan->>Server: Branch, The Land of the Eternal Storm, ..., chapter 2, Warriors forged from Storm and Ash, by Ryan, The Nurturing Rains
    Server->>Tanner: Branch, The Land of the Eternal Storm,  ..., from chapter 2, Warriors forged from Storm and Ash, ..., chapter 3, The Nurturing Rains, by Dallan
    Server->>Kora: Branch, The Land of the Eternal Storm,  ..., from chapter 2, Warriors forged from Storm and Ash, ..., chapter 3, The Nurturing Rains, by Dallan
    Server->>Ryan: Branch, The Land of the Eternal Storm,  ..., from chapter 2, Warriors forged from Storm and Ash, ..., chapter 3, The Nurturing Rains, by Dallan
    Server->>Taran: Branch, The Land of the Eternal Storm,  ..., from chapter 2, Warriors forged from Storm and Ash, ..., chapter 3, The Nurturing Rains, by Dallan

    
```

### Key features

- Secure login over HTTPS
- Ability to submit Story Prompts
- Display of Stories based on any given prompt
- Like, Comment, and Follow Stories/branches, will notify when a new branch is added to the story or Branch
- Ability to split off at the chapter level to an alternate posibility for the story
- Ability to follow Story Prompt to be notified of any stories generated from that prompt by users
- Can't use User Generated content for AI Training models by AI Scraper Bots if possible
- persistently store stories comments likes edits and branches

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - Uses correct HTML structure for application. Many HTML pages, Login page, home page, story prompts page, explore stories page, search page, potentially some wiki style pages for Worldbuilding stuff, such as races, countries, cities, and Magic Systems.
- **CSS** - Application styling that loogs good on different screen sizes, and will morph such that all menue items are accessible across all devices, uses good whitespace, color choice and contrast.
- **React** - Provides login, Prompt and story display, liking and following of prompts and stories, comments, and use of React for routing and components.
- **Service** - Backend servicce with endpoints for:
  - Login
  - retrive user stories and prompts
  - submitting prompts and stories
  - PurgoMalum third-party for prophanity filter
- **DB/Login** - Store users, prompts, stories, comments, likes, and follows in database. Register and login users. Credentials securly stored in database. Can't submit stories or prompts, like, comment, or follow unless authenticated. 
- **WebSocket** - As a story is branched or added to, or created, Notify users following the story or user, as well as displaying stories, prompts, and all other data to be read, also will render follower count on account page.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Server deployed and accessible with custom domain name** - [My server link](https://projectyggdrasil.click).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **HTML pages** - Create pages for the main page, worldbuilding, stories, characters, login, etc.
- [x] **Proper HTML element usage** - Using divs headder etc. appropriatly to format pages, and to store text.
- [x] **Links** - Link between pages and page groups, make use of sub-pages under the main set such as under worldbuilding put magic systsems
- [x] **Text** - About page, sections and other examples and descripter sections
- [x] **3rd party API placeholder** - Put a placeholder toggle for profanity filter under settings
- [x] **Images** - add logo image, and create webpage main image
- [x] **Login placeholder** - On the login page put a placeholder for the login stuff, as well as a placeholder for the create account.
- [x] **DB data placeholder** - Example pages and data for the database, as well as a way to put the text into a form to post. input and submission box for the various post types, each in a class on the pages they are supposed to be on, will be a popup later, also may have more fields, temporary text, need more time to prepare lore and stories
- [x] **WebSocket placeholder** - New stories section on home page, reacently updated section as well.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Header, footer, and main content body** - implement dark and light mode, and stuff, make everything in flex boxes. using a common css `main.css`. use other css files for specifics such as `login.css` and `worldbuilding.css`
- [x] **Navigation elements** - redo Nav bar using bootstrap navbar
- [x] **Responsive to window resizing** - use bootstrap, `display:flex` to make cards and stuff to ensure that elements are properly sized, and adapt to display, make navbar become a menue button that expans a navbar for smaller screens
- [x] **Application elements** - use bootstrap to make cards, and buttons for my forms. use `display: flex` to arange suff, also move the create stuff forms into offcanvas popups. Remove the In page creation buttons, you will add your contentents discription through edditing the continent data on the world Page, when I get around to that sometime during either reactivity or DB Note that the actual pages for the database are unfinished, and won't be until the React Routing portion. Because I'm going to have to combine things into single files anyways
- [x] **Application text content** - change the font to something nice
- [x] **Application images** - make images respond to the preferences

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Bundled using Vite** - Install bundal and add the node moduels to  gitignor. and other things
- [X] **Components** - Componenttize everything, 2 variants of the navbar thing, one for WorldBuilding, the other for the rest, make the wiki like pages look better, and make them individual files, use .json files for the data of each Wiki-Like Page! Find a way to dynamicaly add additional cards hopefully, if not do that in Reactivity. Prepare for the Jsonification next time. by creating pages that look right but may not have all the proper info or nav elements, in the case of dynamic nav elements. Probably could have made only one example page, and use pure dynamic content for formatting and stuff, might explore doing that next time, just need some examples
- [X] **Router** - Routing between login and other components

## 🚀 React part 2: Reactivity

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **All functionality implemented or mocked out** - , mock out bio page creation, as well as story and chapter creation, writing advice and writing prompt submission. Implement must be logged in to submit stories, and change settings. Implement .json file readings, and hopefully filter, try and implement search.
- [X] **Hooks** - Implement json file reading, already implemented the offcanvas buttons, which use useState, also add generators for data

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Node.js/Express HTTP service** -  Installed Express with NPM. Default port on 4000.js`.
- [X] **Static middleware for frontend** - Simple endpoints in `service/index`.
- [X] **Calls to third party endpoints** - Bio, Story, Chapter, home, user, and category pages call `https://www.purgomalum.com/service/`, passing in the text or json, to filter the display, assuming that the current user's profanityFilter tag is not false, the calls can be found in `utility.js`
- [X] **Backend service endpoints** - Simple endpoints in `service/index` for auth and users, as well as the lists for characters, stories, writing prompts, writing advice, and world building elements.
- [X] **Frontend calls service endpoints** - All mocked functionality removed from the frontend and replaced with calls to the service.
- [X] **Supports registration, login, logout, and restricted endpoint** - Fully support authentication and restrict access to settings, as well as restricting access to editing.

## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
