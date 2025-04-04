const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const expenceSchema = new Schema({

    title:{
        type:String
    },
    categoryId:{
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    subcategoryId:{
        type: Schema.Types.ObjectId,
        ref: 'subcategory',
        required: true
    },
    vendorId:{
        type: Schema.Types.ObjectId,
        ref: 'vendor',
        required: true
    },
    accountId:{
        type: Schema.Types.ObjectId,
        ref: 'account',
        required: true
    },
    status:{
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    amount:{
        type:Number
    },
   transcationDate:{
        type: Date,
        // required: true
    },
    description:{
        type:String
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    comments: [commentSchema]

},{timestamps: true})

module.exports = mongoose.model("expence",expenceSchema)


