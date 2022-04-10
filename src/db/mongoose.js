const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser:true,
}).catch((error)=>{
    console.log("Connection Error (Try restarting mongodb server)",error)
})