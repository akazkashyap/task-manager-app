//DataBase Imports
require("../db/mongoose")
const User = require("../db/models/users")
const multer = require("multer")

const bcryptjs = require("bcryptjs")
const express = require("express")
const router = new express.Router()
const auth = require("../middleware/auth")
const sharp = require("sharp")


//USER router
router.post("/user/signup", async(req, res)=>{
    const user = new User(req.body)
    const token = await user.genereteAuthToken()
    try {
        await user.save()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})


router.get("/user/me", auth, async(req, res)=>{
    res.send(req.user)
})


router.get("/user/:id", async(req, res)=>{
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send({Error : "User doesn't exists in database."})
        }
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.patch("/user/me", auth, async(req, res)=>{
    const allowedFields = ["name", "mob", "age", "password"]
    const providedFields = Object.keys(req.body)
    const isAllowed = providedFields.every((field)=>allowedFields.includes(field))
    
    if(!isAllowed){
        return res.status(400).send("This update is not allowed!!")
    }
    try {
        providedFields.forEach((field) => req.user[field] = req.body[field]);
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.delete("/user/me", auth, async(req, res)=>{
    try {
        await req.user.remove()
        res.send("User has been successfully deleted!!")
    } catch (error) {
        res.status(500).send("Something went wrong.")
    }
})


router.post("/user/login", async(req, res)=>{
    try {
        const user = await User.findByUserCredentials(req.body.email, req.body.password)
        const token = await user.genereteAuthToken()

        return res.send({user, token})
    } catch (error) {
        res.status(400).send({message:"Unable to login, please try again!!!"})
    }
})


router.post("/user/logout", auth,async(req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send("logged out successfully!")
    } catch (error) {
        res.status(500).send(error)
    }
})


router.post("/user/logout/all", auth, async(req, res)=>{
    try {
        req.user.tokens = []
        await req.user.save()

        res.send("Logged out from all the devices!!")
    } catch (error) {
        res.status(500).send("Something went wrong!!")
    }
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file ,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb( new Error("Only png and jpg formats are allowed."))
        }
        cb(undefined, true)
    }
}) 

router.post("/user/me/avatar",auth, upload.single("avatar") ,async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:200, height:200}).png().toBuffer()
    req.user.avatar  = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.send({error:error.message})
})

router.delete("/user/me/avatar/delete", auth, async(req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send({msg : "Deleted"})
})

router.get("/user/:id/avatar", async(req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error
        }
        res.set("Content-type", "image/png")
        res.send(user.avatar)
    } catch{
        res.status(404).send()
    }
})

module.exports = router