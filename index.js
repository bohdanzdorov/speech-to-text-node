const textToSpeech = require("@google-cloud/text-to-speech")

require("dotenv").config()

const fs = require("fs")
const util = require("util")
const ms = require("mediaserver")

const client = new textToSpeech.TextToSpeechClient()
const PORT = process.env.PORT || 3000;

const express = require("express");
 
const app = express();
const cors = require("cors")
app.use(cors())


app.use(express.json());

app.post("/synthesis", (req,res)=>{
    const {text} = req.body

    convertTextToMp3(text).then(()=>{
        res.send({text});
    })  
});

app.get('/audio', function(req, res){
    console.log("loaded")

    filePath = './output.mp3',
    stat = fs.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    // We replaced all the event handlers with a simple call to util.pump()
    fs.createReadStream(filePath).pipe(res);

});

async function convertTextToMp3(text) {
    console.log("started")
    const request = {
        input: { text: text },
        voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
        audioConfig: { audioEncoding: "MP3" }
    }

    const [response] = await client.synthesizeSpeech(request)

    const writeFile = util.promisify(fs.writeFile)

    await writeFile("output.mp3", response.audioContent, "binary")
    
}

app.listen(PORT, ()=> { 
    console.log("Server started on Port : " + PORT); 
});


