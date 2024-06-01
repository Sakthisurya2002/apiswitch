const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

let db = null

const dbpath = path.join(__dirname, 'todoApplication.db')

const intialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`server started`)
    })
  } catch (e) {
    console.log(`${e.message}`)
    process.exit(1)
  }
}
intialize()

const hasPriority = obj => {
  return obj.priority !== undefined
}

const hasStatus = obj => {
  return obj.status !== undefined
}

const hasPriorityAndStatus = obj => {
  return obj.priority !== undefined && obj.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let dbquery1 = ''
  const {search_q = '', priority, status} = request.query
  switch (true) {
    case hasPriorityAndStatus(request.query):
      dbquery1 = `select * from todo where todo like"%${search_q}%" and priority="${priority}" and status="${status}";`
      break

    case hasPriority(request.query):
      dbquery1 = `select * from todo where todo like"%${search_q}%" and priority="${priority}";`
      break

    case hasStatus(request.query):
      dbquery1 = `select * from todo where todo like"%${search_q}%" and status="${status}";`
      break

    default:
      dbquery1 = `select * from todo where todo like "%${search_q}%";`
  }
  const result1 = await db.all(dbquery1)
  console.log(result1)
  response.send(result1)
})
