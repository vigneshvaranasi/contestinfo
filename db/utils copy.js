const { Students, Contests, Performances } = require('./index.js')

const {
  fetchLeetCodeDataWithLimit
} = require('../APIs/v2/utils/leetcodeUtils.js')
const {
  fetchCodeforcesContestsData
} = require('../APIs/v2/utils/codeforcesUtils.js')
const { scrapeCodeChef } = require('../APIs/v2/utils/codechefUtils.js')
const { InterviewBitInfo } = require('../APIs/v2/utils/interviewbitUtils.js')

const createStudent = async student => {
  try {
    const newStudent = await Students.create(student)
    return newStudent
  } catch (err) {
    return err
  }
}

const pushStudents = async students => {
  try {
    // console.log(students);
    // await Students.insertMany(students);
    students.map(async student => {
      await createStudent(student)
    })
    return students
  } catch (err) {
    return err
  }
}

const populateDataofContestandPerformance = async (
  rollNo,
  platform,
  ContestsData,
  PerfomancesData,
  UserData,
  contestMultiple,
  contestProblemMultiple,
  problemMultiple
) => {
  try {
    const student = await Students.findOne({ rollNo: rollNo })
    if (!student) {
      return 'Student not found'
    }
    let totalContestsParticipated = PerfomancesData.length
    let contestsProblemsSolved = 0
    let totalProblemsSolved = UserData.TotalProblemsSolved;
    let score = 0
    const contestRefs = await Promise.all(
      PerfomancesData.map(contest => {
        contestsProblemsSolved += contest.problemsSolved
        const currDataofContest = ContestsData.filter(c=>c.contestName === contest.contestName)
        const currentContest = Contests.findOne({
          contestName: currDataofContest.contestName
        })
        let currentContestRef;
        if (!currentContest) {
          const newContest = Contests.create({
            platform: platform,
            contestName: currDataofContest.contestName,
            date: currDataofContest.date,
            link: currDataofContest.link
          })
          currentContestRef = newContest._id
        } else {
          currentContestRef = currentContest._id
        }

        const updateData = {
          rollNo: rollNo,
          contestRef: currentContestRef,
          performance: {
            problemsSolved: contest.problemsSolved,
            rating: contest.rating,
            rank: contest.rank,
            delta: contest.delta
          }
        }
        if (contest.div !== undefined) {
          updateData.performance.div = contest.div
        }

        const currPerformance = Performances.updateOne(
          { rollNo: rollNo, contestRef: currentContestRef },
          { $set: updateData }
        )

        score =  calculateScore(
            totalContestsParticipated,
            contestMultiple,
            contestsProblemsSolved,
            contestProblemMultiple,
            totalProblemsSolved,
            problemMultiple
        )
        
        return currentContestRef;
        
      })
      
    );
    return{
      score,
      contests: contestRefs
    }
  } catch (err) {
    return err
  }
}

function calculateScore (
  totalContestsParticipated,
  contestMultiple,
  contestsProblemsSolved,
  contestProblemMultiple,
  totalProblemsSolved,
  problemMultiple
) {
  let score = totalContestsParticipated * contestMultiple;
  score += contestsProblemsSolved * contestProblemMultiple;
  score += totalProblemsSolved * problemMultiple;
  return score;
}

let numberOfStudent = 0
async function getDataOfStudents (batches) {
  try {
    batches.map(async batch => {
      batch.map(async student => {
        numberOfStudent++
        console.log('Number of Student: ', numberOfStudent)
        const rollNo = student.rollNo
        const LeetcodeDataOfStudent = await fetchLeetCodeDataWithLimit(
          student.leetcode.username
        )
        if(LeetcodeDataOfStudent.error){
          console.log('Error in fetching data for LC ', student.leetcode.username, " rollNo: ", rollNo);
          return;
        }

        let currStudent = await Students.findOne({ rollNo: rollNo })
        
        let leetcodeResponse = await populateDataofContestandPerformance(
          rollNo,
          'leetcode',
          LeetcodeDataOfStudent.ContestsData,
          LeetcodeDataOfStudent.PerfomancesData,
          LeetcodeDataOfStudent.UserData,
          50, 20, 10
        )

       

        const CodechefDataOfStudent = await scrapeCodeChef(
          student.codechef.username
        )
        if(CodechefDataOfStudent.error){
          console.log('Error in fetching data for CC ', student.codechef.username, " rollNo: ", rollNo);
          return;
        }
        let codechefResponse=await populateDataofContestandPerformance(
          rollNo,
          'codechef',
          CodechefDataOfStudent.ContestsData,
          CodechefDataOfStudent.PerformancesData,
          CodechefDataOfStudent.UserData,
          20, 10, 5
        )


        const CodeforcesDataOfStudent = await fetchCodeforcesContestsData(
          student.codeforces.username
        )

        if(CodeforcesDataOfStudent.error){
          console.log('Error in fetching data for CF ', student.codeforces.username, " rollNo: ", rollNo);
          return;
        }


        let codeforcesResponse = await populateDataofContestandPerformance(
          rollNo,
          'codeforces',
          CodeforcesDataOfStudent.ContestsData,
          CodeforcesDataOfStudent.PerformancesData,
          CodeforcesDataOfStudent.UserData,
          50, 1, 15
        )


        const InterviewbitDataOfStudent = await InterviewBitInfo(
          student.interviewbit.username
        )

        if(InterviewbitDataOfStudent.error){
          console.log('Error in fetching data for IB ', student.interviewbit.username, " rollNo: ", rollNo);
          return;
        }

        currStudent.leetcode.score = leetcodeResponse.score
        currStudent.leetcode.TotalProblemsSolved = LeetcodeDataOfStudent.UserData.TotalProblemsSolved
        currStudent.leetcode.contests = leetcodeResponse.contests

        
        currStudent.codechef.score = codechefResponse.score
        currStudent.codechef.TotalProblemsSolved = CodechefDataOfStudent.UserData.TotalProblemsSolved
        currStudent.codechef.contests = codechefResponse.contests

        
        currStudent.codeforces.score = codeforcesResponse.score
        currStudent.codeforces.TotalProblemsSolved = CodeforcesDataOfStudent.UserData.TotalProblemsSolved
        currStudent.codeforces.contests = codeforcesResponse.contests


        currStudent.interviewbit.score = InterviewbitDataOfStudent.score
        currStudent.interviewbit.TotalProblemsSolved = InterviewbitDataOfStudent.TotalProblemsSolved

        let totalScore = leetcodeResponse.score + codechefResponse.score + codeforcesResponse.score + InterviewbitDataOfStudent.score
        currStudent.pastScore = currStudent.totalScore
        currStudent.totalScore = totalScore   
        if(currStudent.totalScore > currStudent.pastScore){
          currStudent.streak++;
        }else{
          currStudent.streak = 0;
        }      
        await currStudent.save()
      })
    })
    
  } catch (err) {
    return err
  }
}

async function makeBatches () {
  try {
    const students = await Students.find()
    const batches = []
    const batchSize = 40
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize)
      batches.push(batch)
    }
    getDataOfStudents(batches).then(()=>{
      console.log('All Students Data Updated')
    })
    return batches
  } catch (err) {
    return err
  }
}
module.exports = { createStudent, pushStudents, makeBatches }
