const { Students, Contests, Performances } = require('./index.js');

const { fetchLeetCodeDataWithLimit } = require('../APIs/v2/utils/leetcodeUtils.js');
const { fetchCodeforcesContestsData } = require('../APIs/v2/utils/codeforcesUtils.js');
const { scrapeCodeChef } = require('../APIs/v2/utils/codechefUtils.js');
const { InterviewBitInfo } = require('../APIs/v2/utils/interviewbitUtils.js');
const { convertDate,formatDate  } = require('../APIs/v2/utils/CommonUtils.js');
const createStudent = async (student) => {
  try {
    const newStudent = await Students.create(student);
    return newStudent;
  } catch (err) {
    console.error("Error creating student:", err);
    throw err;
  }
};

const pushStudents = async (students) => {
  try {
    
    for (const student of students) {
      console.log('student: ', student.rollNo);      
      await createStudent(student);
    }
    return students;
  } catch (err) {
    console.error("Error pushing students:", err);
    throw err;
  }
};



const populateDataOfContestAndPerformance = async (
  rollNo,
  platform,
  ContestsData,
  PerformancesData,
  UserData,
  contestMultiple,
  contestProblemMultiple,
  problemMultiple
) => {
  try {
    const student = await Students.findOne({ rollNo });
    if (!student) return 'Student not found';

    let totalContestsParticipated = PerformancesData.length;
    let contestsProblemsSolved = 0;
    let totalProblemsSolved = UserData.TotalProblemsSolved;
    let score = 0;

    const contestRefs = [];
    for (const contest of PerformancesData) {
      contestsProblemsSolved += contest.problemsSolved;
      const currDataOfContest = ContestsData.find(
        (c) => {
          if(c===undefined) return false;
          return c.contestName === contest.contestName
        }
      );

      if (!currDataOfContest) continue;

      let currentContest = await Contests.findOne({
        contestName: currDataOfContest.contestName,
      });

      if (!currentContest) {
        const newContest = await Contests.create({
          platform,
          contestName: currDataOfContest.contestName,
          date: currDataOfContest.date,
          startTime: convertDate(currDataOfContest.date),
          link: currDataOfContest.link,
        });
        currentContest = newContest;
      }

      contestRefs.push(currentContest._id);

      const updateData = {
        rollNo,
        contest: currentContest._id,
        performance: {
          problemsSolved: contest.problemsSolved,
          rating: contest.rating,
          rank: contest.rank,
          delta: contest.delta,
        },
      };

      if (contest.div !== undefined) {
        updateData.performance.div = contest.div;
      }

      await Performances.updateOne(
        { rollNo, contest: currentContest._id },
        { $set: updateData },
        { upsert: true }
      );
    }

    score = calculateScore(
      totalContestsParticipated,
      contestMultiple,
      contestsProblemsSolved,
      contestProblemMultiple,
      totalProblemsSolved,
      problemMultiple
    );

    return { score, contests: contestRefs };
  } catch (err) {
    console.error("Error populating contest and performance data:", err);
    throw err;
  }
};

function calculateScore(
  totalContestsParticipated,
  contestMultiple,
  contestsProblemsSolved,
  contestProblemMultiple,
  totalProblemsSolved,
  problemMultiple
) {
  return ( Number(
    totalContestsParticipated * contestMultiple +
    contestsProblemsSolved * contestProblemMultiple +
    totalProblemsSolved * problemMultiple)
  );
}

