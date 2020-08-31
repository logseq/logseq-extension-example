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

onmessage = (msg) => {
    const channel = msg.data[0];
    const message = msg.data[1];
    if (channel === "events" && message["eventName"] === "ui/page/on-page-open") {
        console.log("Page opened: " + message.context.entity.name);
        findWikidataEntry(message.context.entity.name).then(entity => {
            postMessage(["actions", {
                actionName: "actions/ui/notification/show", 
                arguments: {
                    content: '[:div "There is a WikiData entry for this page: '+entity.label+' ('+entity.description+')" [:br] [:a {:href "'+entity.concepturi+'"} "Go to WikiData"]]', 
                    "parse-ui-injection": true,
                    status: "success"
                }
            }])
        })
    }
}