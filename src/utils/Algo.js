// src/utils/Algo.js

/**
 * Calculates a risk score based on Marks, Attendance, and Homework completion using a logistic model.
 * 
 * Heuristic Weights:
 * - w0 (intercept): 5.0
 * - w1 (Marks weight): -0.04
 * - w2 (Attendance weight): -0.03
 * - w3 (Homework weight): -0.02
 * 
 * @param {number} marksPct - Score out of 100
 * @param {number} attendancePct - Percentage (0-100)
 * @param {number} homeworkPct - Percentage (0-100)
 * @returns {object} { score, riskLevel }
 */
export const calculateRiskScore = (marksPct, attendancePct, homeworkPct) => {
    // 1. Define Heuristic Weights
    const w0_intercept = 5.0;
    const w1_marks = -0.04;
    const w2_attendance = -0.03;
    const w3_homework = -0.02;

    // Handle missing/invalid data (fallback to 50% average to prevent extreme outliers if data null)
    let x1 = (marksPct !== null && marksPct !== undefined && !isNaN(marksPct)) ? Number(marksPct) : 50;
    let x2 = (attendancePct !== null && attendancePct !== undefined && !isNaN(attendancePct)) ? Number(attendancePct) : 50;
    let x3 = (homeworkPct !== null && homeworkPct !== undefined && !isNaN(homeworkPct)) ? Number(homeworkPct) : 50;

    // 2. Calculate the Linear Equation (z)
    let z = w0_intercept + (w1_marks * x1) + (w2_attendance * x2) + (w3_homework * x3);

    // 3. Apply the Logistic Function (Sigmoid)
    let probabilityOfRisk = 1 / (1 + Math.exp(-z));

    // 4. Convert Probability to a 0-100 Score
    let riskScore = Math.round(probabilityOfRisk * 100);

    // 5. Determine Risk Level Classification
    let riskLevel = "LOW";

    if (riskScore >= 70) {
        riskLevel = "HIGH";
    } else if (riskScore >= 40) {
        riskLevel = "MEDIUM";
    } else {
        riskLevel = "LOW";
    }

    return {
        score: riskScore,
        riskLevel,
    };
};
