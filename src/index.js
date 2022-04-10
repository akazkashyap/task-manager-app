//File or modules imports
const express = require("express")
const path = require("path")

//ROUTERS
const taskRoute = require("./routes/taskRouter")
const userRouter = require("./routes/userRouter")

const app = express()

app.use(express.json())
app.use(taskRoute)
app.use(userRouter)

//Port configuring
const port = process.env.PORT

app.get("", (req, res) => {
    res.send("Welcome to Task Manager api")
})
app.get("/qwertyuiop-help", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"))
})

const multer = require("multer")

const upload = multer({
    dest: "images"
})
app.post('/upload', upload.single("upload"), (req, res) => {
    res.send()
})


//Listener on port
app.listen(port, () => {
    console.log("Listening on port : ", port)
})
