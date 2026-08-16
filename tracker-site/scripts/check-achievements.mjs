import assert from 'node:assert/strict'
import { buildAchievementData, getStudentStats, scoreToXp } from '../src/utils/achievements.mjs'

assert.equal(scoreToXp(0, 4), 0)
assert.equal(scoreToXp(1, 4), 10)
assert.equal(scoreToXp(2, 4), 20)
assert.equal(scoreToXp(3, 4), 30)
assert.equal(scoreToXp(4, 4), 40)
assert.equal(scoreToXp(5, 5), 40)
assert.equal(getStudentStats({ hw1: 0 }, 1, 4).level, 'New Student')
assert.equal(getStudentStats({ hw1: 1, hw2: 0, hw3: 0 }, 3, 4).level, 'Bronze')
assert.equal(getStudentStats({ hw1: 4, hw2: 4, hw3: 0 }, 3, 4).level, 'Silver')
assert.equal(getStudentStats({ hw1: 4, hw2: 4, hw3: 4, hw4: 4, hw5: 4 }, 5, 4).level, 'Gold')

const students = [
  { id: 'a', name: 'Alex', hw1: 4, hw2: 4, hw3: 4, hw4: 4, hw5: 4, homeworkCompletedAt: { hw5: 200 } },
  { id: 'b', name: 'Blair', hw1: 4, hw2: 4, hw3: 4, hw4: 4, hw5: 4, homeworkCompletedAt: { hw5: 100 } },
]
const result = buildAchievementData(students, ['1', '2', '3', '4', '5'])
assert.equal(result.summary.totalCompleted, 10)
assert.equal(result.summary.totalStars, 10)
assert.equal(result.summary.groupProgress, 100)
assert.equal(result.fastFinisherId, 'b')
assert.deepEqual([...result.studentOfMonthIds].sort(), ['a', 'b'])
const empty = buildAchievementData([], [])
assert.equal(empty.summary.groupProgress, 0)
assert.equal(empty.summary.currentLeader, 'No scores yet')
console.log('Achievement calculations: all checks passed')
