# Logistic Regression Pseudocode for Student Risk Prediction

This document outlines a simplified machine learning approach—specifically, a logistic regression-style model—designed to predict a student's "Risk Score" and corresponding "Risk Level" using data fetched from the existing EduGuardPlus APIs (Marks, Attendance, and Homework Status).

## 1. Feature Engineering (Input Variables)

The algorithm relies on three primary features extracted from the API responses:

1.  **$x_1$ (Marks Percentage):** Average of all available marks.
    *   *Source:* Derived from `Students/${sid}/marks` or calculated from a separate 'Marks' API if one exists.
2.  **$x_2$ (Attendance Percentage):** Percentage of days present out of total recorded days.
    *   *Source:* Calculated from `Attendance/${cid}.json`.
3.  **$x_3$ (Homework Completion Rate):** Percentage of assigned homework completed successfully.
    *   *Source:* Calculated by aggregating data from `HomeworkStatus/${hwId}.json` for specific student IDs.

## 2. Algorithm Setup: The Logistic Function

Logistic regression predicts the probability $P$ that an event occurs. In this case, the event is: *The student is at high risk of academic failure/dropping out.*

The formula for the probability $P$ is:

$$P(Risk) = \frac{1}{1 + e^{-z}}$$

Where $z$ is the linear combination of the input features and their respective weights:

$$z = w_0 + (w_1 \cdot x_1) + (w_2 \cdot x_2) + (w_3 \cdot x_3)$$

### Weight Initialization (Heuristic Approach)
Since we are writing a pseudocode implementation without a trained dataset to learn the actual weights via Gradient Descent, we assign *heuristic weights*. Since higher marks, attendance, and homework completion should *decrease* the risk, the weights will be negative. The intercept ($w_0$) establishes a baseline risk.

*   $w_0$ (Intercept): $5.0$ (High baseline risk if all inputs are 0)
*   $w_1$ (Marks Weight): $-0.04$
*   $w_2$ (Attendance Weight): $-0.03$
*   $w_3$ (Homework Weight): $-0.02$

*(These weights mean: Marks have the highest impact on reducing risk, followed by attendance, then homework).*

## 3. Pseudocode Implementation

```javascript
/* 
  Function to calculate the Risk Score and Level for a student
  Inputs:
    - marksPct: numeric (0 - 100)
    - attendancePct: numeric (0 - 100)
    - homeworkPct: numeric (0 - 100)
  Outputs:
    - { riskScore: numeric (0-100), riskLevel: string ('LOW', 'MEDIUM', 'HIGH') }
*/

function calculateRisk(marksPct, attendancePct, homeworkPct) {
    // 1. Define Heuristic Weights
    const w0_intercept = 5.0;
    const w1_marks = -0.04;
    const w2_attendance = -0.03;
    const w3_homework = -0.02;

    // Handle missing data (fallback to 50% or appropriate average if data is null)
    let x1 = (marksPct !== null && marksPct !== undefined) ? marksPct : 50;
    let x2 = (attendancePct !== null && attendancePct !== undefined) ? attendancePct : 50;
    let x3 = (homeworkPct !== null && homeworkPct !== undefined) ? homeworkPct : 50;

    // 2. Calculate the Linear Equation (z)
    let z = w0_intercept + (w1_marks * x1) + (w2_attendance * x2) + (w3_homework * x3);

    // 3. Apply the Logistic Function (Sigmoid)
    // Math.exp(-z) calculates e^(-z)
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
        level: riskLevel
    };
}
```

## 4. Integration with APIs

To use this function in the `Algo.js` utility, the flow would roughly look like this:

```javascript
// Pseudocode for data aggregation before calling calculateRisk()

async function getStudentRiskAnalysis(studentId, classId, token) {
    // 1. Fetch Student Data (for marks)
    let studentData = await get(`Students/${studentId}.json`, token);
    let marksPct = studentData.marks;

    // 2. Fetch Attendance Data and calculate percentage
    let attendanceData = await get(`Attendance/${classId}.json`, token);
    let attendancePct = calculateAttendancePercentage(attendanceData, studentId);

    // 3. Fetch Homework Data and calculate completion rate
    // Note: Due to Firebase RTDB structure, this requires fetching homework for the class,
    // then checking HomeworkStatus for each hwId to see if studentId completed it.
    let homeworkPct = calculateHomeworkCompletionRate(classId, studentId, token);

    // 4. Calculate Risk
    let riskResult = calculateRisk(marksPct, attendancePct, homeworkPct);

    // 5. (Optional) Save back to database
    await updateStudentRisk(studentId, riskResult.score, riskResult.level, token);

    return riskResult;
}
```

## 5. Future Improvement: Actual ML Training
Currently, this pseudocode uses heuristic (guessed) weights. To make this a true Machine Learning model:
1.  **Data Collection:** Collect historical data of students (Marks, Attendance, Homework) along with a firm label (Failed/Passed or Dropped Out/Stayed).
2.  **Training:** Run a Logistic Regression training algorithm (using scikit-learn in Python or TensorFlow.js) on this historical dataset to find the *optimal* weights ($w_0, w_1, w_2, w_3$) that minimize prediction error.
3.  **Deployment:** Replace the heuristic weights in the `calculateRisk` function above with the trained weights.
