import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Accordion from 'react-bootstrap/Accordion';
import "../../worldbuilding.css";


import "../../../biopage/biopage.css";
export function FloraBio() {
    return (
    <main className="bio worldbuilding">
        <Table className="infocard adaptive">
            <thead>
                <tr>
                    <th colSpan={2}>Flora Name Here</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colSpan={2} style={{padding: 0, margin: 0}}>
                        <Table width="100%">
                            <thead>
                                <tr>
                                    <th colSpan={2}>Worlds</th>
                                </tr>
                                    
                                
                            </thead>
                            <tbody>
                                <tr>
                                    <th>Home World</th>
                                    <td>List of home world(s) because convergent evolution?</td>
                                </tr>
                                <tr>
                                    <th>Worlds Found</th>
                                    <td>List of worlds they appear on because invasive or introduced to.</td>
                                </tr>
                            </tbody>
                            
                            {/* Put a list of relatives here, will be stored in an json array of relation objects with json arrays, with names and links, each relation object will have the relationship type  */}
                        </Table>
                        
                    </td>
                </tr>
                <tr>
                    <th>Classification</th>
                    <td>Monster/Tree/Herbe</td>
                </tr>
                <tr>
                    <th>Biomes</th>
                    <td>List of biomes it is found in</td>
                </tr>
                
                <tr>
                    <th>Abilities/uses</th>
                    <td>abilities list this is probably going to be dynamic</td>
                </tr>
                
                <tr>
                    <td colSpan={2}>
                        Other Dynamic Content dynamicaly displayed, some may not exist in the current version of the site 
                        but may exist in the future, such as home towns, religious beliefs, introduced, profession, etc. 
                    </td>
                </tr>
            </tbody>
        </Table>
        <div id="shortDescription">
            <h2> Description</h2>
            <p>
                Short summary of the Flora here, with their, appearance etc.
            </p>
        </div>
        <Accordion width="50%" className="internal-nav">
            <Accordion.Item>
                <Accordion.Header>Nav</Accordion.Header>
                <Accordion.Body>
                    <nav>
                        <menu className="internal-menu">
                            <a href="#longDescription">Description</a>
                            <a href="#abilities">Abilities</a>


                        </menu>
                    </nav>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
        <div >
            <h2 id="longDescription" className="theme-h adaptive">Description</h2>
            <p>
            Lorem ipsum odor amet, consectetuer adipiscing elit. Aeros augue commodo hac interdum. Mus gravida non etiam dapibus venenatis. Ut imperdiet curabitur volutpat lobortis aptent cras. Vehicula suspendisse nostra arcu tristique urna congue sit. Semper nunc eu cubilia ultricies aptent. Congue massa proin elit, dis elit cubilia diam convallis.

Condimentum nibh odio nullam magna proin adipiscing maximus inceptos malesuada. Euismod hac etiam erat; litora tellus ridiculus. Placerat penatibus massa dui augue eu. Tempus quis facilisis eget ex quam sit consequat tellus. Sapien nunc quisque a feugiat eros porttitor diam. Etiam ante fermentum semper pharetra; fusce lobortis eget augue. Maximus erat tortor diam luctus sodales semper nec.

Imperdiet nibh ad quisque sociosqu torquent lacinia montes. Pellentesque justo elit tristique, vehicula nisl vestibulum aenean. Posuere curabitur magnis curae, magna quis dignissim risus. Duis torquent proin volutpat nisi ultricies mi accumsan auctor ultrices. Euismod risus quam sapien morbi lacus sed netus hendrerit mauris. Fusce luctus posuere dictum pharetra tempus vehicula. Sagittis tempus praesent egestas laoreet elit penatibus commodo massa. Vulputate tempor sapien aliquam facilisis nibh lobortis. Neque id semper a suspendisse placerat sem faucibus aliquam. Potenti posuere leo laoreet lacus rhoncus vitae sollicitudin potenti.

Fermentum interdum aptent pharetra sapien sit massa. Porttitor himenaeos magnis nisl cubilia potenti lobortis id risus efficitur. Fames venenatis id non a, semper dictum parturient. Efficitur dolor curabitur facilisi morbi, pretium habitant. Viverra facilisi penatibus suscipit; dictumst pulvinar ridiculus aenean. Dui dictum ligula vivamus phasellus viverra hendrerit tellus ac potenti. Faucibus per facilisis curabitur; ad vivamus hendrerit nam.

Dolor conubia dictumst venenatis taciti cursus. Ex natoque maecenas; class egestas mattis scelerisque ante. Quis quis mauris at himenaeos in dictum conubia conubia. Ligula fringilla neque quisque; justo lacus taciti elit. Non aliquam class varius; nisi nunc quam. Ad porttitor donec ad dolor taciti leo. Eget ornare arcu scelerisque elit etiam iaculis senectus ipsum. Dictum imperdiet felis orci maximus velit aliquam nam congue.

Sollicitudin potenti pulvinar sagittis at vel. Ante molestie hendrerit turpis cras elit imperdiet consectetur sit duis. Eget nunc massa ultricies turpis iaculis ad primis. Lobortis nunc elementum dictum per id, consequat lorem per. Aptent arcu per rhoncus parturient pharetra ullamcorper class dapibus. Etiam scelerisque diam conubia nulla; netus dapibus rutrum. Himenaeos senectus aenean ridiculus faucibus laoreet.

Luctus elit lectus mi nam tincidunt tristique. Parturient ullamcorper montes imperdiet dui enim. Sociosqu consequat iaculis nisi; ex tristique tincidunt ligula. Volutpat ut amet feugiat gravida rhoncus magnis. Nibh finibus magna ipsum tortor odio porta. Sit sem blandit euismod, vulputate placerat arcu in massa. Facilisis duis integer praesent a commodo consectetur magnis.

Natoque velit pellentesque volutpat amet viverra aliquam congue feugiat pellentesque. Nascetur inceptos vulputate tempus suspendisse diam; urna aenean. Ex ipsum porttitor quis netus rhoncus volutpat. Erat euismod nullam curabitur ridiculus egestas class euismod adipiscing vivamus. Facilisis rhoncus erat lobortis a nisl. Sagittis odio elementum porta est; commodo velit penatibus. Pulvinar maecenas primis arcu laoreet tincidunt phasellus maecenas.

In curae egestas cras; amet ligula laoreet metus egestas. Natoque dictum luctus venenatis aliquam vestibulum. Donec torquent varius porta, interdum proin dis primis porta. Scelerisque donec consectetur; felis tempus senectus ut. Integer ac felis aenean, tortor ornare felis varius. Pellentesque vel accumsan, at ac eget tortor. Fames turpis nascetur eros fringilla aliquam, penatibus rhoncus himenaeos suspendisse. Aenean donec habitasse condimentum dui maximus. Pulvinar sodales tempor; integer congue curae ultrices. Mattis ut neque duis, rutrum inceptos eleifend ante.

Maecenas egestas habitasse fames condimentum quis aliquet odio. Egestas felis vitae placerat dictum dignissim et fames scelerisque. Nascetur cursus vulputate tellus platea praesent urna. Adipiscing condimentum lacus maecenas lacus habitasse quis ex! Metus augue rhoncus mauris luctus et blandit. Porttitor dictum mauris blandit vehicula dapibus. Metus sodales gravida vulputate commodo porttitor.
            </p>
        </div>
        <div >
            <h2 id="abilities" className="theme-h adaptive">Abilities</h2>
            <p>
            Lorem ipsum odor amet, consectetuer adipiscing elit. Aeros augue commodo hac interdum. Mus gravida non etiam dapibus venenatis. Ut imperdiet curabitur volutpat lobortis aptent cras. Vehicula suspendisse nostra arcu tristique urna congue sit. Semper nunc eu cubilia ultricies aptent. Congue massa proin elit, dis elit cubilia diam convallis.

Condimentum nibh odio nullam magna proin adipiscing maximus inceptos malesuada. Euismod hac etiam erat; litora tellus ridiculus. Placerat penatibus massa dui augue eu. Tempus quis facilisis eget ex quam sit consequat tellus. Sapien nunc quisque a feugiat eros porttitor diam. Etiam ante fermentum semper pharetra; fusce lobortis eget augue. Maximus erat tortor diam luctus sodales semper nec.

Imperdiet nibh ad quisque sociosqu torquent lacinia montes. Pellentesque justo elit tristique, vehicula nisl vestibulum aenean. Posuere curabitur magnis curae, magna quis dignissim risus. Duis torquent proin volutpat nisi ultricies mi accumsan auctor ultrices. Euismod risus quam sapien morbi lacus sed netus hendrerit mauris. Fusce luctus posuere dictum pharetra tempus vehicula. Sagittis tempus praesent egestas laoreet elit penatibus commodo massa. Vulputate tempor sapien aliquam facilisis nibh lobortis. Neque id semper a suspendisse placerat sem faucibus aliquam. Potenti posuere leo laoreet lacus rhoncus vitae sollicitudin potenti.

Fermentum interdum aptent pharetra sapien sit massa. Porttitor himenaeos magnis nisl cubilia potenti lobortis id risus efficitur. Fames venenatis id non a, semper dictum parturient. Efficitur dolor curabitur facilisi morbi, pretium habitant. Viverra facilisi penatibus suscipit; dictumst pulvinar ridiculus aenean. Dui dictum ligula vivamus phasellus viverra hendrerit tellus ac potenti. Faucibus per facilisis curabitur; ad vivamus hendrerit nam.

Dolor conubia dictumst venenatis taciti cursus. Ex natoque maecenas; class egestas mattis scelerisque ante. Quis quis mauris at himenaeos in dictum conubia conubia. Ligula fringilla neque quisque; justo lacus taciti elit. Non aliquam class varius; nisi nunc quam. Ad porttitor donec ad dolor taciti leo. Eget ornare arcu scelerisque elit etiam iaculis senectus ipsum. Dictum imperdiet felis orci maximus velit aliquam nam congue.

Sollicitudin potenti pulvinar sagittis at vel. Ante molestie hendrerit turpis cras elit imperdiet consectetur sit duis. Eget nunc massa ultricies turpis iaculis ad primis. Lobortis nunc elementum dictum per id, consequat lorem per. Aptent arcu per rhoncus parturient pharetra ullamcorper class dapibus. Etiam scelerisque diam conubia nulla; netus dapibus rutrum. Himenaeos senectus aenean ridiculus faucibus laoreet.

Luctus elit lectus mi nam tincidunt tristique. Parturient ullamcorper montes imperdiet dui enim. Sociosqu consequat iaculis nisi; ex tristique tincidunt ligula. Volutpat ut amet feugiat gravida rhoncus magnis. Nibh finibus magna ipsum tortor odio porta. Sit sem blandit euismod, vulputate placerat arcu in massa. Facilisis duis integer praesent a commodo consectetur magnis.

Natoque velit pellentesque volutpat amet viverra aliquam congue feugiat pellentesque. Nascetur inceptos vulputate tempus suspendisse diam; urna aenean. Ex ipsum porttitor quis netus rhoncus volutpat. Erat euismod nullam curabitur ridiculus egestas class euismod adipiscing vivamus. Facilisis rhoncus erat lobortis a nisl. Sagittis odio elementum porta est; commodo velit penatibus. Pulvinar maecenas primis arcu laoreet tincidunt phasellus maecenas.

In curae egestas cras; amet ligula laoreet metus egestas. Natoque dictum luctus venenatis aliquam vestibulum. Donec torquent varius porta, interdum proin dis primis porta. Scelerisque donec consectetur; felis tempus senectus ut. Integer ac felis aenean, tortor ornare felis varius. Pellentesque vel accumsan, at ac eget tortor. Fames turpis nascetur eros fringilla aliquam, penatibus rhoncus himenaeos suspendisse. Aenean donec habitasse condimentum dui maximus. Pulvinar sodales tempor; integer congue curae ultrices. Mattis ut neque duis, rutrum inceptos eleifend ante.

Maecenas egestas habitasse fames condimentum quis aliquet odio. Egestas felis vitae placerat dictum dignissim et fames scelerisque. Nascetur cursus vulputate tellus platea praesent urna. Adipiscing condimentum lacus maecenas lacus habitasse quis ex! Metus augue rhoncus mauris luctus et blandit. Porttitor dictum mauris blandit vehicula dapibus. Metus sodales gravida vulputate commodo porttitor.
            </p>
        </div>
    </main>);
}