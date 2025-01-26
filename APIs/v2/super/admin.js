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
        const students = await Students.find({ year, branch });
        res.send({
            nOfStudents: students.length,
            year,
            branch,
            students
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})


const { createStudent } = require('./superUtils.js');
// create a student {year, branch, student} => {message}
router.post('/newStudent', async (req, res) => {
    try {
        const { year, branch, student } = req.body;
        student.year = year;
        student.branch = branch;
        const newStudent = await createStudent(student);
        if (newStudent.error) {
            return res.send({
                message: newStudent.message,
                error: true
            });
        }
        res.send({
            message: newStudent.message,
            student: newStudent.newStudent
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// update a student {year, branch, student} => {message}
router.post('/updateStudent', async (req, res) => {
    try {
        const { year, branch, student } = req.body;
        student.year = year;
        student.branch = branch;
        const updatedStudent = await Students.findOneAndUpdate({ rollNo: student.rollNo }, student);
        if (!updatedStudent) {
            return res.send({
                message: "Student not found",
                error: true
            });
        }
        res.send({
            message: "Student updated successfully",
            student: updatedStudent
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