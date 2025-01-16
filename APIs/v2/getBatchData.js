const router = require('express').Router();
const express = require('express');
const { Students, Contests, Performances } = require('../../db/index.js');

router.use(express.json())

router.get('/health', async (req, res) => {
    res.send('This is Batch Data endpoint');
});


router.get('/', async (req, res) => {
    try {

        const studentData = await Students.find()
            .populate({
                path: 'leetcode.contests codechef.contests codeforces.contests',
                model: 'Contests'
            })
            .lean();
        
        if(studentData.length === 0) {
            return res.status(404).send('No students found');
        }

        const performanceData = await Performances.find({
            rollNo:{$in:studentData.map(student=>student.rollNo)}
        })
            .populate('contest')
            .lean();

        let performanceDataMap = new Map();
        performanceData.forEach((perf)=>{
            const key  = `{${perf.rollNo}-${perf.contest.contestName}}`;
            performanceDataMap.set(key, perf);
        })

        const studentDataWithPerformance = studentData.map((student)=>{
            const leetCodePerformances = student.leetcode.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            const codeChefPerformances = student.codechef.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            const codeForcesPerformances = student.codeforces.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            let newStudent = {...student};
            newStudent.leetcode.contests = leetCodePerformances;
            newStudent.codechef.contests = codeChefPerformances;
            newStudent.codeforces.contests = codeForcesPerformances;
            return newStudent;
        })




        res.status(200).json(studentDataWithPerformance);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching student data.');
    }
});
router.get('/yearBranch', async (req, res) => {
    try {
        // Get the req.query
        const body = req.query;
        let { year, branch } = body;
        year = parseInt(year);

        const studentData = await Students.find({ year: year, branch: branch })
            .populate({
                path: 'leetcode.contests codechef.contests codeforces.contests',
                model: 'Contests'
            })
            .lean();
        
        if(studentData.length === 0) {
            return res.status(404).send('No students found');
        }

        const performanceData = await Performances.find({
            rollNo:{$in:studentData.map(student=>student.rollNo)}
        })
            .populate('contest')
            .lean();

        let performanceDataMap = new Map();
        performanceData.forEach((perf)=>{
            const key  = `{${perf.rollNo}-${perf.contest.contestName}}`;
            performanceDataMap.set(key, perf);
        })

        const studentDataWithPerformance = studentData.map((student)=>{
            const leetCodePerformances = student.leetcode.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            const codeChefPerformances = student.codechef.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            const codeForcesPerformances = student.codeforces.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            let newStudent = {...student};
            newStudent.leetcode.contests = leetCodePerformances;
            newStudent.codechef.contests = codeChefPerformances;
            newStudent.codeforces.contests = codeForcesPerformances;
            return newStudent;
        })




        res.status(200).json(studentDataWithPerformance);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching student data.');
    }
});
router.get('/branch', async (req, res) => {
    try {
        const body = req.query;
        console.log('body: ', body);
        let { branch } = body;

        const studentData = await Students.find({ branch: branch })
            .populate({
                path: 'leetcode.contests codechef.contests codeforces.contests',
                model: 'Contests'
            })
            .lean();
        
        if(studentData.length === 0) {
            return res.status(404).send('No students found');
        }


        const performanceData = await Performances.find({
            rollNo:{$in:studentData.map(student=>student.rollNo)}
        })
            .populate('contest')
            .lean();

        let performanceDataMap = new Map();
        performanceData.forEach((perf)=>{
            const key  = `{${perf.rollNo}-${perf.contest.contestName}}`;
            performanceDataMap.set(key, perf);
        })

        const studentDataWithPerformance = studentData.map((student)=>{
            const leetCodePerformances = student.leetcode.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            const codeChefPerformances = student.codechef.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            const codeForcesPerformances = student.codeforces.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            let newStudent = {...student};
            newStudent.leetcode.contests = leetCodePerformances;
            newStudent.codechef.contests = codeChefPerformances;
            newStudent.codeforces.contests = codeForcesPerformances;
            return newStudent;
        })


        res.status(200).json(studentDataWithPerformance);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching student data.');
    }
});
router.get('/year', async (req, res) => {
    try {
        const body = req.query;
        console.log('body: ', body);
        let { year} = body;
        year = parseInt(year);

        const studentData = await Students.find({ year: year})
            .populate({
                path: 'leetcode.contests codechef.contests codeforces.contests',
                model: 'Contests'
            })
            .lean();
        
        if(studentData.length === 0) {
            return res.status(404).send('No students found');
        }


        const performanceData = await Performances.find({
            rollNo:{$in:studentData.map(student=>student.rollNo)}
        })
            .populate('contest')
            .lean();

        let performanceDataMap = new Map();
        performanceData.forEach((perf)=>{
            const key  = `{${perf.rollNo}-${perf.contest.contestName}}`;
            performanceDataMap.set(key, perf);
        })

        const studentDataWithPerformance = studentData.map((student)=>{
            const leetCodePerformances = student.leetcode.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            const codeChefPerformances = student.codechef.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            const codeForcesPerformances = student.codeforces.contests.map((contest)=>{
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance.performance
                }
            });
            let newStudent = {...student};
            newStudent.leetcode.contests = leetCodePerformances;
            newStudent.codechef.contests = codeChefPerformances;
            newStudent.codeforces.contests = codeForcesPerformances;
            return newStudent;
        })
        res.status(200).json(studentDataWithPerformance);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching student data.');
    }
});

module.exports = router;
