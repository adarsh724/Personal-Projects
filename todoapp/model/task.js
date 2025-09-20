const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task : {
        type: String,
        required: true
    },
    date:{
        type:Date,
        required: true
    },
    category:{
        type: String,
        required: true
    },
     user: {                     // Reference to the user who created it
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Task = mongoose.model('Task',taskSchema);
module.exports=Task;