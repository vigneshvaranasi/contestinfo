const router = require('express').Router();
const express = require('express');
router.use(express.json());
const { Users, Students, Performances, Actions } = require('../../../db/index.js');
const adminMiddleware = require('../auth/adminMiddleware.js');

router.use(adminMiddleware);

// get all the batches {} => {year, branch, nOfstudents}
router.get('/batches', async (req, res) => {
    try {
        const dbBatches = await Students.aggregate([
            {
                $group: {
                    _id: { year: "$year", branch: "$branch" },
                    nOfStudents: { $sum: 1 }
                }
            }
        ]);
        const batch = dbBatches.map((batch) => {
            return {
                year: batch._id.year,
                branch: batch._id.branch,
                nOfStudents: batch.nOfStudents
            }
        })
        res.send(batch);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})



// get all the students in a batch {year, branch} => { students}
router.post('/students', async (req, res) => {
    try {
        const { year, branch } = req.body;
        const students = await Students.find({ year, branch }).sort({ rollNo: 1 }).lean();
        if(students.length === 0){
            res.send({
                nOfStudents: 0,
                year,
                branch,
                students: []
            })
        }
        res.send({
            nOfStudents: students.length,
            year,
            branch,
            students
        });
    } catch (err) {
        console.error(err);
        res.send({
            message: "Error",
            error: true
        })
    }
})


const { createStudent } = require('./superUtils.js');
const { getDataOfStudent } = require('../../../db/utils.js');
// create a student {year, branch, student} => {message}
router.post('/newStudent', async (req, res) => {
    try {
        const { year, branch, student } = req.body;
        student.year = year;
        student.branch = branch;
        const existingStudent = await Students.findOne({ rollNo: student.rollNo });
        if (existingStudent) {
            res.send({
                message: "Student already exists",
                error: true
            });
            return
        }
        const newStudent = await createStudent(student);
        if (newStudent.error) {
            res.send({
                message: newStudent.message,
                error: true
            });
            return;
        }
        const actionLog = await Actions.create({
            action: `Created student ${student.rollNo}`,
            username: req.username,
            time: new Date()
        })
        res.send({
            message: "Student created successfully",
            student: newStudent.newStudent,
            error: false
        });
    } catch (err) {
        console.error(err);
        res.send({
            message: "Error",
            error: true
        })
    }
});

// update a student {year, branch, student} => {message}
router.post('/updateStudent', async (req, res) => {
    try {
        const { year, branch, student } = req.body;
        student.year = year;
        student.branch = branch;
        let nameOfStudent = student.name;
        let leetcodeUsername = student.leetcode.username;
        let codechefUsername = student.codechef.username;
        let codeforcesUsername = student.codeforces.username;
        let interviewbitUsername = student.interviewbit.username;
        let hackerrankUsername = student.hackerrank;
        let spojUsername = student.spoj;
        const cleanPerformances = await Performances.deleteMany({ rollNo: student.rollNo, year, branch});
        const updatedStudent = await Students.findOneAndUpdate(
            { rollNo: student.rollNo },
            {
                $set: {
                    year: year,
                    branch: branch,
                    name: nameOfStudent,
                    "leetcode.username": leetcodeUsername,
                    "codechef.username": codechefUsername,
                    "codeforces.username": codeforcesUsername,
                    "interviewbit.username": interviewbitUsername,
                    hackerrank: hackerrankUsername,
                    spoj: spojUsername,
                },
            },
            { new: true }
        );

        if (!updatedStudent) {
            return res.send({
                message: "Student not found",
                error: true
            });
        }
        delete student.year;
        delete student.branch;
        const actionLog = await Actions.create({
            action: `Updated student ${student.rollNo}`,
            username: req.username,
            time: new Date()
        })
        res.send({
            message: "Student updated successfully",
            student: student
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// Refresh the Data of a particular student {rollNo, year, branch} => message

router.put('/refreshStudent', async(req, res)=>{
    try{
        const {rollNo, year, branch} = req.body;
        const refreshedStudent = await getDataOfStudent(rollNo, year, branch);
        if(refreshedStudent.error){
            res.send({
                message: refreshedStudent.message,
                error: true
            })
            return;
        }
        const actionLog = await Actions.create({
            action: `Refreshed data of student ${rollNo}`,
            username: req.username,
            time: new Date()
        })
        res.send({
            message: "Data refreshed successfully",
            student: refreshedStudent.student,
            timeTaken: refreshedStudent.timeTaken,
            error: false
        })
    }catch(err){
        console.error(err);
        res.status(500).send({
            message: err,
            error: true
        })
    }
})

// delete a student {year, branch, rollNo} => {message}
router.delete('/deleteStudent', async (req, res) => {
    try {
        const { year, branch, rollNo } = req.body;
        const deletedPerformances = await Performances.deleteMany({ rollNo});
        const deletedStudent = await Students.findOneAndDelete({ rollNo, year, branch });
        if (!deletedStudent) {
            return res.send({
                message: "Student not found",
                error: true
            });
        }
        const actionLog = await Actions.create({
            action: `Deleted student ${rollNo}`,
            username: req.username,
            time: new Date()
        })
        res.send({
            message: "Student deleted successfully",
            error: false
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// delete a batch {year,branch} => {message}
router.delete('/deleteBatch', async (req, res) => {
    try {
        const { year, branch } = req.body;
        const allStudentsOfBatch = await Students.find({
            year, branch
        });

        if (allStudentsOfBatch.length === 0) {
            return res.status(404).send({
                message: "No students found for the specified batch",
                error: true
            });
        }

        const deletedPerformances = await Performances.deleteMany({
            rollNo: {
                $in: allStudentsOfBatch.map((student) => student.rollNo)
            }
        });

        const deletedBatch = await Students.deleteMany({ year, branch });
        const actionLog = await Actions.create({
            action: `Deleted batch ${year}-${branch}`,
            username: req.username,
            time: new Date()
        })

        res.send({
            message: "Batch deleted successfully",
            batch: deletedBatch,
            error: false
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: "Error",
            error: true
        })
    }
})


module.exports = router;