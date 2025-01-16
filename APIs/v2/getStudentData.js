const router = require('express').Router();
const express = require('express');
const { Students, Contests, Performances } = require('../../db/index.js');

router.use(express.json())

router.get('/health', async (req, res) => {
    res.send('This is Batch Data endpoint');
});

router.get('/', async (req, res) => {
    try {
        const { rollNo } = req.query;

        const studentData = await Students.find({ rollNo: rollNo })
            .populate({
                path: 'leetcode.contests codechef.contests codeforces.contests',
                model: 'Contests',
            })
            .lean();
        if(studentData.length === 0) {
            return res.status(404).send('Student not found');
        }

        const performanceData = await Performances.find({
            rollNo: rollNo,
        })
            .populate('contest')
            .lean();
        console.log(studentData)
        let performanceDataMap = new Map();
        performanceData.forEach((perf) => {
            const key = `{${perf.rollNo}-${perf.contest.contestName}}`;
            performanceDataMap.set(key, perf);
        })

        let student = studentData[0];
        const leetCodePerformances = student.leetcode.contests.map((contest) => {
            const key = `{${student.rollNo}-${contest.contestName}}`;
            const performance = performanceDataMap.get(key);
            return {
                contest,
                performance: performance.performance
            }
        });
        const codeChefPerformances = student.codechef.contests.map((contest) => {
            const key = `{${student.rollNo}-${contest.contestName}}`;
            const performance = performanceDataMap.get(key);
            return {
                contest,
                performance: performance.performance
            }
        });
        const codeForcesPerformances = student.codeforces.contests.map((contest) => {
            const key = `{${student.rollNo}-${contest.contestName}}`;
            const performance = performanceDataMap.get(key);
            return {
                contest,
                performance: performance.performance
            }
        });
        student.leetcode.contests = leetCodePerformances;
        student.codechef.contests = codeChefPerformances;
        student.codeforces.contests = codeForcesPerformances;

        res.status(200).json(student);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching student data.');
    }
});

module.exports = router;