const { Students, Contests, Performances, Views } = require('../../../db/index.js');

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
async function getStudentsOfView(viewName){
    try{
        const students = await Views.findOne({
            name:viewName
        },{
            rollNumbers:1,
            _id:0
        });
        if(!students){
            return {error:true,message:"View not found"};
        }
        return {
            error:false,
            students: students.rollNumbers
        };
    }catch(err){
        console.error("Error getting students of view:", err);
        return { error: true, message:err};
    }
}





module.exports = {createStudent, getStudentsOfView};