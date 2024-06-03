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
  response.send(result1)
})

app.get('/todos/:todoId/', async (request, response) => {
  const parameter2 = request.params
  const {todoId} = parameter2
  const dbquery2 = `select * from todo where id="${todoId}";`
  const result2 = await db.get(dbquery2)
  response.send(result2)
})

app.post('/todos/', async (request, response) => {
  const body3 = request.body
  const {id, todo, priority, status} = body3
  const dbquery3 = `insert into todo(id,todo,priority,status)
  values(
    ${id},
    "${todo}",
    "${priority}",
    "${status}"
  );`
  const result3 = await db.run(dbquery3)
  response.send(`Todo Successfully Added`)
})

app.put('/todos/:todoId/', async (request, response) => {
  const parameter4 = request.params
  const {todoId} = parameter4
  let change = ''
  const body4 = request.body
  switch (true) {
    case body4.status !== undefined:
      change = 'Status'
      break

    case body4.priority !== undefined:
      change = 'Priority'
      break

    case body4.todo !== undefined:
      change = 'Todo'
      break
  }
  const dbselect4 = `select * from todo where id="${todoId}";`
  const resultselect4 = await db.get(dbselect4)
  const {
    todo = resultselect4.todo,
    priority = resultselect4.priority,
    status = resultselect4.status,
  } = body4
  const dbquery4 = `update todo set todo="${todo}",priority="${priority}",status="${status}" where id="${todoId}";`
  response.send(`${change} Updated`)
})
app.delete('/todos/:todoId/', async (request, response) => {
  const parameter5 = request.params
  const {todoId} = parameter5
  const dbquery5 = `delete from todo where id="${todoId}";`
  const result5 = await db.run(dbquery5)
  response.send(`Todo Deleted`)
})

module.exports = app
