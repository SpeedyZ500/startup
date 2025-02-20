import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Accordion from 'react-bootstrap/Accordion';
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";



import "../../biopage/biopage.css";

export function CharacterBio() {
    const { id } = useParams(); 

    const [character, setCharacter] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch(`/characters/${id}.json`)
        .then((res) => {
            if(!res.ok){
                throw new Error (`Character not found: ${id}`)
            }
            return res.json();

        })
        .then((data) => {
            setCharacter(data);
            setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    }, [id]);
    if (loading) return <main><p>Loading...</p></main>;
    if (error) return <main><p style={{color:"red"}}>{error}</p></main>
    return <main><p>deprecated</p></main>
}