let numberOfStudent = 183;
async function getDataOfStudents(batches) {
  try {
    for (const batch of batches) {
      for (const student of batch) {
        numberOfStudent++;
        console.log('Processing Student:', numberOfStudent, student.rollNo);

        const rollNo = student.rollNo;
        const LeetcodeDataOfStudent = await fetchLeetCodeDataWithLimit(
          student.leetcode.username
        );
        if(LeetcodeDataOfStudent.error){
          console.log('Error in fetching data for LC ', student.leetcode.username, " rollNo: ", rollNo);
          return;
        }
        const CodechefDataOfStudent = await scrapeCodeChef(
          student.codechef.username
        );
        if(CodechefDataOfStudent.error){
          console.log('Error in fetching data for CC ', student.codechef.username, " rollNo: ", rollNo);
          return;
        }
        const CodeforcesDataOfStudent = await fetchCodeforcesContestsData(
          student.codeforces.username
        );
        if(CodeforcesDataOfStudent.error){
          console.log('Error in fetching data for CF ', student.codeforces.username, " rollNo: ", rollNo);
          return;
        }
        const InterviewbitDataOfStudent = await InterviewBitInfo(
          student.interviewbit.username
        );
        if(InterviewbitDataOfStudent.error){
          console.log('Error in fetching data for IB ', student.interviewbit.username, " rollNo: ", rollNo);
          return;
        }

        let currStudent = await Students.findOne({ rollNo });
        if (!currStudent) {
          console.error(`Student with rollNo ${rollNo} not found.`);
          continue;
        }

        const leetcodeResponse = await populateDataOfContestAndPerformance(
          rollNo,
          'leetcode',
          LeetcodeDataOfStudent.ContestsData,
          LeetcodeDataOfStudent.PerformancesData,
          LeetcodeDataOfStudent.UserData,
          50, 20, 10
        );

        
        const codechefResponse = await populateDataOfContestAndPerformance(
          rollNo,
          'codechef',
          CodechefDataOfStudent.ContestsData,
          CodechefDataOfStudent.PerformancesData,
          CodechefDataOfStudent.UserData,
          20, 10, 5
        );

        
        const codeforcesResponse = await populateDataOfContestAndPerformance(
          rollNo,
          'codeforces',
          CodeforcesDataOfStudent.ContestsData,
          CodeforcesDataOfStudent.PerformancesData,
          CodeforcesDataOfStudent.UserData,
          50, 1, 15
        );

        

        currStudent.leetcode = {
          username: student.leetcode.username,
          score: leetcodeResponse.score,
          TotalProblemsSolved: LeetcodeDataOfStudent.UserData.TotalProblemsSolved,
          contests: leetcodeResponse.contests,
        };

        currStudent.codechef = {
          username: student.codechef.username,
          score: codechefResponse.score,
          TotalProblemsSolved: CodechefDataOfStudent.UserData.TotalProblemsSolved,
          contests: codechefResponse.contests,
        };

        currStudent.codeforces = {
          username: student.codeforces.username,
          score: codeforcesResponse.score,
          TotalProblemsSolved: CodeforcesDataOfStudent.UserData.TotalProblemsSolved,
          contests: codeforcesResponse.contests,
        };

        currStudent.interviewbit = {
          username: student.interviewbit.username,
          score: InterviewbitDataOfStudent.score,
          TotalProblemsSolved: InterviewbitDataOfStudent.TotalProblemsSolved,
          platformScore: InterviewbitDataOfStudent.platformScore,
        };

        const totalScore =
          leetcodeResponse.score +
          codechefResponse.score +
          codeforcesResponse.score +
          InterviewbitDataOfStudent.score;

        currStudent.pastScore = currStudent.totalScore || 0;
        currStudent.totalScore = totalScore;

        currStudent.streak =
          totalScore > currStudent.pastScore ? currStudent.streak + 1 : 0;

        await currStudent.save();
      }
    }
  } catch (err) {
    console.error("Error updating student data:", err);
    throw err;
  }
}

async function makeBatches() {
  try {
    const students = await Students.find();
    const batches = [];
    const batchSize = 40;

    for (let i = 183; i < students.length; i += batchSize) {
      batches.push(students.slice(i, i + batchSize));
    }

    await getDataOfStudents(batches);
    console.log('All Students Data Updated');
    return batches;
  } catch (err) {
    console.error("Error creating batches:", err);
    throw err;
  }
}

module.exports = { createStudent, pushStudents, makeBatches };
