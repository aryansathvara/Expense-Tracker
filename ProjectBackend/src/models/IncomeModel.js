const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const incomeSchema = new Schema({

    title:{
        type:String,
        required: true
    },
    accountId:{
        type:Schema.Types.ObjectId,
        ref:"account",
        required: true
    },
    status:{
        type: String,
        enum:['pending', 'completed', 'rejected'],
        default: 'pending'
    },
    amount:{
        type: Number,
        required: true
    },
    transcationDate:{
        type: Date,
        default: Date.now
    },
    description:{
        type: String,
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    }

},{timestamps: true})

incomeSchema.index({ accountId: 1 }, { unique: false, background: true });
incomeSchema.index({ userId: 1 }, { unique: false, background: true });

module.exports = mongoose.model("income",incomeSchema)

