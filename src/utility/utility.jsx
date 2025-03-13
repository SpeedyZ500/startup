import { NavLink } from 'react-router-dom';
import React, {Fragment, useMemo, useCallback, useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import "../app.css"
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Select from 'react-select'



import {
    sortList, filterAndSort,
    formatJSONDate, filterProfanity
}  from './utility.js';


function renderItem(item, cardId){
    if(item.display === false || item.hidden === true) return null;
    if(Array.isArray(item.value)){
        return(
            <OverlayTrigger 
                trigger="click"
                key={`${item.label}-${cardId}`} 
                placement="bottom"
                overlay={
                    <Popover id={`popover-${cardId}-${item.label}`}>
                        <Popover.Header as="h4">{item.label}:</Popover.Header>
                        <Popover.Body>
                            <Fragment>
                                {item.value.map((detail, subIndex) => (
                                    <Fragment key={subIndex}>
                                        {typeof detail == "object" && detail.label ? (
                                            item.path ? (
                                                <NavLink to={detail.path}>{detail.value}</NavLink>
                                            ) :(
                                                <span>{detail}</span>
                                            )
                                        ):(
                                            <span>{detail}</span>
                                        )}
                                        {subIndex < item.value.length - 1 && <span>, </span>}
                                    </Fragment>
                                ))}
                            </Fragment>
                        </Popover.Body>
                    </Popover>
                }
            >
                <Button variant="secondary">{item.label}</Button>
            </OverlayTrigger>
        )
    }
    
    else if(item.path){
        if(item.location !== "head"){
            return<p>{item.label}: <NavLink to={item.path}>{item.value}</NavLink></p>;
        }
        else{
            return <NavLink to={item.path}>{item.value}</NavLink>;
        }
    }
    else{
        if(item.label === "Author"){
            return  <AuthorDisplay item = {item}/>
        }
        else{
            return <span>{item.label}: {item.value}</span>
        }
    }
}
export function AuthorDisplay({ item }) {
    const [authorContent, setAuthorContent] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const fetchData = async () => {
            try {
                const content = await displayAuthor(item); // Get the content from the async function
                setAuthorContent(content); // Set content if found
            } catch (err) {
                setError('User not found or error occurred'); // Set error message
            } finally {
                setLoading(false); // Always stop loading after the async operation
            }
        };

        fetchData();
    }, [item]); // Run this effect whenever 'item' changes

    // Loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // Error state
    if (error) {
        return <div>{error}</div>; // Display error message if something went wrong
    }

    // Render author content if found
    return <div>{authorContent}</div>;
}



export async function displayAuthor(info){
    async function profanityFilter(){
        try{
            const res = await fetch('/api/user/prof', {
                method: 'GET',
            });
            return res.body.profanityFilter;
        }
        catch{
            return true
        }
    }
    const profanity = await profanityFilter();

    const filtercard = async (filter) => {
        return await filterProfanity(filter, profanity);
    }
    try{
        const res = await fetch('/api/user/any', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: info.value }) // Sending username in the request body
        });
        const data = await res.json();
        if(data.displayname){
            const filtered = await filtercard(data);

            return <span>{info.label}: {filtered.displayname}</span>;


        }
        else{
            const filtered = await filtercard(info);
            return <span>{info.label}: {filtered.value}</span>
        }
    }
    catch (error) {
        const filtered = await filtercard(info);
        return <span>{info.label}: {filtered.value}</span>;
    };
}

function renderCard(cards){
    async function profanityFilter(){
        try{
            const res = await fetch('/api/user/prof', {
                method: 'GET',
            });
            return res.body.profanityFilter;
        }
        catch{
            return true
        }
    }
    const profanity = profanityFilter();

    const filtercard = (filter) => {
        return filterProfanity(filter, profanity).then((filtered) => {
            return filtered;
        });
    }
   
    const filteredCards = filtercard(cards);



    
    return (
        cards.map((card, index) => {

            if(!Array.isArray(card.details)){
                return;
            }
            const headerData = card.details.filter(item => item.location === "head")
    
            const footerData = card.details.filter(item =>  item.location === "footer")
    
            const bodyData = card.details.filter(item => !item.location || item.location === "body")
            return(<Card key={index} style={{width:"18rem"}}>
                <Card.Header className="theme-c adaptive">
                    <Fragment>
                        {headerData.map((item, index) =>(
                            <Fragment key={index}>
                                {renderItem(item, card.id)}
                            </Fragment>
                        ))}
                    </Fragment>
                </Card.Header>
                <Card.Body className="theme adaptive">
                    <Fragment>
                        {bodyData.map((item, index) =>(
                            <Fragment key={index}>
                                {renderItem(item, card.id)}
                            </Fragment>
                        ))}
                    </Fragment>
                    {card.description && <p>{card.description}</p>}
                </Card.Body>
                <Card.Footer className="theme-c adaptive">
                    {footerData.map((item, index) =>(
                            <Fragment key={index}>
                                {renderItem(item, card.id)}
                            </Fragment>
                    ))}
                </Card.Footer>

            </Card>)

        })
        
    );


}
export function CardsRenderer({cards, filters, sort}){
    //const currSort = useEffect(() => console.log(JSON.stringify(sort)), [sort]);
    
    
    const filteredAndSorted = useMemo(() => filterAndSort(cards, filters, sort), [cards, filters, sort], );
    const renderCards = useMemo(() => renderCard(filteredAndSorted), [filteredAndSorted]);
    

    return(
        <div className="card-columns my-container scrollable" data-bs-spy="scroll">
            {renderCards}
        </div>

    );
}