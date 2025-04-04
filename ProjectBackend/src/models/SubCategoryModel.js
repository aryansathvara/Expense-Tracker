const mongoose = require("mongoose")
const Schema=mongoose.Schema

const subcategoryschema = new Schema({
    name:{
        type:String,
    
    },
    description:{
        type:String,
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:'category',
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
},{timestamps: true})
module.exports = mongoose.model("subcategory",subcategoryschema);