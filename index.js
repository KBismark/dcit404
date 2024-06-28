const express = require('express');
const path = require('path')

const app = express();
const port = 3004;
app.use('/',express.static(path.join(__dirname, '/public')))

app.get('/',(req,res)=>{

})


app.listen(port, ()=>{
    console.log('App running at http://localhost:'+port);
})
