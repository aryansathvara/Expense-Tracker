const mongoose = require("mongoose")
const Schema=mongoose.Schema


const categoryschema = new Schema({
    name:{
        type:String,
        require:true
    },
    description:{
        type:String,
    }
},{timestamps: true})
module.exports = mongoose.model("category",categoryschema);