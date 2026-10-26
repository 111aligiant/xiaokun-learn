/* ============================================================
   课程包注册表
   —— 新增一条学习路线：写好 course/lessons 数据，在这里加一项即可
   —— 课程包字段：id / name / icon / lang / extension / course / lessons
   ============================================================ */
import { PYTHON_COURSE, PY_LESSONS } from './python-course.js'
import { MYSQL_COURSE, MY_LESSONS } from './mysql-course.js'

export const TRACKS = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    /** 实操台语言：python | sql */
    lang: 'python',
    /** 练习文件后缀 */
    extension: 'py',
    course: PYTHON_COURSE,
    lessons: PY_LESSONS,
  },
  {
    id: 'mysql',
    name: 'MySQL',
    icon: '🗄️',
    lang: 'sql',
    extension: 'sql',
    course: MYSQL_COURSE,
    lessons: MY_LESSONS,
  },
]

export const DEFAULT_TRACK_ID = TRACKS[0].id

export function trackOf(id) {
  return TRACKS.find((t) => t.id === id) || TRACKS[0]
}

export function lessonsOf(id) {
  return trackOf(id).lessons
}

export function findLesson(trackId, lessonId) {
  return trackOf(trackId).lessons.find((l) => l.id === lessonId) || null
}

export function findTrackByLesson(lessonId) {
  return TRACKS.find((t) => t.lessons.some((l) => l.id === lessonId)) || null
}

export function totalLessonCount() {
  return TRACKS.reduce((n, t) => n + t.lessons.length, 0)
}
