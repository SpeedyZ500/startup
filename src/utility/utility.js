
// Sanitizes the ids to make it so that it can be used for file paths and stuff

function sanitizeId(id){
    return id
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
}

async function fetchJSONByPath(path){
    try{
        const response = await fetch(path);
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);

        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Expected JSON but got ${contentType} page not found: ${path}`);
        }
        return await response.json();
    }
    catch (error){
        console.error("Error fetching JSON from path:", path, error);
        throw error;
    }
}



function fetchStoriesList(){
    return fetchJSONByPath("/data/stories/list.json");
}


async function fetchListByPath(path){
    try{
        return await fetchJSONByPath(`${path}/list.json`);
    }
    catch(error){
        throw new Error(`Unable to fetch list from: ${path}: ${error.message}`)
    }
}

function fetchChapterList(story, author){
    const serialized = serializedId(`${story}_${author}`);
    return fetchListByPath(`/data/stories/${serialized}`);
}

 function fetchChapter(story, storyAuthor, id, title){
    const serializedStory = serializedId(`${story}_${storyAuthor}`);
    const serializedChapter = serializedId(`${id}_${title}`);
    return fetchJSONByPath(`/data/stories/${serializedStory}/${serializedChapter}.json`);

}


async function loadBioDetail(path){
    try {
        return await fetchJSONByPath(path);
    } catch(error){
        console.error(`Unable to load bio details from ${path}: ${error.message}`);
        throw error;
    }
}


function filterList(list, filters){
    console.log(JSON.stringify(filters))
    return list.filter(item => 
        filters.every((filter) =>
            item.details.some((detail) =>
                detail.label === filter.attribute && detail.value !== undefined &&
                (Array.isArray(detail.value)
                    ? detail.value.some(v => filter.values.includes(v))
                    : filter.values.includes(detail.value)
                )
            )
        )
    )
}
class FilterOptions{
    constructor(attributeOrItems, value) {
        if(Array.isArray(attributeOrItems)){
            this.filters = attributeOrItems;
        } 
        else if (attributeOrItems instanceof FilterItem){
            this.filters = [attributeOrItems];
        }
        else if(attributeOrItems && value !== undefined){
            this.filters = [new FilterItem(attributeOrItems, value)];
        } 
        else{
            this.filters = [];
        }
    }
    addOption(attribute, value){
        const foundIndex = this.filters.findIndex(item => item.attribute === attribute);
        if(foundIndex !== -1){
            this.filters[foundIndex].addToFilter(value)
        }
        else{
            this.filters.push(new FilterItem(attribute, value))
        }

    }
    updateFilter(attribute, value){
        const foundIndex = this.filters.findIndex(item => item.attribute === attribute);
        if (foundIndex !== -1){
            if( !value || value.length === 0){
                this.filters.splice(foundIndex, 1);
            }
            else{
                this.filters[foundIndex].updateItem(value)
            }
        }
        else if (value.length > 0){
            this.filters.push(new FilterItem(attribute, value));
        }
    }
}
class FilterItem{
    constructor(attribute, value){
        this.attribute = attribute;
        this.values = Array.isArray(value)? value : [value];
    }
    updateItem(value){
        this.values = Array.isArray(value)? value : [value];
    }
    getAttribute(){
        return this.attribute;
    }
    getValues(){
        return this.values;
    }
    containsValue(value){
        return this.values.includes(value);
    }
    addToFilter(value){
        if(Array.isArray(value)){
            value.forEach((val) => {
                if(!this.values.includes(val)){
                    this.values.push(val);
                }
            })
        }
        else if (!this.values.includes(value)){
            this.values.push(value)
        }
        
    }
    

}
function filterItem(attribute, value){
    return {
        "attribute":attribute,
        value: Array.isArray(value)? value : [value]
    }
} 
function genFilter(attribute, value){
    return  [
        filterItem(attribute, value)
    ]
}

function updateFilter(filter, attribute, value){
    const foundIndex = filter.findIndex(item => item.attribute === attribute);
    if (foundIndex !== -1){
        if(value.length === 0){
            filter.splice(foundIndex, 1);
        }
        else{
            filter[foundIndex].value = value;
        }
    }
    else if (value.length > 0){
        filter.push(filterItem(attribute, value));
    }
    return filter
}

function sortList(list, sort){
    if(!Array.isArray(list)){
        return list;
    }
    return [...list].sort((a, b) => {
        if(!Array.isArray(a) || !Array.isArray(b)){
            return 0;
        }
        const valueA = a.details.find(detail => sanitizeId(detail.label) === sanitizeId(sort.category))?.value ?? 0;
        const valueB = b.details.find(detail => sanitizeId(detail.label) === sanitizeId(sort.category))?.value ?? 0;
        if(valueA > valueB){
            return sort.az ? 1 : -1;

        }
        else if (valueB < valueA){
            return sort.az ? -1 : 1;

        }
        return 0;
    });
}


function formatJSONDate(jsonString){
    const date = new Date(jsonString);
    return date.toLocaleDateString()
}
function formatDate(date){
    return date.toJSON();
}
function upDate(file){
    file.infoCard.modified = formatDate(new Date());
}
class SortOptions{
    constructor(category, az = true) {
        this.category = category;
        this.az = az;
    }
}

function filterAndSort(list, filter, sort){
    const filtered = filterList(list, filter);
    return sortList(filtered, sort)
}

export async function filterProfanity(json, profanityFilterEnabled){
    // Always seek out and replace author/label first, before filtering for profanity
    if (typeof json === "object") {
        const updatedJson = await replaceAuthor(json); // Replace author/label before profanity filtering
        if (profanityFilterEnabled === false) {
            return updatedJson;
        }
        
        // If profanity filtering is enabled, proceed to apply it
        return await applyProfanityToJson(updatedJson);
    }

    // If it's a simple string, apply profanity filter immediately
    if (typeof json === "string") {
        return applyProfFilter(json);
    }

    return json;
}

async function replaceAuthor(json) {
    // If the object contains label "Author" or "author", replace the value
    if ((json.hasOwnProperty("label") && (json.label === "Author" || json.label === "author")) || json.hasOwnProperty("author") || json.hasOwnProperty("Author")) {
        const username = json.value || json.author; // Assuming the username is stored in value or author
        const res = await fetch(`/api/user/any?username=${encodeURIComponent(username)}`, {
            method: `GET`,
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        json.value = data.displayname; // Replace the value with the display name

    }

    // If the JSON is an array or an object, recurse into it
    if (Array.isArray(json)) {
        await Promise.all(json.map(async (item, idx) => {
            json[idx] = await replaceAuthor(item); // Recurse into array items
        }));
    } else if (typeof json === 'object') {
        for (const key in json) {
            if (json.hasOwnProperty(key)) {
                json[key] = await replaceAuthor(json[key]); // Recurse into object keys
            }
        }
    }
    
    return json;
}

async function applyProfanityToJson(json) {
    // Clone the JSON to avoid modifying the original object
    const filteredJson = Array.isArray(json) ? [] : {};

    for (const key in json) {
        if (json.hasOwnProperty(key)) {
            if (typeof json[key] === 'string') {
                filteredJson[key] = await applyProfFilter(json[key]); // Apply profanity filter for strings
            } else if (Array.isArray(json[key]) || typeof json[key] === 'object') {
                filteredJson[key] = await applyProfanityToJson(json[key]); // Recurse for nested objects/arrays
            } else {
                filteredJson[key] = json[key]; // Keep other types as is
            }
        }
    }

    return filteredJson;
}



async function applyProfFilter(text){
    try {
        const response = await fetch(`https://www.purgomalum.com/service/plain?text=${encodeURIComponent(text)}`);
        const data = await response.text();
        return data; // Return the filtered text
    } catch (error) {
        console.error("Error filtering text:", error);
        return text; // In case of failure, return the original text
    }
}



export {
    sortList,
    filterAndSort,
    SortOptions,
    FilterOptions,
    FilterItem,
    formatJSONDate,
    updateFilter,
    genFilter,
    filterItem,
    filterList,
    fetchChapter,
    fetchChapterList,
    fetchListByPath,
    fetchStoriesList,
    fetchJSONByPath,
    sanitizeId
};
