const mongoose = require('mongoose');

const StudentsSchema=new mongoose.Schema({
    rollNo:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true        
    },
    branch:{
        type:String,
        required:true
    },
    year:{
        type:Number,
        required:true
    },
    totalScore:{
        type:Number,
        required:true,
        default:0
    },
    pastScore:{
        type:Number,
        required:true,
        default:0
    },
    streak:{
        type:Number,
        required:true,
        default:0
    },
    leetcode:{
        score:{
            type:Number,
            required:true,
            default:0
        },
        TotalProblemsSolved:{
            type:Number,
            required:true,
            default:0            
        },
        username:{
            type:String,
            required:true
        },
        contests:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Contests',
            required:true
        }]
    },
    codechef:{
        score:{
            type:Number,
            required:true,
            default:0
        },
        TotalProblemsSolved:{
            type:Number,
            required:true,
            default:0            
        },
        username:{
            type:String,
            required:true
        },
        contests:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Contests',
            required:true
        }]
    },
    codeforces:{
        score:{
            type:Number,
            required:true,
            default:0
        },
        TotalProblemsSolved:{
            type:Number,
            required:true,
            default:0            
        },
        username:{
            type:String,
            required:true
        },
        contests:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Contests',
            required:true
        }]
    },
    interviewbit:{
        score:{
            type:Number,
            required:true,
            default:0
        },
        platformScore:{
            type:Number,
            required:true,
            default:0
        },
        TotalProblemsSolved:{
            type:Number,
            required:true,
            default:0            
        },
        username:{
            type:String,
            required:true
        }
    },
    hackerrank:{
        type: String,
        require:false
    },
    spoj:{
        type: String,
        require:false
    }
})


const ContestsSchema=new mongoose.Schema({
    platform:{
        type:String,
        required:true
    },
    contestName:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    link:{
        type:String,
        required:true
    }
})

const PerformancesSchema=new mongoose.Schema({
    rollNo:{
        type:String,
        required:true
    },
    contest:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Contests',
        required:true
    },
    performance:{
        problemsSolved:{
            type:Number,
            required:true
        },
        rating:{
            type:Number,
            required:true
        },
        rank:{
            type:Number,
            required:true
        },
        delta:{
            type:Number,
            required:true
        },
        div:{
            type:Number
        }
    }
})


const Students = mongoose.model('Students',StudentsSchema);
const Contests = mongoose.model('Contests',ContestsSchema)
const Performances = mongoose.model('Performances',PerformancesSchema)

module.exports = {Students,Contests,Performances}