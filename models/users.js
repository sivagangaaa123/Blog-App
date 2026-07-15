// model for user sign-up
//import mongoose
const Mongoose = require("mongoose")

// create a schema -data structure
const userSchema = Mongoose.Schema(
    {
        name: {
            type:String,
            required:true
        },
        phone:String,
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        }

    }
)
//convert schema to model
var userModel=Mongoose.model("users",userSchema)
module.exports=userModel




 
