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
}

// ============================================================
// WEEKLY FOCUS
// ============================================================
export const weeklyFocusApi = {
  // Mentor creates focus for a mentee
  create: (body) => request('POST', '/projects/weekly-focus/create', body),
  // Mentor views a mentee's current week
  getMenteeFocus: (menteeId) => request('GET', `/projects/weekly-focus/mentee/${menteeId}`),
  // Mentee views their own tasks
  myTasks: () => request('GET', '/projects/weekly-focus/my-tasks'),
  // Mentee toggles a task
  updateTask: (taskId, completed) => request('PATCH', `/projects/weekly-tasks/${taskId}`, { completed }),
  // Get all past weeks
  history: () => request('GET', '/projects/weekly-focus/history'),
  // Send weekly review email
  sendReview: (focusId) => request('POST', `/projects/weekly-focus/${focusId}/send-review`),
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