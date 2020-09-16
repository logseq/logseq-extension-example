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

logseq.events.addEventListener("events/ui/view/on-page-open", async (context) => {
    console.log("Page opened: " + context.entity.name);
    pageName = context.entity.name;
    let entity = await findWikidataEntry(context.entity.name)
    let content = {
        string: '[:div "There is a WikiData entry for this page: '+entity.label+' ('+entity.description+')" [:br] [:a {:href "'+entity.concepturi+'"} "Go to WikiData"]]',
        type: "hiccup"
    }
    logseq.actions.ui.showNotification(content, "success")
})

logseq.events.addEventListener("events/ui/view/on-block-context-menu-clicked", async (context) => {
    let intro = await getWikipediaIntro(pageName)
    console.log(intro)
    logseq.actions.ui.overwriteBlockContent(context.id, intro)
})