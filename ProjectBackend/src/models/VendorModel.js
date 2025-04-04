const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const vendorSchema = new Schema({
    //fileds /// get

    title:{
        type:String,
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        require:true
    }
},{timestamps: true})

module.exports = mongoose.model("vendor",vendorSchema)