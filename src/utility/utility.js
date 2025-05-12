
// Sanitizes the ids to make it so that it can be used for file paths and stuff
function sanitizeId(id){
    return id
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
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
            this.filters = {};
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

export async function filterProfanity(json, profanityFilterEnabled, isOptions=false){
    if(profanityFilterEnabled){
        if(!json){
            return
        }
        if(typeof json === "string"){
            return await applyProfFilter(json);
        }
        else if(Array.isArray(json)){
            return await Promise.all(
                json.map((item) => filterProfanity(item, profanityFilterEnabled))
            )
        }
        else{
            const updatedJson = {...json}
            const keys = Object.keys(json)
            for(const key of keys){
                if(["url", "id", "username", "qualifier", "width", "height", "type"].includes(key) || (isOptions && key === "value")){
                    updatedJson[key] = json[key]
                }
                else{
                    updatedJson[key] = await filterProfanity(json[key], profanityFilterEnabled)
                }
            }
            return updatedJson
        }
    }
    return json
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
    sanitizeId
};
