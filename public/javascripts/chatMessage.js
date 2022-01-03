//@ts-check

/**
 * The constructor for the chat Message object
 * @param sender the number of the player that sent the message
 * @param timeOfMessage the time (with minutes and hours) that the message was sent
 * @param message the content of the message itself
 * @returns an object containing all the three arguments
 */
function ChatMessage(sender, timeOfMessage, message) {
    if(sender !== 1 && sender !== 2) {
        throw new Error("Invalid player number");
    }
    return {
        sender,
        timeOfMessage,
        message
    }
}