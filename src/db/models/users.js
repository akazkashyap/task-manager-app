const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const  jwt = require("jsonwebtoken")
const Task = require("./tasks")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minLength: [8, "Password too short"],
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("Password Error: 'Password' is a weak password, please try a different combination.")
            }
        },
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error("Age Error : Age can not be zero or less than zero.")
            }
        }
    },
    mob: {
        type: String,
        validate(value) {
            if (!validator.isMobilePhone(value, "en-IN")) {
                throw new Error("Mobile no. Error : Please check again and enter a valid number.")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

//Virtual field
userSchema.virtual("tasks", {
    ref: "Task",
    localField:"_id",
    foreignField:"owner"
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


userSchema.methods.genereteAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString()}, process.env.JWT_SECRET)
    this.tokens = this.tokens.concat({ token })
    await this.save()
    return token
}

userSchema.statics.findByUserCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("User doesn't exists , Please check email and try again.")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error("Wrong password try again!!!")
    }
    return user
}

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})


userSchema.pre("remove", async function(next){
    await Task.deleteMany({owner:this._id})
    next()
})

const User = mongoose.model("User", userSchema)

module.exports = User