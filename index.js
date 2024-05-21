const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
app.use(cors());
app.use(express.json());

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.error('Error: Missing OPENAI_API_KEY in .env file');
  process.exit(1); // Exit with error code 1
}

const googleApiKey = process.env.GOOGLE_API_KEY;
if (!googleApiKey) {
  console.error('Error: Missing GOOGLE_API_KEY in .env file');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: openaiApiKey
});
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


async function getGPTData(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error; // Re-throw for handling in the route handler
  }
}

async function getGeminiData(prompt) {
  try {
    const model = await genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

app.get('/', (req, res) => res.status(200).send("<h1>Working Nicely</h1>") );


app.post('/gpt', [
  body('prompt', 'No Prompt Given').isLength({ min: 3 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Return validation errors in a JSON format
  }
  const { prompt } = req.body;
  try {
    const result = await getGPTData(prompt);
    return res.status(200).send(result);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.post('/gemini', [
  body('prompt', 'No Prompt Given').isLength({ min: 3 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { prompt } = req.body;
  try {
    const result = await getGeminiData(prompt);
    return res.status(200).send(result);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server Started");
});