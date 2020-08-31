console.log("Hello world from extension!")

onmessage = (msg) => {
    const channel = msg.data[0];
    const message = msg.data[1];
    if (channel === "events" && message["event-name"] === "ui/page/on-page-open") {
        console.log("Page opened: " + message.context.entity.name)
    }
}