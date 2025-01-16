# Project Yggdrasil
![PROJECT_YGGDRASIL] (ProjectYggdrasil.png)
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

- [ ] **HTML pages** - I did not complete this part of the deliverable.
- [ ] **Proper HTML element usage** - I did not complete this part of the deliverable.
- [ ] **Links** - I did not complete this part of the deliverable.
- [ ] **Text** - I did not complete this part of the deliverable.
- [ ] **3rd party API placeholder** - I did not complete this part of the deliverable.
- [ ] **Images** - I did not complete this part of the deliverable.
- [ ] **Login placeholder** - I did not complete this part of the deliverable.
- [ ] **DB data placeholder** - I did not complete this part of the deliverable.
- [ ] **WebSocket placeholder** - I did not complete this part of the deliverable.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Header, footer, and main content body** - I did not complete this part of the deliverable.
- [ ] **Navigation elements** - I did not complete this part of the deliverable.
- [ ] **Responsive to window resizing** - I did not complete this part of the deliverable.
- [ ] **Application elements** - I did not complete this part of the deliverable.
- [ ] **Application text content** - I did not complete this part of the deliverable.
- [ ] **Application images** - I did not complete this part of the deliverable.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Bundled using Vite** - I did not complete this part of the deliverable.
- [ ] **Components** - I did not complete this part of the deliverable.
- [ ] **Router** - Routing between login and voting components.

## 🚀 React part 2: Reactivity

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I did not complete this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.

## 🚀 DB/Login deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **User registration** - I did not complete this part of the deliverable.
- [ ] **User login and logout** - I did not complete this part of the deliverable.
- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Restricts functionality based on authentication** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
