const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const pinoApp = require('express')()
const pino = require('pino-http')()

const prisma = new PrismaClient()

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(pino)

function queryParams(req, res, next) {
    if ( (isNaN(req.query.page) || req.query.page == "") || (isNaN(req.query.limit) || req.query.limit == "") ) {
        req.query.page = 1
        req.query.limit = 5
        return next()
    } 
    next()
}

function formValidation(req, res, next) {
    if (req.body.task.length === 0) {
        console.error('Filed must not be empty')
        return next()
    }
    if (req.body.task.length > 10) {
        console.error("Field must not exceed 10 character")
        return next()
    }
    next()
}

app.get('/', queryParams, async (req, res) => {
    console.log(req.body)
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit;
    const lastIndex = page * limit

    const result = {}
    
    const allTask = await prisma.task.findMany({
        skip: ( page - 1 ) * limit,
        take: limit,
        orderBy: [
            { id: 'desc' }
        ]
    })
    // Previous
    if (startIndex > 0) {
        result.previous = {
            page: page - 1,
            limit: limit
        }
    }
    // Next
    const totalTask = await prisma.task.count()
    if (lastIndex < totalTask) {
        result.next = {
            page: page + 1,
            limit: limit
        }
    }
    
    result.results = allTask
    res.status(200).send({ msg: 'Successfully Fetch Data', task: result })
})

app.post('/', formValidation, async (req, res) => {
    const { task } = req.body
    console.log(task)
    if (!task) return res.json({status: 406, error: 'Field must be filled!'})   
    if (task.length > 10) return res.json({status: 422, error: 'Field must not exceed 10 characters'})   
    const createTask = await prisma.task.create({
        data: {
            taskName: task,
            status: false
        }
    }) 

    res.status(200).send({msg: 'Task Created', createdTask: createTask})
})

app.patch('/:id', async (req, res) => {
    const { id, statusTask } = req.body

    const updateStatusTask = await prisma.task.update({
        where: { id: id },
        data: { status: statusTask },
      })

      res.status(200).send({msg: 'Status Updated', statusUpdate: updateStatusTask})
})

app.get('/:id', async (req, res) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).send({error: 'ID must be number'})
    

    const getTaskID = await prisma.task.findUnique({
        where: { id: id }
    })

    if (!getTaskID) return res.status(404).send({error: 'ID Not Found'})

    res.status(200).send({msg: 'ID Found', task: getTaskID})
})

app.put('/:id', formValidation, async (req, res) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).send({error: 'ID must be number'})
        
    const getTaskID = await prisma.task.findUnique({
        where: { id: id }
    })
    if (!getTaskID) return res.status(404).send({error: 'ID Not Found'})

    const { task } = req.body
    if(!task) return res.json({status: 406, error: 'Field must be filled!'})
    if (task.length > 10) return res.json({status: 422, error: 'Field must not exceed 10 characters'})   
    const updateTask = await prisma.task.update({ where: { id: id }, data: { taskName: task }})

    res.status(200).send({msg: 'ID Updated', task: updateTask})
})

app.delete('/:id', async (req, res) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).send({error: 'ID must be number'})
        
    const getTaskID = await prisma.task.findUnique({
        where: { id: id }
    })

    if (!getTaskID) return res.status(404).send({error: 'ID Not Found'})
    const deleteTask = await prisma.task.delete({
        where: {
            id: id,
        },
    })

    res.status(200).send({msg: 'ID Deleted', task: deleteTask})
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})