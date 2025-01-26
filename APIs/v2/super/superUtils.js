const { Students, Contests, Performances } = require('../../../db/index.js');

async function createStudent(student) {
    try {
        const existingStudent = await Students.findOne({ rollNo: student.rollNo });
        if (existingStudent) {
            return { message: "Student already exists" };
        }
        const newStudent = await Students.create(student);
        return { newStudent, message: "Student created successfully" };
    } catch (err) {
        console.error("Error creating student:", err);
        return { error: true, message: err };
    }
}


module.exports = {createStudent};