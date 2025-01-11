require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cron = require('node-cron')
const https = require('https')
const cors = require('cors')
app.use(cors({ origin: '*' }))
const {Students} = require('./db/index.js');
const {pushStudents,createStudent, makeBatches} = require('./db/utils.js');
const Batch22 = require('./test22.json');
const Batch21 = require('./test21.json');
const dbURL = process.env.DB_URL // Use environment variable
mongoose
  .connect(dbURL)
  .then(() => console.log('Connected to MongoDB successfully'))
  .then(()=>{
    // pushStudents(Batch21)
    // .then(()=> pushStudents(Batch22))
    makeBatches().then(()=>{
      console.log('Batches created')
    });
  })
  .catch(err => console.error('Error connecting to MongoDB:', err))

  

// Endpoint to welcome users
app.get('/', (req, res) => {
  res.send('Welcome to Contest Info Server V2')
})




// pushStudents(Batch22);
// pushStudents(Batch21);

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`)
})
