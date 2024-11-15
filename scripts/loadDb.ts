import { DataAPIClient } from "@datastax/astra-db-ts";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import fs from "fs";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

// Environment variables
const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE });
const filepath = "app/assets/Mage-Knight-Board-Game-Ultimate-Edition-Rule-Book-September-2018.pdf";

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1024,
    chunkOverlap: 100
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleRequestWithRetry = async (chunk: string) => {
    while (true) {
        try {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small", // Ensure the model is correct
                input: chunk
            });
            return embedding.data[0].embedding;
        } catch (error) {
            if (error.status === 429) {
                console.error("Rate limit exceeded. Retrying...");
                const retryAfter = error.response?.headers['retry-after'] || 1; // Default to 1 second if no header
                await delay(retryAfter * 1000);
            } else {
                throw error;
            }
        }
    }
};

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1536,
                metric: similarityMetric
            }
        });
        console.log("Collection created:", res);
    } catch (error) {
        console.error("Error creating collection:", error.message);
    }
};

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION);

    try {
        // Check if file exists
        if (!fs.existsSync(filepath)) {
            throw new Error(`File not found at path: ${filepath}`);
        }

        // Load PDF using PDFLoader
        const loader = new PDFLoader(filepath);
        const docs = await loader.load();
        console.log("Loaded Documents:", docs);

        const chunks = (await Promise.all(
            docs.map(async doc => splitter.splitText(doc.pageContent))
        ))
            .flat() // Flatten the array of arrays
            .filter(chunk => chunk.trim().length > 0); // Remove empty chunks
        console.log(`Total chunks to be inserted: ${chunks.length}`);

        // Insert chunks into Astra DB
        for (const chunk of chunks) {
            try {
                const vector = await handleRequestWithRetry(chunk);
                const res = await collection.insertOne({
                    $vector: vector,
                    text: chunk
                });
                console.log("Inserted record:", res);
            } catch (insertError) {
                console.error(`Error inserting chunk: ${insertError.message}`);
            }
        }

        console.log("All chunks successfully inserted into Astra DB.");
    } catch (error) {
        console.error("Error loading sample data:", error.message);
    }
};

// Create collection and load sample data
createCollection().then(() => loadSampleData());
