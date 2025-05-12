const { Students, Contests, Performances } = require('./index.js')
const {
  fetchLeetCodeDataWithLimit
} = require('../APIs/v2/utils/leetcodeUtils.js')
const {
  fetchCodeforcesContestsData
} = require('../APIs/v2/utils/codeforcesUtils.js')
const { scrapeCodeChef } = require('../APIs/v2/utils/codechefUtils.js')
const { InterviewBitInfo } = require('../APIs/v2/utils/interviewbitUtils.js')
const { convertDate } = require('../APIs/v2/utils/CommonUtils.js')
const { get } = require('mongoose')

const createStudent = async student => {
  try {
    const newStudent = await Students.create(student)
    return newStudent
  } catch (err) {
    console.error('Error creating student:', err)
    throw err
  }
}

const pushStudents = async students => {
  try {
    for (const student of students) {
      console.log('Initializing student: ', student.rollNo)
      await createStudent(student)
    }
    return students
  } catch (err) {
    console.error('Error pushing students:', err)
    throw err
  }
}

const calculateScore = (
  totalContestsParticipated,
  contestMultiple,
  contestsProblemsSolved,
  contestProblemMultiple,
  totalProblemsSolved,
  problemMultiple
) => {
  return Number(
    totalContestsParticipated * contestMultiple +
      contestsProblemsSolved * contestProblemMultiple +
      totalProblemsSolved * problemMultiple
  )
}

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
    const student = await Students.findOne({ rollNo })
    if (!student) return 'Student not found'

    let totalContestsParticipated = PerformancesData.length
    let contestsProblemsSolved = 0
    const contestRefs = []

    for (const contest of PerformancesData) {
      contestsProblemsSolved += contest.problemsSolved
      const currDataOfContest = ContestsData.find(
        c => c && c.contestName === contest.contestName
      )

      if (!currDataOfContest) continue

      let currentContest = await Contests.findOne({
        contestName: currDataOfContest.contestName
      })

      if (!currentContest) {
        currentContest = await Contests.create({
          platform,
          contestName: currDataOfContest.contestName,
          date: currDataOfContest.date,
          startTime: convertDate(currDataOfContest.date),
          link: currDataOfContest.link
        })
      }

      contestRefs.push(currentContest._id)

      const updateData = {
        rollNo,
        contest: currentContest._id,
        performance: {
          problemsSolved: contest.problemsSolved,
          rating: contest.rating,
          rank: contest.rank,
          delta: contest.delta,
          ...(contest.div !== undefined && { div: contest.div })
        }
      }

      await Performances.updateOne(
        { rollNo, contest: currentContest._id },
        { $set: updateData },
        { upsert: true }
      )
    }

    const score = calculateScore(
      totalContestsParticipated,
      contestMultiple,
      contestsProblemsSolved,
      contestProblemMultiple,
      UserData.TotalProblemsSolved,
      problemMultiple
    )

    return { score, contests: contestRefs }
  } catch (err) {
    console.error('Error populating contest and performance data:', err)
    throw err
  }
}

const fetchPlatformData = async (
  student,
  platform,
  fetchFunction,
  platformKey
) => {
  try {
    const data = await fetchFunction(student[platformKey].username)
    if (data.error) {
      console.error(
        `Error in fetching data for ${platform} ${student[platformKey].username} rollNo: ${student.rollNo}`
      )
      return { error: true, data: null }
    }
    return { error: false, data }
  } catch (err) {
    console.error(`Error fetching ${platform} data for ${student.rollNo}:`, err)
    return { error: true, data: null }
  }
}

const updateStudentPlatformData = async (
  student,
  platform,
  response,
  platformData,
  platformKey
) => {
  student[platformKey] = {
    username: student[platformKey].username,
    score: platform === 'interviewbit' ? platformData.score : response.score,
    TotalProblemsSolved: platformData.TotalProblemsSolved,
    ...(platform === 'interviewbit'
      ? { platformScore: platformData.platformScore }
      : { contests: response.contests })
  }
}

const processStudentData = async student => {
  const rollNo = student.rollNo
  let currStudent = await Students.findOne({ rollNo })

  if (!currStudent) {
    console.error(`Student with rollNo ${rollNo} not found.`)
    return false
  }

  let totalScore = 0
  currStudent.isError = {
    leetcode: false,
    codeforces: false,
    codechef: false,
    interviewbit: false
  }

  // LeetCode
  let { error, data } = await fetchPlatformData(
    currStudent,
    'leetcode',
    fetchLeetCodeDataWithLimit,
    'leetcode'
  )
  if (!error) {
    const response = await populateDataOfContestAndPerformance(
      rollNo,
      'leetcode',
      data.ContestsData,
      data.PerformancesData,
      data.UserData,
      50,
      20,
      10
    )
    await updateStudentPlatformData(
      currStudent,
      'leetcode',
      response,
      data.UserData,
      'leetcode'
    )
    totalScore += response.score
  } else {
    currStudent.isError.leetcode = true
    await currStudent.save()
  }

  // CodeChef
  ({ error, data } = await fetchPlatformData(
    currStudent,
    'codechef',
    scrapeCodeChef,
    'codechef'
  ))
  if (!error) {
    const response = await populateDataOfContestAndPerformance(
      rollNo,
      'codechef',
      data.ContestsData,
      data.PerformancesData,
      data.UserData,
      20,
      10,
      5
    )
    await updateStudentPlatformData(
      currStudent,
      'codechef',
      response,
      data.UserData,
      'codechef'
    )
    totalScore += response.score
  } else {
    currStudent.isError.codechef = true
    await currStudent.save()
  }

  // Codeforces
  ({ error, data } = await fetchPlatformData(
    currStudent,
    'codeforces',
    fetchCodeforcesContestsData,
    'codeforces'
  ))
  if (!error) {
    const response = await populateDataOfContestAndPerformance(
      rollNo,
      'codeforces',
      data.ContestsData,
      data.PerformancesData,
      data.UserData,
      50,
      1,
      15
    )
    await updateStudentPlatformData(
      currStudent,
      'codeforces',
      response,
      data.UserData,
      'codeforces'
    )
    totalScore += response.score
  } else {
    currStudent.isError.codeforces = true
    await currStudent.save()
  }

  // InterviewBit
  ({ error, data } = await fetchPlatformData(
    currStudent,
    'interviewbit',
    InterviewBitInfo,
    'interviewbit'
  ))
  if (!error) {
    await updateStudentPlatformData(
      currStudent,
      'interviewbit',
      null,
      data,
      'interviewbit'
    )
    totalScore += data.score
  } else {
    currStudent.isError.interviewbit = true
    await currStudent.save()
  }

  currStudent.pastScore = currStudent.totalScore || 0
  currStudent.totalScore = totalScore
  currStudent.streak =
    totalScore > currStudent.pastScore ? currStudent.streak + 1 : 0

  await currStudent.save()
  return true
}

