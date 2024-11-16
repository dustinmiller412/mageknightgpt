"use client"

import Image from "next/image"
import logo from "./assets/Arcs-White.webp"
import { useChat } from "ai/react"
import { Message } from "ai"
import Bubble from "./components/Bubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";
import LoadingBubble from "./components/LoadingBubble";

const Home = () => {

    const handlePrompt = (promptText) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user",
        }
        append(msg);
    }

    const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat();
    const noMessages = !messages || messages.length === 0;

    return (
        <main>
            <Image src={logo} width="250" alt="Logo"/>
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            The ultimate rules guide to Arcs: Conflcit & Collapse in the Reach!
                            Ask ArcsGPT any question about how to play Arcs!
                        </p>
                        <br/>
                        <PromptSuggestionsRow onPromptClick={handlePrompt}/>
                    </>
                ) : (
                    <>
                        {/*map messages onto text bubbles*/}
                        {messages.map((message,index) => <Bubble key={`message-${index}`} message={message} />)}
                        {isLoading && <LoadingBubble/>}
                    </>
                )}
            </section>
            <form onSubmit={handleSubmit}>
                <input className="question-box" onChange={handleInputChange} value={input}
                       placeholder="Ask me something..."/>
                <input type="submit"/>
            </form>
        </main>
    )
}

export default Home