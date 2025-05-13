import { NavLink, useLocation } from 'react-router-dom';
import React, {Fragment, useMemo, useEffect, useState, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import "../app.css"
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { WebSocketFacade }  from './websocketfacade.js';


import { filterProfanity
}  from './utility.js';

export function HardRedirect({ to }){
    const location = useLocation();
    useEffect(() => {
        if(to){
            window.location.href = to;
        }
        else if(location){
            window.location.href = location.pathname + location.search + location.hash;
        }
    }, [to, location]);
    return null;
}
function renderItem(item, cardId){
    // console.log(JSON.stringify(item))

    if(Array.isArray(item.value)){
        return(
            <OverlayTrigger 
                trigger="click"
                key={`${item.label}-${cardId}`} 
                placement="bottom"
                overlay={
                    <Popover id={`popover-${cardId}-${item.label}`}>
                        <Popover.Header as="h4">{item.label}: </Popover.Header>
                        <Popover.Body>
                                {item.value.map((detail, subIndex) => (
                                    <Fragment key={subIndex}>
                                        {typeof detail == "object" ? (
                                            item.url ? (
                                                <NavLink to={detail.url}>{detail.value}</NavLink>
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

    else if(item.url){

        if(item.label){
            return<p key={`${item.value}-${cardId}`} >
                {item.label}: <NavLink to={item.url}>{item.value}</NavLink>
            </p>;
        }
        else{
            return <NavLink key={`${item.value}-${cardId}`} to={item.url}>{item.value}</NavLink>;
        }
    }
    else{
        return <p key={`${item.value}-${cardId}`} >{item.label && `${item.label}: `}{item.value}</p>
    }
}


function renderSection(card, cardId, formatting) {
    return Object.entries(formatting).map(([key, config], i) => {
        const data = card[key];
        if (!data) return null;

        // Handle basic string label config
        if (typeof config !== "object") {
            if(!Array.isArray(data) && typeof data === "object"){
                return renderItem({ 
                    label: config, 
                    value: data.name || data.title || data.value ||  data.toString(),
                    url: data.url
                  }, cardId);
            }
            else{
                return renderItem({ label: config, value: data }, cardId);

            }
        }

        // Handle full config object
        const item = {
            label: config.label,
            value: data,
        };
        

        if (!Array.isArray(data) && typeof data === "object") {
            item.url = data.url
            item.value = data.name || data.title || data.value || data.toString();
        }
        if(config.url){
            item.url = card[config.url]
        }
        if(config.value){
            item.value = card[config.value]
        }

        return renderItem(item, cardId);
    });
}

function renderCard(cards, formatting){
    
    if(!cards){
        return null;
    }
    
    return (
        cards.map((card, index) => {
            return(<Card key={index} style={{width:"18rem"}}>
                {formatting.header && 
                    <Card.Header className="theme adaptive" key="head">
                        {renderSection(card, index, formatting.header)}
                    </Card.Header>
                }
                {formatting.body && 
                    <Card.Body className="theme adaptive" key="body">
                        {renderSection(card, index, formatting.body)}
                    </Card.Body>
                }
                {formatting.footer && 
                    <Card.Footer className="theme adaptive" key="footer">
                        {renderSection(card, index, formatting.footer)}
                    </Card.Footer>
                }
            </Card>)

        }) 
    );
}
export function CardsRenderer({cards, profanity=true, formatting={body:{name:{url:"url"}, title:{url:"url"}, displayname:""}}}){
    //const currSort = useEffect(() => console.log(JSON.stringify(sort)), [sort]);
    
    
    
    const [cleanCards, setCleanCards] = useState(cards);

    const prevCards = useRef(cards);
    const prevProfanity = useRef(profanity);


   

    useEffect(() => {

        //console.log(JSON.stringify(cards))
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
      

    const renderCards = useMemo(() => renderCard(cleanCards, formatting), [cleanCards, formatting]);
    
    return(
        <div className="card-columns my-container scrollable" data-bs-spy="scroll">
            {renderCards}
        </div>

    );
}

export const useWebSocketFacade = () => {
    const [instance] = useState(() => new WebSocketFacade()); // ✅ Create once
    const wsRef = useRef(instance);

    useEffect(() => {
        return () => {
            // 🧹 Clean up only when the component fully unmounts
            wsRef.current?.cleanup?.();
        };
    }, []);

    return wsRef.current;
};
