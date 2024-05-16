const OpenAI = require("openai");
const express=require('express');
const cors=require('cors');
require('dotenv').config();
const { body ,validationResult} = require('express-validator');
const app=express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function main(prompt) {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content;
}
app.post('/',[
    body('prompt', 'No Prompt Given').isLength({ min: 3 }),
  ],async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Sorry I cannot understand your question?");
    }
       const {prompt}=req.body;
       const result=await main(prompt);
       return res.status(200).send(result);
})

app.listen(process.env.PORT||3000,()=>{
console.log("Server Started");
});

