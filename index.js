const express=require("express")
const axios = require('axios');
const cors=require("cors")
require('dotenv').config();

const OPENAI_API_KEY =process.env.API_KEY;


const app=express()
app.use(cors());
app.use(express.json());


app.post("/gen-quote", async (req, res) => {
  const { keyword } = req.body;
  try {
    const prompt = `Generate a quote about "${keyword}"`;
    console.log("Prompt:", prompt);

    // Retry logic for handling rate limits
    let retryCount = 0;
    let maxRetries = 3;
    let response;
//https://api.openai.com/v1/chat/completions
//https://api.openai.com/v1/engines/text-davinci-002/completions
    do {
      response = await axios.post('https://api.openai.com/v1/engines/text-davinci-002/completions', {
        prompt,
        max_tokens: 100,
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        // Rate limited, retry after a delay
        const retryAfter = response.headers['retry-after'] || 60; // You can adjust the delay as needed.
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      }
      retryCount++;
    } while (response.status === 429 && retryCount < maxRetries);

    if (response.status === 429) {
      res.status(503).json({ error: 'Rate limited. Please try again later.' });
    } else {
      const quote = response.data.choices[0].text;
//       const match = response.quote.match(/[^.!?]*[.!?]/);
// const quote = match ? match[0].trim() : response.quote;
      console.log("Generated Quote:", quote);
      res.status(200).send({ quote });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});









app.listen(8080,()=>{

    console.log("server is runnig");
})