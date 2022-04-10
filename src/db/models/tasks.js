const mongoose = require("mongoose")

const taskSchema = mongoose.Schema({
    title:{
        type:String,
        required:[true, "Task title is required."],
        minLength:1
    },
    completed:{
        type:Boolean,
        required :true,
        default:false
    },
    date:{
        type:String,
        default : Date
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    timestamps:true
})

const Task = mongoose.model("Task", taskSchema)

module.exports = Task