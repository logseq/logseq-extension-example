console.log("Hello world from extension!")

/**
 * Finds an entry from WikiData.
 * @param {string} name name of the page to look up for
 */
const findWikidataEntry = async (name) => {
    return new Promise((resolve, reject) => {
        let encodedName = encodeURIComponent(name)
        fetch('https://www.wikidata.org/w/api.php?action=wbsearchentities&search='+encodedName+'&language=en&format=json&origin=*')
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                resolve(json.search[0])
            });
    });
}

const getWikipediaIntro = async (name) => {
    return new Promise((resolve, reject) => {
        let encodedName = encodeURIComponent(name)
        fetch('https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&format=json&exsentences=2&origin=*&titles=' + encodedName)
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                resolve(Object.values(json.query.pages)[0].extract)
            });
    });
}

var pageName = "";

onmessage = (msg) => {
    const channel = msg.data[0];
    const message = msg.data[1];
    if (channel === "events" && message["eventName"] === "events/ui/view/on-page-open") {
        console.log("Page opened: " + message.context.entity.name);
        pageName = message.context.entity.name;
        findWikidataEntry(message.context.entity.name).then(entity => {
            postMessage(["actions", {
                actionName: "actions/ui/notification/show", 
                arguments: {
                    content: {
                        string: '[:div "There is a WikiData entry for this page: '+entity.label+' ('+entity.description+')" [:br] [:a {:href "'+entity.concepturi+'"} "Go to WikiData"]]',
                        type: "hiccup"
                    }, 
                    status: "success"
                }
            }])
        })
    }
    if (channel === "events" && message["eventName"] === "events/ui/view/on-block-context-menu-clicked") {
        console.log(pageName)
        getWikipediaIntro(pageName).then(intro => {console.log(intro); postMessage(["actions", {
            actionName: "actions/ui/block/overwrite-block-content", 
            arguments: {
                content: intro,
                id: message.context.id
            }
        }])})
    }
}