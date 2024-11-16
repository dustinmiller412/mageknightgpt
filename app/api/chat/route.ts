import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient} from "@datastax/astra-db-ts";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
    try {
        const {messages} = await req.json();
        const latestMessage = messages[messages?.length - 1]?.content;

        let docContext = "";

        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float"
        });

        try {
            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding.data[0].embedding,
                },
                limit: 10
            })

            const documents = await cursor.toArray();

            const docsMap = documents?.map(doc => doc.text);

            docContext = JSON.stringify(docsMap);

        } catch (error) {
            console.log("Error querying db...", error);
        }

        const template = {
            role: "system",
            content: `You are an AI assistant who is an expert in board games, specifically the board game Mage Knight.
            Use the below context to augment what you know about Mage Knight. The context will provide you with the rules
            for Mage Knight Ultimate Edition. If the context doesn't include the information you need answer based on your
            existing knowledge and don't mention the source of your information or what the context does or does not include.
            Format responses using markdown where applicable and don't return images.
            -------------------
            START CONTEXT
            ${docContext}
            END CONTEXT
            -------------------
            QUESTION: ${latestMessage}
            -------------------
            
            `
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            stream: true,
            messages: [template, ...messages]
        })

        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);

    } catch (error) {
        console.log("Error querying db...", error);
    }
}

