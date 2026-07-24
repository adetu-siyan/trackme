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
  create: (body) => request('POST', '/projects/create', body),
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