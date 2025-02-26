
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

function fetchAdvice(){
    return fetchJSONByPath("/data/advice.json");
}

function fetchPrompts(){
    return fetchJSONByPath("/data/prompts.json");
}

function fetchStoriesList(){
    return fetchJSONByPath("/data/stories/list.json");
}


function fetchListByPath(path){
    try{
        return fetchJSONByPath(`${path}/list.json`);
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
    return list.filter(item => 
        filters.every(filter =>
            item.details.some(detail =>
                detail.label === filter.attribute &&
                (Array.isArray(detail.value)
                    ? detail.value.some(v => filter.value.includes(v))
                    : filter.value.includes(detail.value)
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
            
        }
        else if (!this.values.includes(value)){
            this.values.push(values)
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
    return [...list].sort((a, b) => {
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

export {
    sortList,
    filterAndSort,
    SortOptions,
    formatJSONDate,
    updateFilter,
    genFilter,
    filterItem,
    filterList,
    fetchChapter,
    fetchChapterList,
    fetchListByPath,
    fetchStoriesList,
    fetchPrompts,
    fetchAdvice,
    fetchJSONByPath,
    sanitizeId
};
