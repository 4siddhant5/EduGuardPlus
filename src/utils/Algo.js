// src/utils/Algo.js

/**
 * Calculates a risk score based on Marks, Attendance, and Homework completion.
 * 
 * Weights:
 * - Marks: 40%
 * - Attendance: 40%
 * - Homework: 20%
 * 
 * @param {number} marks - Score out of 100
 * @param {number} attendance - Percentage (0-100)
 * @param {number} homeworkScore - Percentage (0-100)
 * @returns {object} { score, riskLevel }
 */
export const calculateRiskScore = (marks, attendance, homeworkScore) => {
    // Normalize inputs (fallback to 0 if undefined/NaN)
    const m = Number(marks) || 0;
    const a = Number(attendance) || 0;
    const h = Number(homeworkScore) || 0;

    // Calculate weighted score (out of 100)
    const score = (m * 0.4) + (a * 0.4) + (h * 0.2);

    // Determine Risk Level string
    let riskLevel;
    if (score >= 75) {
        riskLevel = 'Low';
    } else if (score >= 40) {
        riskLevel = 'Medium';
    } else {
        riskLevel = 'High';
    }

    return {
        score: Math.round(score),
        riskLevel,
    };
};
