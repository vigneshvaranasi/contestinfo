const router = require('express').Router();
const express = require('express');
const { Students, Contests, Performances } = require('../../db/index.js');

router.use(express.json())

router.get('/health', async (req, res) => {
    res.send('This is Batch Data endpoint');
});

router.get('/getYearsBranches', async (req, res) => {
    try {
        const studentData = await Students.find().distinct('year');
        const branchData = await Students.find().distinct('branch');
        res.status(200).json({
            years: studentData,
            branches: branchData
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('No Student data found');
    }
})
const getEliteBatch = async () => {
    const eliteRollNos = [
        "22501A0504", "22501A0512", "22501A0513", "22501A0515", "22501A0530",
        "22501A0533", "22501A0537", "22501A0544", "22501A0552", "22501A0555",
        "22501A0557", "22501A0563", "22501A0572", "22501A0574",
        "22501A0584", "22501A0594", "22501A0595", "22501A05A2",
        "22501A05A6", "22501A05A7", "22501A05B0", "22501A05C5",
        "22501A05C7", "22501A05C9", "22501A05D0", "22501A05D3",
        "22501A05D7", "22501A05D9", "22501A05E5", "22501A05E6",
        "22501A05G1", "22501A05G9", "22501A05H1", "22501A05H5",
        "22501A05H6", "22501A05I0", "22501A05I2", "22501A05I7", "22501A05I8",
        "22501A05J1", "22501A05J2", "22501A05J7"];
    const studentData = await Students.find({ rollNo: { $in: eliteRollNos } })
        .populate({
            path: 'leetcode.contests codechef.contests codeforces.contests',
            model: 'Contests'
        })
        .lean();

    if (studentData.length === 0) {
        return res.status(404).send('No students found');
    }


    const performanceData = await Performances.find({
        rollNo: { $in: studentData.map(student => student.rollNo) }
    })
        .populate('contest')
        .lean();

    let performanceDataMap = new Map();
    performanceData.forEach((perf) => {
        const key = `{${perf.rollNo}-${perf.contest.contestName}}`;
        performanceDataMap.set(key, perf);
    })

    const studentDataWithPerformance = studentData.map((student) => {
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
        let newStudent = { ...student };
        newStudent.leetcode.contests = leetCodePerformances;
        newStudent.codechef.contests = codeChefPerformances;
        newStudent.codeforces.contests = codeForcesPerformances;
        return newStudent;
    });
    return studentDataWithPerformance;
}


router.get('/', async (req, res) => {
    try {

        const studentData = await Students.find()
            .populate({
                path: 'leetcode.contests codechef.contests codeforces.contests',
                model: 'Contests'
            })
            .lean();

        if (studentData.length === 0) {
            return res.status(404).send('No students found');
        }

        const performanceData = await Performances.find()
            .populate('contest')
            .lean();

        let performanceDataMap = new Map();
        performanceData.forEach((perf) => {
            const key = `{${perf.rollNo}-${perf.contest.contestName}}`;
            performanceDataMap.set(key, perf);
        })

        const studentDataWithPerformance = studentData.map((student) => {
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
            let newStudent = { ...student };
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

router.get('/elite', async (req, res) => {
    try {
        const studentDataWithPerformance = await getEliteBatch();
        res.status(200).json(studentDataWithPerformance);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching student data.');
    }
})


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

        if (studentData.length === 0) {
            return res.status(404).send('No students found');
        }

        const performanceData = await Performances.find({
            rollNo: { $in: studentData.map(student => student.rollNo) }
        })
            .populate('contest')
            .lean();

        let performanceDataMap = new Map();
        performanceData.forEach((perf) => {
            const key = `{${perf.rollNo}-${perf.contest.contestName}}`;
            performanceDataMap.set(key, perf);
        })

        const studentDataWithPerformance = studentData.map((student) => {
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
            let newStudent = { ...student };
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

        if (studentData.length === 0) {
            return res.status(404).send('No students found');
        }


        const performanceData = await Performances.find({
            rollNo: { $in: studentData.map(student => student.rollNo) }
        })
            .populate('contest')
            .lean();

        let performanceDataMap = new Map();
        performanceData.forEach((perf) => {
            const key = `{${perf.rollNo}-${perf.contest.contestName}}`;
            performanceDataMap.set(key, perf);
        })

        const studentDataWithPerformance = studentData.map((student) => {
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
            let newStudent = { ...student };
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
        let { year } = body;
        year = parseInt(year);

        const studentData = await Students.find({ year: year })
            .populate({
                path: 'leetcode.contests codechef.contests codeforces.contests',
                model: 'Contests'
            })
            .lean();

        // console.log('studentData: ', studentData);

        if (studentData.length === 0) {
            return res.status(404).send('No students found');
        }


        const performanceData = await Performances.find({
            rollNo: { $in: studentData.map(student => student.rollNo) }
        })
            .populate('contest')
            .lean();

        let performanceDataMap = new Map();
        performanceData.forEach((perf) => {
            const key = `{${perf.rollNo}-${perf.contest.contestName}}`;
            performanceDataMap.set(key, perf);
        })

        // console.log(typeof studentData);

        const studentDataWithPerformance = studentData.map((student) => {
            const leetCodePerformances = student.leetcode.contests.map((contest) => {
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance?.performance
                };
            });

            const codeChefPerformances = student.codechef.contests.map((contest) => {
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance?.performance
                };
            });

            const codeForcesPerformances = student.codeforces.contests.map((contest) => {
                const key = `{${student.rollNo}-${contest.contestName}}`;
                const performance = performanceDataMap.get(key);
                return {
                    contest,
                    performance: performance?.performance
                };
            });

            let newStudent = { ...student };
            newStudent.leetcode.contests = leetCodePerformances;
            newStudent.codechef.contests = codeChefPerformances;
            newStudent.codeforces.contests = codeForcesPerformances;
            return newStudent;
        });

        res.status(200).json(studentDataWithPerformance);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching student data.');
    }
});

module.exports = router;