const express = require('express');
const router = express.Router();
const { Students, Contests, Performances } = require('../../db/index.js');
router.use(express.json());

// v2/contest/getContests?pageSize=10
router.get('/getContests', async (req, res) => {
    try {
        const pageSize = req.query.pageSize || 10;
        const contestPage = Contests.find().sort({ startTime: -1 }).limit(pageSize).lean();
        const contests = await contestPage;
        res.status(200).json({
            contests
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
})




router.get('/', async (req, res) => {
    const contestName = req.query.contestName
    console.log(contestName)
    const contestData = await Contests.findOne({
        contestName: contestName
    }).lean();

    if (!contestData) {
        return res.status(404).send('Contest not found');
    }

    const performancesData = await Performances.find({
        contest: contestData._id
    }).lean();

    const studentsData = await Students.find({
        rollNo: { $in: performancesData.map(performance => performance.rollNo) }
    }).lean();

    let studentsMap = new Map();

    studentsData.forEach((student) => {
        studentsMap.set(student.rollNo, {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            branch: student.branch
        });
    })

    let performancesMap = new Map();
    performancesData.forEach((performance) => {
        performancesMap.set(performance.rollNo, performance);
    })

    let studentsPerformances = [];
    studentsMap.forEach((student, rollNo) => {
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


router.get('/id/:id', async (req, res) => {
    const contestId = req.params.id;

    try {
        // Fetch the contest data by _id
        const contestData = await Contests.findById(contestId).lean();

        if (!contestData) {
            return res.status(404).send('Contest not found');
        }

        // Fetch performances for the contest
        const performancesData = await Performances.find({
            contest: contestId
        }).lean();

        // Extract roll numbers of participating students
        const rollNos = performancesData.map(performance => performance.rollNo);

        // Fetch student data for the roll numbers
        const studentsData = await Students.find({
            rollNo: { $in: rollNos }
        }).lean();

        // Create a map of students
        const studentsMap = new Map();
        studentsData.forEach(student => {
            studentsMap.set(student.rollNo, {
                name: student.name,
                rollNo: student.rollNo,
                year: student.year,
                branch: student.branch
            });
        });

        // Create a map of performances
        const performancesMap = new Map();
        performancesData.forEach(performance => {
            performancesMap.set(performance.rollNo, performance);
        });

        // Combine student and performance data
        const studentsPerformances = [];
        studentsMap.forEach((student, rollNo) => {
            const performance = performancesMap.get(rollNo);
            studentsPerformances.push({
                ...student,
                performance: performance.performance
            });
        });

        // Sort by rank
        studentsPerformances.sort((a, b) => a.performance.rank - b.performance.rank);

        // Return the combined result
        res.status(200).json({
            contest: contestData,
            students: studentsPerformances
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching contest data');
    }
});


// branch
router.get('/branch', async (req, res) => {
    const { contestName, branch } = req.query;

    const contestData = await Contests.findOne({
        contestName: contestName
    }).lean();
    if (!contestData) {
        return res.status(404).send('Contest not found');
    }
    const performancesData = await Performances.find({
        contest: contestData._id
    }).lean();

    const studentsData = await Students.find({
        rollNo: { $in: performancesData.map(performance => performance.rollNo) },
        branch: branch
    }).lean();

    let studentsMap = new Map();

    studentsData.forEach((student) => {
        studentsMap.set(student.rollNo, {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            branch: student.branch
        });
    })

    let performancesMap = new Map();
    performancesData.forEach((performance) => {
        performancesMap.set(performance.rollNo, performance);
    })

    let studentsPerformances = [];
    studentsMap.forEach((student, rollNo) => {
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
router.get('/year', async (req, res) => {
    const { contestName, year } = req.query;

    const contestData = await Contests.findOne({
        contestName: contestName
    }).lean();
    if (!contestData) {
        return res.status(404).send('Contest not found');
    }
    const performancesData = await Performances.find({
        contest: contestData._id
    }).lean();

    const studentsData = await Students.find({
        rollNo: { $in: performancesData.map(performance => performance.rollNo) },
        year: year
    }).lean();

    let studentsMap = new Map();

    studentsData.forEach((student) => {
        studentsMap.set(student.rollNo, {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            branch: student.branch
        });
    })

    let performancesMap = new Map();
    performancesData.forEach((performance) => {
        performancesMap.set(performance.rollNo, performance);
    })

    let studentsPerformances = [];
    studentsMap.forEach((student, rollNo) => {
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
router.get('/contestName/branch', async (req, res) => {
    const { contestName, branch, year } = req.query;

    const contestData = await Contests.findOne({
        contestName: contestName
    }).lean();
    if (!contestData) {
        return res.status(404).send('Contest not found');
    }
    const performancesData = await Performances.find({
        contest: contestData._id
    }).lean();

    const studentsData = await Students.find({
        rollNo: { $in: performancesData.map(performance => performance.rollNo) },
        branch: branch,
        year: year
    }).lean();

    let studentsMap = new Map();

    studentsData.forEach((student) => {
        studentsMap.set(student.rollNo, {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            branch: student.branch
        });
    })

    let performancesMap = new Map();
    performancesData.forEach((performance) => {
        performancesMap.set(performance.rollNo, performance);
    })

    let studentsPerformances = [];
    studentsMap.forEach((student, rollNo) => {
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