const mongoose = require('mongoose')
const fs = require('fs');
function editJSON(filename,year, branch) {
  try {
    const data = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(data);
    const updatedJson = json.map((studentData) => {
      let leetcode={
        username:studentData.leetcode,
      }
      let codechef={
        username:studentData.codechef,
      }
      let codeforces={
        username:studentData.codeforces,
      }
      let interviewbit={
        username:studentData.interviewbit,
      }
      return {
        rollNo: studentData.roll,
        name: studentData.name,
        branch:branch,
        year: year,
        leetcode:leetcode,
        codechef:codechef,
        codeforces:codeforces,
        interviewbit:interviewbit,
        hackerrank:studentData.hackerrank,
        spoj:studentData.spoj
      };
    });
    fs.writeFileSync(filename, JSON.stringify(updatedJson, null, 2), 'utf-8');
    console.log('Year added successfully!');
  } catch (error) {
    console.error('Error editing JSON file:', error);
  }
}

/* To Migrate the existing Json Data to new Schema */





// editJSON("test21.json",2025,'CSE');
// editJSON("test22.json",2026,'CSE');

