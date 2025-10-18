import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import fs from 'fs';
import { Pinecone } from '@pinecone-database/pinecone';
import { chunkText, createEmbedding } from '../lib/embeddings';

async function ingestData() {
    console.log('starting data ingestion...\n');

    // initialize pinecone
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!
    });
    const index = pc.index('phil');

    // read philosophical texts
    const texts = {
        marcus: fs.readFileSync('./data/marcus_aurelius.txt', 'utf-8'),
        epictetus: fs.readFileSync('./data/epictetus.txt', 'utf-8'),
        seneca: fs.readFileSync('./data/seneca.txt', 'utf-8')
    };

    let totalChunks = 0;

    // process each philosopher's text 
    for (const [philosopher, text] of Object.entries(texts)) {
        console.log(`processing ${philosopher}...`);

        const chunks = chunkText(text, 500);
        console.log(`found ${chunks.length} chunks`);

        // upload in batches of 10 to avoid rate limits
        for (let i = 0; i < chunks.length; i++) {
            const embedding = await createEmbedding(chunks[i]);

            await index.upsert([{
                id: `${philosopher}-${i}`,
                values: embedding,
                metadata: {
                    text: chunks[i],
                    philosopher,
                    chunk: i
                }
            }]);

            // progress indicator
            if ((i + 1) % 10 == 0) {
                console.log(`${i + 1}/${chunks.length} chunks uploaded`);
            }

            // small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        totalChunks += chunks.length;
        console.log(`${philosopher} complete~\n`)
    }
    console.log(`Ingestion complete! Total chunks: ${totalChunks}`);
}

ingestData().catch(console.error);