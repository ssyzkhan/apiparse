const mongoose = require('mongoose');
const TaskSchema = mongoose.Schema(
    {
        title:{
            type:String,
            required: [true,"Please enter task title"]
        },
        desc:{
            type:String,
            required: [true,"Please enter task desc"]
        },
        assignedTo:{
            type:String,
            required: [true,"Please enter task assignedTo"]
           
        },
        createdAt:{
            type:String,
            required: [true,"Please enter task createdAt"]
        },
        priority:{
            type:String,
            required: [true,"Please enter task priority"]
        },
        status:{
            type:String,
            required: [true,"Please enter task status"]
        }
    },
    {
        timestamps:true,
    }
);
const Task = mongoose.model("Task",TaskSchema);
module.exports = Task;
