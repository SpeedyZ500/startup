import React from 'react';
import { NavLink } from 'react-router-dom';

export function WorldBuilding() {
    return (
        <main className="worldbuilding">
            
            <div className="textbody">
                <h1 className="theme-h adaptive">World Building</h1>
                <aside>
                    World Building, an essential element of any story, this is where you will store all the Lore for your stories.
                    Having consistent Lore allows for better exploration of possiblities and consistent stories. 
                    <br />
                    <br />
                    <NavLink to="/worldbuilding/magicsystems">Magic Systems</NavLink>: How do people intereact with magic and stuff, this is also where SiFi technology should be found.
                    The reason SiFi technology should be placed under Magic Systems is because any significantly advanced technology is indistinguishable from magic.
                    <br />
                    <br />
                    <NavLink to="/worldbuilding/races">Races</NavLink>: This doesn't refer to skin color, it refers to Humans, Elves, Dwarvs, Orks and other fantasy races.
                    Here is where you will put all your custom races, their cultures, histories, and abilities, as well as other stuff like that.
                    <br />
                    <br />
                    <NavLink to="/worldbuilding/countries">Countries</NavLink>: The countries of your stories, contains information of what races are in them, their allies, their enimies.
                    It also contains information on their culture, history, religions, and the lands within them, and the common creatures within,
                    don't feel to be exaustive, you will be able to add to your own countries and stuff later.
                    <br />
                    <br /> 
                    <NavLink to="/worldbuilding/wildlife">Wildlife</NavLink>: This is all about the creatures, critters and monsters you create, their abilities and natrual habitats.
                    <br />
                    <br />
                    <NavLink to="/worldbuilding/flora">Flora</NavLink>: The plant-life you create, a description of what they look like, uses or effects, is it poisonous? Is it carnivorous?
                    Plant type monsters should be in this tab, because they aren't wildlife, they are plants, and therefor should be among their kind
                    note that you should feel free to make a Plant monster of some of your useful plants, because that would be something that could happen
                    if monster plants existed, because mimicry, whether it was the useful plant that mimics the monster plan, or the monster that mimics the useful
                    either would be accurate.
                    <br />
                    <br />
                    <NavLink to="/worldbuilding/worlds">Worlds</NavLink>: This is where you put your worlds, what races are their, which ones are native, 
                    which ones are worlds that had mass migration from another world due to <i>unfortunate</i> and <i>unforseen</i> circumstances.
                    Feel free to add biome info as well, and you don't need to fill it all out at the begining, you will be able to make edits later.
                    <br />
                    <br />
                    <NavLink to="/worldbuilding/organizations">Organizations</NavLink>: Here is where you will put the organizations you create. Why isn't it under worlds or countries? 
                    World Hopping is possible, even between branches of the same story, or even to another universe entirely. 
                    So your organizations doesn't have to remain on one world or one branch of the World Tree. Religions would be included in Organizations.
                    <br/>
                    <br/>
                    <NavLink to="/worldbuilding/biomes">Biomes</NavLink>:The Biomes you create, and they have the worlds and continents that this type of biome appears in.

                </aside>
            </div>
        </main>);
}