let numberOfStudent = 0
async function getDataOfStudents (batches) {
  try {
    for (const batch of batches) {
      for (const student of batch) {
        numberOfStudent++
        console.log('Processing Student:', numberOfStudent, student.rollNo)
        await processStudentData(student)
      }
    }
  } catch (err) {
    console.error('Error updating student data:', err)
    throw err
  }
}

async function refreshData () {
  try {
    const students = await Students.find()
    const batches = []
    const batchSize = 40

    for (let i = 0; i < students.length; i += batchSize) {
      batches.push(students.slice(i, i + batchSize))
    }

    await getDataOfStudents(batches)
    console.log('All Students Data Updated')
    return batches
  } catch (err) {
    console.error('Error creating batches:', err)
    throw err
  }
}

const addStudentIntoDB = async student => {
  try {
    const newStudent = await Students.create(student)
    return newStudent
  } catch (err) {
    console.error('Error adding student into DB:', err)
    throw err
  }
}

const getDataOfStudent = async (rollNo, year, branch) => {
  try {
    console.log('Processing Student:', rollNo)
    const startTime = new Date()

    const student = await Students.findOne({ rollNo, year, branch })
    if (!student) {
      console.error(
        `Student with rollNo ${rollNo} ${year} ${branch} not found.`
      )
      return {
        error: true,
        message: `Student with rollNo ${rollNo} ${year} ${branch} not found.`
      }
    }

    const errorObject = student.isError
    if (Object.values(errorObject).some(val => val)) {
      console.error('Error in fetching data for student: ', rollNo, errorObject)
      return {
        error: true,
        message: 'Error in fetching data for student',
        errorObject
      }
    }

    const success = await processStudentData(student)
    if (!success) {
      return {
        error: true,
        message: 'Error in updating student data'
      }
    }

    const endTime = new Date()
    return {
      student,
      timeTaken: endTime - startTime,
      error: false
    }
  } catch (err) {
    console.error('Error updating student data:', err)
    return {
      error: true,
      message: 'Error in updating student data'
    }
  }
}

const updateStudentsByRollNumbers = async rollNumbers => {
  try {
    const results = []
    const students = await Students.find({ rollNo: { $in: rollNumbers } })

    if (students.length === 0) {
      console.error('No students found for the provided roll numbers.')
      return {
        error: true,
        message: 'No students found for the provided roll numbers.',
        results: []
      }
    }

    for (const student of students) {
      console.log(`Processing Student: ${student.rollNo}`)
      const success = await processStudentData(student)
      results.push({
        rollNo: student.rollNo,
        success,
        message: success
          ? 'Student data updated successfully'
          : 'Failed to update student data'
      })
    }

    const failedUpdates = results.filter(result => !result.success)
    if (failedUpdates.length > 0) {
      console.log(
        `Some students failed to update: ${failedUpdates
          .map(r => r.rollNo)
          .join(', ')}`
      )
    } else {
      console.log('All specified students updated successfully.')
    }

    return {
      error: failedUpdates.length > 0,
      message:
        failedUpdates.length > 0
          ? 'Some students failed to update'
          : 'All students updated successfully',
      results
    }
  } catch (err) {
    console.error('Error updating students by roll numbers:', err)
    return {
      error: true,
      message: 'Error updating students by roll numbers',
      results: []
    }
  }
}

// refresh by branch & year
const refreshByBranchAndYear = async (year, branch) => {
  try {
    const students = await Students.find({
      year: year,
      branch: branch
    })
    const batches = []
    const batchSize = 40
    for (let i = 0; i < students.length; i += batchSize) {
      batches.push(students.slice(i, i + batchSize))
    }
    await getDataOfStudents(batches)
    console.log('Initialized refresh for branch:', branch, 'year:', year)
    return students
  } catch (err) {
    console.error('Error creating batches:', err)
    throw err
  }
}

module.exports = {
  createStudent,
  pushStudents,
  refreshData,
  addStudentIntoDB,
  getDataOfStudent,
  updateStudentsByRollNumbers,
  refreshByBranchAndYear
}
