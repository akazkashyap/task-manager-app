//DataBase imports
require("../db/mongoose")
const Task = require("../db/models/tasks")

const auth = require("../middleware/auth")

const express = require("express")
const router = new express.Router()

// TASK Routes
router.post("/task", auth, async(req, res)=>{

    const task = new Task({
        ...req.body,
        owner:req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

//GET /task?completed=true
//Get /task?limit=1&skip=1
//GET /task?sortBy=createdAt:desc
router.get("/task", auth, async(req, res)=>{
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy){
        const part = req.query.sortBy.split(":")
        sort[part[0]] = part[1] === "desc" ? -1 : 1
    }

    try {
        await req.user.populate({
            path:"tasks",
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        if(!req.user.tasks.length){
            return res.status(404).send({Error : "Perhaps there is no task to show! :("})
        }
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.get("/task/:id", auth, async(req, res)=>{

    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner:req.user._id})
        if(!task){
            return res.status(404).send({Error:"Opps task doesn't exists in database."})
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.patch("/task/:id", auth, async(req, res)=>{
    const allowedFields = ["title", "completed"]
    const providedFields = Object.keys(req.body)
    const allowUpdate = providedFields.every((field)=>allowedFields.includes(field))
    
    if(!allowUpdate){
        return res.status(400).send()
    }
    try {
        const task = await Task.findOne({_id:req.params.id , owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        providedFields.forEach((update)=>task[update] = req.body[update])
        await task.save()
        
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})


router.delete("/task/:id", auth, async(req, res)=>{
    try {
        const deleted = await Task.deleteOne({_id:req.params.id, owner:req.user._id})
        if(deleted.deletedCount == 0){
            return res.status(404).send("not found!!")
        }
        res.status(202).send(deleted)
                
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router