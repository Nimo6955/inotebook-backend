const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')
require('dotenv').config()

connectToMongo();
const app = express()
const port = 5000
console.log(process.env.frontEndApp);
app.use(cors({
  credentials: true,
  origin: process.env.frontEndApp
}))
app.use(express.json())

//Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

