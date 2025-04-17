import { NavLink } from 'react-router-dom';
import React, {Fragment, useMemo, useCallback, useEffect, useState, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import "../app.css"
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Select from 'react-select'
import { WebSocketFacade }  from './websocketfacade.js';


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
        
        return <span>{item.label}: {item.value}</span>
        
    }
}


function renderCard(cards){
    
    if(!cards){
        return null;
    }
    
    return (
        cards.map((card, index) => {
            console.log(JSON.stringify({card, index}))

            return(<Card key={index} style={{width:"18rem"}}>
                
                <Card.Body className="theme adaptive">
                     <p>{card.description || ""}</p>
                </Card.Body>
                

            </Card>)

        })
        
    );


}
export function CardsRenderer({cards}){
    //const currSort = useEffect(() => console.log(JSON.stringify(sort)), [sort]);
    
    
    
    const [profanity, setProfanity] = useState(true);
    const [cleanCards, setCleanCards] = useState(cards);

    const prevCards = useRef(cards);
    const prevProfanity = useRef(profanity);


    useEffect(() => {
        async function fetchProfanitySetting() {
            try {
                const res = await fetch('/api/user/me', { method: 'GET', credentials: 'include' });
                if (res.ok) {
                    const data = await res.json(); // Ensure it's parsed correctly
                    setProfanity(data.profanityFilter);
                } else {
                    setProfanity(true); // Default to true if response is not OK
                }
            } catch {
                setProfanity(true); // Also default to true on errors
            }
        }
    
        fetchProfanitySetting();
    }, []);

    useEffect(() => {
        if (prevCards.current === cards && prevProfanity.current === profanity) {
            return; // No changes, avoid unnecessary updates
        }
        prevProfanity.current = profanity;

        async function cleanData() {
            const cleaned = await filterProfanity(cards, profanity);
            setCleanCards(cleaned);
        }

        cleanData();
    }, [cards, profanity]);
      

    const renderCards = useMemo(() => renderCard(cards), [cards]);
    
    useEffect(() => {
        console.log("CardsRenderer re-rendered");
    }, [cards, renderCards]);
    return(
        <div className="card-columns my-container scrollable" data-bs-spy="scroll">
            {renderCards}
        </div>

    );
}

export const useWebSocketFacade = () => {
    const wsRef = useRef(null);

    useEffect(() => {
        // Initialize on mount
        wsRef.current = new WebSocketFacade();

        // Clean up on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.cleanup();
                wsRef.current = null;
            }
        };
    }, []);

    return wsRef.current;
};