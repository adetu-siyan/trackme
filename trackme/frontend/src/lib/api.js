import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function getAuthHeaders() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    const { data: refreshed } = await supabase.auth.refreshSession()
    if (!refreshed.session) throw new Error('Not authenticated')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshed.session.access_token}`,
    }
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  }
}

async function request(method, path, body = null) {
  const headers = await getAuthHeaders()
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE}/api${path}`, options)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || `Request failed: ${res.status}`)
  }

  return data
}

// For multipart/form-data requests (file uploads)
async function requestFormData(method, path, formData) {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    const { data: refreshed } = await supabase.auth.refreshSession()
    if (!refreshed.session) throw new Error('Not authenticated')
    
    const res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${refreshed.session.access_token}`,
      },
      body: formData,
    })
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.detail || `Request failed: ${res.status}`)
    }
    
    return res.json()
  }

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || `Request failed: ${res.status}`)
  }

  return res.json()
}

// ============================================================
// LOGS
// ============================================================
export const logsApi = {
  create: (body) => request('POST', '/logs/create', body),
  generateQuestion: (body) => request('POST', '/logs/generate-question', body),
  verifyAnswer: (body) => request('POST', '/logs/verify-answer', body),
  edit: (body) => request('PUT', '/logs/edit', body),
  sendToMentor: (body) => request('POST', '/logs/send-to-mentor', body),
  myLogs: () => request('GET', '/logs/my-logs'),
  streak: () => request('GET', '/logs/streak'),
  delete: (logId) => request('DELETE', `/logs/${logId}`),
  matchTasks: (body) => request('POST', '/logs/match-tasks', body),
}

// ============================================================
// MENTEE (mentor reads these)
// ============================================================
export const menteeApi = {
  getLogs: (menteeId) => request('GET', `/logs/mentee/${menteeId}`),
  getOverview: (menteeId) => request('GET', `/logs/mentee/${menteeId}/overview`),
}

// ============================================================
// PROJECTS
// ============================================================
export const projectsApi = {
  // Regular JSON create (backward compatible)
  create: (body) => request('POST', '/projects/create', body),
  
  // Multipart form data create with file uploads
  createWithFiles: (formData) => requestFormData('POST', '/projects/create', formData),
  
  // Get available mentees for project assignment
  getAvailableMentees: () => request('GET', '/projects/available-mentees'),
  
  myProjects: () => request('GET', '/projects/my-projects'),
  myMentees: () => request('GET', '/projects/mentees'),
  getCompletion: (projectId) => request('GET', `/projects/${projectId}/completion`),
  endProject: (projectId) => request('PATCH', `/projects/end/${projectId}`),
}

// ============================================================
// WEEKLY FOCUS
// ============================================================
export const weeklyFocusApi = {
  create: (body) => request('POST', '/projects/weekly-focus/create', body),
  getMenteeFocus: (menteeId) => request('GET', `/projects/weekly-focus/mentee/${menteeId}`),
  myTasks: () => request('GET', '/projects/weekly-focus/my-tasks'),
  updateTask: (taskId, completed) => request('PATCH', `/projects/weekly-tasks/${taskId}`, { completed }),
  updateTaskContent: (taskId, body) => request('PATCH', `/projects/weekly-tasks/${taskId}/content`, body),
  history: () => request('GET', '/projects/weekly-focus/history'),
  sendReview: (focusId, previewData) => request('POST', `/projects/weekly-focus/${focusId}/send-review`, previewData || {}),
  getReviewPreview: (focusId) => request('GET', `/projects/weekly-focus/${focusId}/review-preview`),
  updateFocusSummary: (focusId, summary) => request('PATCH', `/projects/weekly-focus/${focusId}/summary`, { summary }),
  addMentorNote: (taskId, mentor_note) => request('PATCH', `/projects/weekly-tasks/${taskId}/content`, { mentor_note }),
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notificationsApi = {
  list: () => request('GET', '/notifications'),
  markRead: (id) => request('PUT', `/notifications/${id}/read`),
  markAllRead: () => request('PUT', '/notifications/read-all'),
}

// ============================================================
// PROFILE
// ============================================================
export const profileApi = {
  get: () => request('GET', '/profile'),
  update: (body) => request('PUT', '/profile', body),
}

// ============================================================
// MENTOR
// ============================================================
export const mentorApi = {
  request: (body) => request('POST', '/mentor/request', body),
  respond: (body) => request('POST', '/mentor/respond', body),
  myMentor: () => request('GET', '/mentor/my-mentor'),
  myMentees: () => request('GET', '/mentor/my-mentees'),
}

// ============================================================
// GROUPS
// ============================================================
export const groupsApi = {
  create: (body) => request('POST', '/groups/create', body),
  myGroups: () => request('GET', '/groups/my-groups'),
  addMember: (groupId, body) => request('POST', `/groups/${groupId}/add-member`, body),
  removeMember: (groupId, menteeId) => request('DELETE', `/groups/${groupId}/remove-member/${menteeId}`),
  dashboard: (groupId) => request('GET', `/groups/${groupId}/dashboard`),
  analytics: (groupId) => request('GET', `/groups/${groupId}/analytics`),
  setWeeklyFocus: (groupId, body) => request('POST', `/groups/${groupId}/weekly-focus`, body),
  getMenteeReview: (groupId, menteeId) => request('GET', `/groups/${groupId}/mentee/${menteeId}/review`),
  delete: (groupId) => request('DELETE', `/groups/${groupId}`),
}

// ============================================================
// ROADMAP
// ============================================================
export const roadmapApi = {
  validate: (headers, sampleRows) => request('POST', '/roadmap/validate', { headers, sample_rows: sampleRows }),
  save: (menteeId, body) => request('POST', `/roadmap/save/${menteeId}`, body),
  delete: (menteeId) => request('DELETE', `/roadmap/${menteeId}`),
  getMenteeRoadmap: (menteeId) => request('GET', `/roadmap/mentee/${menteeId}`),
  checkDelays: () => request('POST', '/roadmap/check-delays'),
  myGuide: () => request('GET', '/roadmap/my-guide'),
  completeTask: (taskId) => request('POST', `/roadmap/task/${taskId}/complete`),
  submitTest: (testId, answers) => request('POST', `/roadmap/test/${testId}/submit`, { answers }),
  getTestResults: (testId) => request('GET', `/roadmap/test/${testId}/results`),
  taskInstructions: (taskTitle, unitGoal) => request('POST', '/roadmap/task-instructions', { task_title: taskTitle, unit_goal: unitGoal }),
}


// import { supabase } from './supabase'

// const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// async function getAuthHeaders() {
//   const { data: { session }, error } = await supabase.auth.getSession()

//   if (error || !session) {
//     const { data: refreshed } = await supabase.auth.refreshSession()
//     if (!refreshed.session) throw new Error('Not authenticated')
//     return {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${refreshed.session.access_token}`,
//     }
//   }

//   return {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${session.access_token}`,
//   }
// }

// async function request(method, path, body = null) {
//   const headers = await getAuthHeaders()
//   const options = { method, headers }
//   if (body) options.body = JSON.stringify(body)

//   const res = await fetch(`${BASE}/api${path}`, options)
//   const data = await res.json()

//   if (!res.ok) {
//     throw new Error(data.detail || `Request failed: ${res.status}`)
//   }

//   return data
// }

// // ============================================================
// // LOGS
// // ============================================================
// export const logsApi = {
//   create: (body) => request('POST', '/logs/create', body),
//   generateQuestion: (body) => request('POST', '/logs/generate-question', body),
//   verifyAnswer: (body) => request('POST', '/logs/verify-answer', body),
//   edit: (body) => request('PUT', '/logs/edit', body),
//   sendToMentor: (body) => request('POST', '/logs/send-to-mentor', body),
//   myLogs: () => request('GET', '/logs/my-logs'),
//   streak: () => request('GET', '/logs/streak'),
//   delete: (logId) => request('DELETE', `/logs/${logId}`),
//   matchTasks: (body) => request('POST', '/logs/match-tasks', body),
// }

// // ============================================================
// // MENTEE (mentor reads these)
// // ============================================================
// export const menteeApi = {
//   getLogs: (menteeId) => request('GET', `/logs/mentee/${menteeId}`),
//   getOverview: (menteeId) => request('GET', `/logs/mentee/${menteeId}/overview`),
// }

// // ============================================================
// // PROJECTS
// // ============================================================
// export const projectsApi = {
//   create: (body) => request('POST', '/projects/create', body),
//   myProjects: () => request('GET', '/projects/my-projects'),
//   myMentees: () => request('GET', '/projects/mentees'),
//   getCompletion: (projectId) => request('GET', `/projects/${projectId}/completion`),
//   endProject: (projectId) => request('PATCH', `/projects/end/${projectId}`),
// }

// // ============================================================
// // WEEKLY FOCUS
// // ============================================================
// export const weeklyFocusApi = {
//   create: (body) => request('POST', '/projects/weekly-focus/create', body),
//   getMenteeFocus: (menteeId) => request('GET', `/projects/weekly-focus/mentee/${menteeId}`),
//   myTasks: () => request('GET', '/projects/weekly-focus/my-tasks'),
//   updateTask: (taskId, completed) => request('PATCH', `/projects/weekly-tasks/${taskId}`, { completed }),
//   updateTaskContent: (taskId, body) => request('PATCH', `/projects/weekly-tasks/${taskId}/content`, body),
//   history: () => request('GET', '/projects/weekly-focus/history'),
//   sendReview: (focusId, previewData) => request('POST', `/projects/weekly-focus/${focusId}/send-review`, previewData || {}),
//   getReviewPreview: (focusId) => request('GET', `/projects/weekly-focus/${focusId}/review-preview`),
// }

// // ============================================================
// // NOTIFICATIONS
// // ============================================================
// export const notificationsApi = {
//   list: () => request('GET', '/notifications'),
//   markRead: (id) => request('PUT', `/notifications/${id}/read`),
//   markAllRead: () => request('PUT', '/notifications/read-all'),
// }

// // ============================================================
// // PROFILE
// // ============================================================
// export const profileApi = {
//   get: () => request('GET', '/profile'),
//   update: (body) => request('PUT', '/profile', body),
// }

// // ============================================================
// // MENTOR
// // ============================================================
// export const mentorApi = {
//   request: (body) => request('POST', '/mentor/request', body),
//   respond: (body) => request('POST', '/mentor/respond', body),
//   myMentor: () => request('GET', '/mentor/my-mentor'),
//   myMentees: () => request('GET', '/mentor/my-mentees'),
// }