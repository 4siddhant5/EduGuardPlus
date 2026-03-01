// src/services/api.js

const BASE_URL = 'https://eduguard-fc5a0-default-rtdb.firebaseio.com';

const get = async (path, token = null) => {
  const url = `${BASE_URL}/${path}.json${token ? `?auth=${token}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
};

const post = async (path, data, token = null) => {
  const url = `${BASE_URL}/${path}.json${token ? `?auth=${token}` : ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST failed: ${res.status}`);
  return res.json();
};

const put = async (path, data, token = null) => {
  const url = `${BASE_URL}/${path}.json${token ? `?auth=${token}` : ''}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
  return res.json();
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const getUserRole = (uid, token) => get(`Users/${uid}`, token);

// ─── Admins ──────────────────────────────────────────────────────────────────
export const getAllAdmins = (token) => get('Admins', token);
export const getAdmin = (uid, token) => get(`Admins/${uid}`, token);

// ─── Super Admin ─────────────────────────────────────────────────────────────
export const getSuperAdmins = (token) => get('Super Admin', token);

// ─── Teachers ────────────────────────────────────────────────────────────────
export const getAllTeachers = (token) => get('Teachers', token);
export const getTeacher = (uid, token) => get(`Teachers/${uid}`, token);
export const createTeacher = async (teacherData, token) => {
  const res = await post('Teachers', teacherData, token);
  // Also add them to the Users collection so they can log in and be routed properly
  if (res && res.name) {
    await put(`Users/${res.name}`, {
      email: teacherData.email,
      name: teacherData.name,
      role: 'TEACHER'
    }, token);
  }
  return res;
};

// ─── Students ────────────────────────────────────────────────────────────────
export const getAllStudents = (token) => get('Students', token);
export const getStudent = (sid, token) => get(`Students/${sid}`, token);
export const addStudent = (studentData, token) => post('Students', studentData, token);

// ─── Classes ─────────────────────────────────────────────────────────────────
export const getAllClasses = (token) => get('Classes', token);
export const getClass = (cid, token) => get(`Classes/${cid}`, token);
export const createClass = (classData, token) => post('Classes', classData, token);
export const assignClassToTeacher = async (classId, teacherId, token) => {
  const teacher = await get(`Teachers/${teacherId}`, token);
  if (teacher && teacher.email) {
    await put(`Classes/${classId}/teacherId`, teacherId, token);
    await put(`Classes/${classId}/teacherEmail`, teacher.email, token);
  }
};

// ─── Attendance ──────────────────────────────────────────────────────────────
export const getAttendance = (token) => get('Attendance', token);
export const getClassAttendance = (cid, token) => get(`Attendance/${cid}`, token);
export const markAttendance = (cid, date, data, token) => put(`Attendance/${cid}/${date}`, data, token);

// ─── Homework ─────────────────────────────────────────────────────────────────
export const getAllHomework = (token) => get('Homework', token);
export const getClassHomework = (cid, token) => get(`Homework/${cid}`, token);
export const addHomework = (cid, data, token) => post(`Homework/${cid}`, data, token);

// ─── HomeworkStatus ──────────────────────────────────────────────────────────
export const getHomeworkStatus = (hwId, token) => get(`HomeworkStatus/${hwId}`, token);

// ─── Notices ─────────────────────────────────────────────────────────────────
export const getAllNotices = (token) => get('Notices', token);

// ─── Users ───────────────────────────────────────────────────────────────────
export const getAllUsers = (token) => get('Users', token);

// ─── TeacherCounter ──────────────────────────────────────────────────────────
export const getTeacherCounter = (token) => get('TeacherCounter', token);
