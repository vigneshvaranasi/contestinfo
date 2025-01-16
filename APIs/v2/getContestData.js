const express = require('express');
const router = express.Router();
const { Students, Contests, Performances } = require('../../db/index.js');
router.use(express.json());




router.get('/', async (req, res) =>{
    const contestName = req.query.contestName

    const contestData = await Contests.findOne({
        contestName: contestName
    }).lean();
    const performancesData = await Performances.find({
        contest: contestData._id
    }).lean();

    const studentsData = await Students.find({
        rollNo: {$in: performancesData.map(performance => performance.rollNo)}
    }).lean();

    let studentsMap = new Map();

    studentsData.forEach((student)=>{
        studentsMap.set(student.rollNo, {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            branch: student.branch
        });
    })

    let performancesMap = new Map();
    performancesData.forEach((performance)=>{
        performancesMap.set(performance.rollNo, performance);
    })
    
    let studentsPerformances = [];
    studentsMap.forEach((student, rollNo)=>{
        const performance = performancesMap.get(rollNo);
        studentsPerformances.push({
            ...student,
            performance: performance.performance
        })
    })

    studentsPerformances.sort((a, b) => a.performance.rank - b.performance.rank);

    res.status(200).json({
        contest: contestData,
        students: studentsPerformances
    })
});

// branch
router.get('/branch', async (req, res) =>{
    const {contestName, branch} = req.query;

    const contestData = await Contests.findOne({
        contestName: contestName
    }).lean();
    const performancesData = await Performances.find({
        contest: contestData._id
    }).lean();

    const studentsData = await Students.find({
        rollNo: {$in: performancesData.map(performance => performance.rollNo)},
        branch: branch
    }).lean();

    let studentsMap = new Map();

    studentsData.forEach((student)=>{
        studentsMap.set(student.rollNo, {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            branch: student.branch
        });
    })

    let performancesMap = new Map();
    performancesData.forEach((performance)=>{
        performancesMap.set(performance.rollNo, performance);
    })
    
    let studentsPerformances = [];
    studentsMap.forEach((student, rollNo)=>{
        const performance = performancesMap.get(rollNo);
        studentsPerformances.push({
            ...student,
            performance: performance.performance
        })
    })
    studentsPerformances.sort((a, b) => a.performance.rank - b.performance.rank);


    res.status(200).json({
        contest: contestData,
        students: studentsPerformances
    })
})

// year
router.get('/year', async (req, res) =>{
    const {contestName, year} = req.query;

    const contestData = await Contests.findOne({
        contestName: contestName
    }).lean();
    const performancesData = await Performances.find({
        contest: contestData._id
    }).lean();

    const studentsData = await Students.find({
        rollNo: {$in: performancesData.map(performance => performance.rollNo)},
        year: year
    }).lean();

    let studentsMap = new Map();

    studentsData.forEach((student)=>{
        studentsMap.set(student.rollNo, {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            branch: student.branch
        });
    })

    let performancesMap = new Map();
    performancesData.forEach((performance)=>{
        performancesMap.set(performance.rollNo, performance);
    })
    
    let studentsPerformances = [];
    studentsMap.forEach((student, rollNo)=>{
        const performance = performancesMap.get(rollNo);
        studentsPerformances.push({
            ...student,
            performance: performance.performance
        })
    })
    studentsPerformances.sort((a, b) => a.performance.rank - b.performance.rank);


    res.status(200).json({
        contest: contestData,
        students: studentsPerformances
    })
})
// year & branch
router.get('/contestName/branch', async (req, res) =>{
    const {contestName, branch , year} = req.query;

    const contestData = await Contests.findOne({
        contestName: contestName
    }).lean();
    const performancesData = await Performances.find({
        contest: contestData._id
    }).lean();

    const studentsData = await Students.find({
        rollNo: {$in: performancesData.map(performance => performance.rollNo)},
        branch: branch,
        year: year
    }).lean();

    let studentsMap = new Map();

    studentsData.forEach((student)=>{
        studentsMap.set(student.rollNo, {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            branch: student.branch
        });
    })

    let performancesMap = new Map();
    performancesData.forEach((performance)=>{
        performancesMap.set(performance.rollNo, performance);
    })
    
    let studentsPerformances = [];
    studentsMap.forEach((student, rollNo)=>{
        const performance = performancesMap.get(rollNo);
        studentsPerformances.push({
            ...student,
            performance: performance.performance
        })
    })
    studentsPerformances.sort((a, b) => a.performance.rank - b.performance.rank);


    res.status(200).json({
        contest: contestData,
        students: studentsPerformances
    })
})

module.exports = router;