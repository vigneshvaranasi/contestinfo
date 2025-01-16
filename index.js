require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cron = require('node-cron')
const https = require('https')
const cors = require('cors')
app.use(cors())


const { Students } = require('./db/index.js');
const { pushStudents, createStudent, makeBatches } = require('./db/utils.js');
const Batch22 = require('./test22.json');
const Batch21 = require('./test21.json');
const dbURL = process.env.DB_URL // Use environment variable
mongoose
  .connect(dbURL)
  .then(() => console.log('Connected to MongoDB successfully'))
  .then(() => {

    // makeBatches().then(() => {
    //   console.log('Batches created')
    // });
    run();
  })
  .catch(err => console.error('Error connecting to MongoDB:', err))



function run() {
  // Endpoint to welcome users
  app.get('/', (req, res) => {
    res.send('Welcome to Contest Info Server V2')
  })

  const getBatchData = require('./APIs/v2/getBatchData.js')
  app.use('/v2/batch', getBatchData)

  const getStudentData = require('./APIs/v2/getStudentData.js')
  app.use('/v2/student', getStudentData)

  const getContestData = require('./APIs/v2/getContestData.js')
  app.use('/v2/contest', getContestData)

  // pushStudents(Batch22);
  // pushStudents(Batch21);

  const port = process.env.PORT || 4000
  app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`)
  })
}