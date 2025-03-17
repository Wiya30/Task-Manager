const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    const page = parseInt(req.query.page)
    const limit = req.query.limit

    const startIndex = (page - 1) * limit;
    const lastIndex = page * limit

    const result = {}
    const allTask = await prisma.task.findMany({
        orderBy: [
            { id: 'desc' }
        ]
    })

    if (startIndex > 0) {
        result.previous = {
            page: page - 1,
            limit: limit
        }
    }

    if (lastIndex < allTask.length) {
        result.next = {
            page: page + 1,
            limit: limit
        }
    }

    result.results = allTask.slice(startIndex, lastIndex)

    res.status(200).send({ msg: 'Successfully Fetch Data', task: result })
})

app.post('/', async (req, res) => {
    const { task } = req.body
    if (!task) return res.json({status: 406, error: 'Field must be filled!'})    
    const createTask = await prisma.task.create({
        data: {
            taskName: task,
            status: false
        }
    }) 

    res.status(200).send({msg: 'Task Created', createdTask: createTask})
})

app.patch('/', async (req, res) => {
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

app.put('/:id', async (req, res) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).send({error: 'ID must be number'})
        
    const getTaskID = await prisma.task.findUnique({
        where: { id: id }
    })
    if (!getTaskID) return res.status(404).send({error: 'ID Not Found'})

    const { task } = req.body
    if(!task) return res.json({status: 406, error: 'Field must be filled!'})

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