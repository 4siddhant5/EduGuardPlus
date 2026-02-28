// src/services/api.js

const BASE_URL = 'https://eduguard-fc5a0-default-rtdb.firebaseio.com';

const get = async (path, token = null) => {
  const url = `${BASE_URL}/${path}.json${token ? `?auth=${token}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
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

// ─── Students ────────────────────────────────────────────────────────────────
export const getAllStudents = (token) => get('Students', token);
export const getStudent = (sid, token) => get(`Students/${sid}`, token);

// ─── Classes ─────────────────────────────────────────────────────────────────
export const getAllClasses = (token) => get('Classes', token);
export const getClass = (cid, token) => get(`Classes/${cid}`, token);

// ─── Attendance ──────────────────────────────────────────────────────────────
export const getAttendance = (token) => get('Attendance', token);
export const getClassAttendance = (cid, token) => get(`Attendance/${cid}`, token);

// ─── Homework ─────────────────────────────────────────────────────────────────
export const getAllHomework = (token) => get('Homework', token);
export const getClassHomework = (cid, token) => get(`Homework/${cid}`, token);

// ─── HomeworkStatus ──────────────────────────────────────────────────────────
export const getHomeworkStatus = (hwId, token) => get(`HomeworkStatus/${hwId}`, token);

// ─── Notices ─────────────────────────────────────────────────────────────────
export const getAllNotices = (token) => get('Notices', token);

// ─── Users ───────────────────────────────────────────────────────────────────
export const getAllUsers = (token) => get('Users', token);

// ─── TeacherCounter ──────────────────────────────────────────────────────────
export const getTeacherCounter = (token) => get('TeacherCounter', token);
