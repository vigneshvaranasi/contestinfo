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
    isError:{
        leetcode:{
            type:Boolean,
            default:false
        },
        codechef:{
            type:Boolean,
            default:false
        },
        codeforces:{
            type:Boolean,
            default:false
        },
        interviewbit:{
            type:Boolean,
            default:false
        }
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
    },
    startTime:{
        type:Date,
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

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['dev', 'admin', 'user'],
        required:true
    }
})

const ViewSchema = new mongoose.Schema({
    rollNumbers:[{
        type:String,
        required:true
    }],
    name:{
        type:String,
        required:true,
        unique:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
})

const ActionSchema = new mongoose.Schema({
    action:{
        type:String,
        required:true
    },
    time:{
        type:Date,
        required:true,
        default:Date.now()
    },
    username:{
        type:String,
        required:true
    }
})

const UpcomingContestSchema = new mongoose.Schema({
    href: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    host: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true
    },
    resource: {
        type: String,
        required: true
    },
    resource_id:{
        type:Number,
        required:true
    },
    start: {
        type: Date,
        required: true
    }
})

const Students = mongoose.model('Students',StudentsSchema);
const Contests = mongoose.model('Contests',ContestsSchema)
const Performances = mongoose.model('Performances',PerformancesSchema)
const Users = mongoose.model('User',UserSchema);
const Views = mongoose.model('Views',ViewSchema);
const Actions = mongoose.model('Action',ActionSchema);
const UpcomingContest = mongoose.model('UpcomingContest',UpcomingContestSchema);

module.exports = {Students,Contests,Performances,Users, Views, Actions, UpcomingContest};