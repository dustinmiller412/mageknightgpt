"use client"

import Image from "next/image"
import logo from "./assets/MageKnightLogo.png"
import { useChat } from "ai/react"
import { Message } from "ai"

const Home = () => {
    const noMessages = true;

    return (
        <main>
            <Image src={logo} width="250" alt="Logo" />
            <section>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            The ultimate rules guide to Mage Knight: Ultimate Edition!
                            Ask MageKnightGPT any question about how to play Mage Knight!
                        </p>
                        <br/>
                        {/*<PromptSuggestionRow/>*/}
                    </>
                ) : (
                    <></>
                )}
            </section>
        </main>
    )
}

export default Home