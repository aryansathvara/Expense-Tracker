const mongoose = require("mongoose")
const Schema=mongoose.Schema


const accountschema = new Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
    },
    amount:{
        type:Number,
        require:true
    },
    userId:{
        type:String
    }
},{timestamps: true})
module.exports = mongoose.model("account",accountschema);