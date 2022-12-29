
const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const fs = require('fs');

const configFile = fs.readFileSync("./config.json");
const config = JSON.parse(configFile);
const port = config.port;
const hostName = config.hostname;

const configuration = new Configuration({
    organization: config.openai_org,
    apiKey: config.openai_api_key,
});

const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
    console.log(`App listening at http://${hostName}:${port}`)
});

// get list of models (AI engines)
app.get('/models', async (req, res) => {
    const response = await openai.listModels();
    res.json(response.data)
});

// post to the OpenAI API a completion request
app.post('/', async (req, res) => {
    const {message, currentModel} = req.body;
    const response = await openai.createCompletion({
        model: `${currentModel}`,
        prompt: `${message}`,
        max_tokens: 100,        //max(2048), newer models can go up to (4096)
        temperature: 0,         //0 (well defined) to .9 (creative)
        top_p: 1,               //0.1 (10%) to 1 (100%)
        n : 1,
        stream: false,
        logprobs: null,         //0 to 5 (max)
        suffix: null,
        echo: false,
        frequency_penalty: 0,   //-2 to 2
        presence_penalty: 0,    //-2 to 2
        best_of: 1,
        logit_bias: {},             
        stop: null,
        user: ""              
    });
    res.json({message: response.data.choices[0].text});
});

// post to the OpenAPI / DALL-E 2 create image request
app.post('/images', async (req, res) => {
    const { message } = req.body;
    const response = await openai.createImage({
        prompt: `${message}`,
        n: 1,
        size: "1024x1024",
    });
    image_url = response.data.data[0].url;
    res.json({url: image_url});
});


