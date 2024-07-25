const express = require('express');
const path = require('path')
const bodyParser = require('body-parser')
const {manipulateDB} = require('./db_access')

const app = express();
const port = 3004;
app.use('/',express.static(path.join(__dirname, '/public')));
app.use(express.json({})) // bodyParser({extended: true})


app.post('/data', async (req,res)=>{
    console.log(req.body);
    let success = false;
    try {
        await manipulateDB(req.body)
        success = true;
    } catch (error) {
        success = false;
        console.log(error);
    }
    if(success) { 
        return res.status(201).json({});
    }
    return res.status(400).end();
    
})


app.get('/data', async (req,res)=>{
    console.log(req.body);
    let success = false;
    let result = {};
    try {
        result = await manipulateDB({command: 'retrieve', data: {}, table: ''})
        success = true;
    } catch (error) {
        success = false;
        console.log(error);
    }
    if(success) { 
        return res.status(200).json(result);
    }
    return res.status(400).end();
    
})

app.listen(port, ()=>{
    console.log('App running at http://localhost:'+port);
})
