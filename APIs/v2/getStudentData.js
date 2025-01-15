const router = require('express').Router();
const { Students, Contests, Performances } = require('../../db/index.js');

router.get('/health', async (req, res) => {
    res.send('This is Batch Data endpoint');
});

router.get('/yearBranch', async (req, res) => {
    try {
        const { year, branch, rollNo } = req.query;

        const studentData = await Students.find({ year: year, branch: branch, rollNo: rollNo })
            .populate({
                path: 'leetcode.contests codechef.contests codeforces.contests',
                model: 'Contests',
            })
            .lean();

        const performanceData = await Performances.find({
            rollNo: rollNo,
        })
            .populate('contest')
            .lean();

        const studentDataWithPerformance = studentData.map((student) => {
            const studentPerformances = performanceData.filter(
                (performance) => performance.rollNo === student.rollNo
            );
            return { ...student, performances: studentPerformances };
        });

        res.status(200).json(studentDataWithPerformance);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching student data.');
    }
});

module.exports = router;
