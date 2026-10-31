import PDFDocument from "pdfkit";

/**
 * Service to generate professional downloadable PDF reports
 * for candidates (growth-focused) and interviewers (assessment-focused).
 */
export const pdfService = {
  /**
   * Generates a Candidate Learning Report PDF.
   * Excludes any confidential hiring rubrics or interviewer notes.
   */
  generateCandidatePdf(report, writeStream) {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(writeStream);

    const cr = report.candidateReport || {};
    const candidateName = report.candidate?.name || "Candidate";
    const dateStr = new Date(report.generatedAt || Date.now()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Brand Header
    doc.rect(40, 40, 515, 60).fill("#1e293b");
    doc.fillColor("#ffffff").fontSize(20).text("TalentIQ", 55, 52, { bold: true });
    doc.fontSize(11).fillColor("#94a3b8").text("Candidate Technical Growth & Learning Report", 55, 78);
    doc.fontSize(9).fillColor("#cbd5e1").text(`Date: ${dateStr}  |  Session: ${report.session?.toString() || ""}`, 320, 78, { align: "right", width: 220 });

    doc.moveDown(3);
    doc.fillColor("#0f172a");

    // Candidate Meta Bar
    doc.rect(40, 115, 515, 36).fill("#f1f5f9");
    doc.fillColor("#0f172a").fontSize(11).text(`Candidate: ${candidateName}`, 55, 126, { bold: true });
    doc.fontSize(10).fillColor("#475569").text(`Problem: ${cr.problemSummary || "Coding Assessment"}`, 280, 126);

    let yPos = 165;

    // Section 1: Executive Summary & Execution Results
    doc.fontSize(13).fillColor("#0284c7").text("1. Execution & Assessment Summary", 40, yPos, { bold: true });
    yPos += 20;

    const exec = cr.executionSummary || {};
    const passRate = exec.totalTests > 0 ? Math.round((exec.passedTests / exec.totalTests) * 100) : 0;

    doc.fontSize(10).fillColor("#334155").text(cr.summary || "Evaluation completed.", 40, yPos, { width: 515 });
    yPos += 30;

    // Stat boxes
    doc.rect(40, yPos, 160, 45).fillAndStroke("#f8fafc", "#e2e8f0");
    doc.fillColor("#64748b").fontSize(9).text("Pass Rate", 50, yPos + 8);
    doc.fillColor("#0284c7").fontSize(14).text(`${passRate}% (${exec.passedTests || 0}/${exec.totalTests || 0})`, 50, yPos + 22, { bold: true });

    doc.rect(215, yPos, 160, 45).fillAndStroke("#f8fafc", "#e2e8f0");
    doc.fillColor("#64748b").fontSize(9).text("Status", 225, yPos + 8);
    doc.fillColor(exec.executionStatus === "Accepted" ? "#16a34a" : "#ea580c").fontSize(12).text(exec.executionStatus || "Evaluated", 225, yPos + 24, { bold: true });

    doc.rect(390, yPos, 165, 45).fillAndStroke("#f8fafc", "#e2e8f0");
    doc.fillColor("#64748b").fontSize(9).text("Language", 400, yPos + 8);
    doc.fillColor("#334155").fontSize(12).text((exec.language || "javascript").toUpperCase(), 400, yPos + 24, { bold: true });

    yPos += 60;

    // Section 2: Algorithmic Approach & Complexity
    doc.fontSize(13).fillColor("#0284c7").text("2. Algorithmic Approach & Complexity", 40, yPos, { bold: true });
    yPos += 18;

    const app = cr.approachAnalysis || {};
    doc.fontSize(10).fillColor("#1e293b").text(`Approach: ${app.approach || "Standard Implementation"}`, 40, yPos);
    yPos += 16;
    doc.fontSize(10).fillColor("#475569").text(`Time Complexity: ${app.timeComplexity || "N/A"}  |  Space Complexity: ${app.spaceComplexity || "N/A"}`, 40, yPos);
    yPos += 16;
    if (app.complexityNotes) {
      doc.fontSize(9).fillColor("#64748b").text(`Notes: ${app.complexityNotes}`, 40, yPos, { width: 515 });
      yPos += 24;
    }

    // Section 3: Concrete Improvements & Edge Cases
    doc.fontSize(13).fillColor("#0284c7").text("3. Code Improvements & Missed Edge Cases", 40, yPos, { bold: true });
    yPos += 18;

    const improvements = cr.codeImprovements || [];
    const edgeCases = cr.missedEdgeCases || [];

    improvements.slice(0, 3).forEach((item) => {
      doc.fontSize(9).fillColor("#334155").text(`- [Improvement] ${item}`, 45, yPos, { width: 510 });
      yPos += 14;
    });

    edgeCases.slice(0, 2).forEach((item) => {
      doc.fontSize(9).fillColor("#dc2626").text(`- [Edge Case] ${item}`, 45, yPos, { width: 510 });
      yPos += 14;
    });

    yPos += 10;

    // Check if we need a new page for 7-day study plan
    if (yPos > 600) {
      doc.addPage();
      yPos = 50;
    }

    // Section 4: 7-Day Personalized Study Roadmap
    doc.fontSize(13).fillColor("#0284c7").text("4. Personalized 7-Day Actionable Study Plan", 40, yPos, { bold: true });
    yPos += 20;

    const plan = cr.studyPlan7Days || [];
    plan.slice(0, 7).forEach((dayItem) => {
      if (yPos > 740) {
        doc.addPage();
        yPos = 45;
      }
      doc.rect(40, yPos, 515, 20).fill("#f8fafc");
      doc.fillColor("#0f172a").fontSize(9).text(`Day ${dayItem.day}: ${dayItem.focus}`, 45, yPos + 5, { bold: true });
      yPos += 24;

      (dayItem.tasks || []).forEach((t) => {
        doc.fontSize(8.5).fillColor("#475569").text(`  * ${t}`, 50, yPos, { width: 500 });
        yPos += 12;
      });
      yPos += 4;
    });

    yPos += 10;
    if (yPos > 700) {
      doc.addPage();
      yPos = 45;
    }

    // Section 5: ML Adaptive Recommendations
    doc.fontSize(13).fillColor("#0284c7").text("5. Machine Learning Practice Recommendations", 40, yPos, { bold: true });
    yPos += 18;

    const recs = cr.mlPracticeRecommendations || [];
    recs.forEach((rec) => {
      doc.fontSize(9).fillColor("#334155").text(`* ${rec}`, 45, yPos, { width: 510 });
      yPos += 14;
    });

    // Footer
    doc.fontSize(8).fillColor("#94a3b8").text("Generated by TalentIQ AI & ML Intelligence Engine. Confidential candidate learning material.", 40, 780, { align: "center", width: 515 });

    doc.end();
  },

  /**
   * Generates an Interviewer Assessment Report PDF.
   * Includes hiring rubric, scores, private interviewer notes, and candidate competencies.
   */
  generateInterviewerPdf(report, writeStream) {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(writeStream);

    const ir = report.interviewerReport || {};
    const dateStr = new Date(report.generatedAt || Date.now()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Confidential Header
    doc.rect(40, 40, 515, 60).fill("#0f172a");
    doc.fillColor("#ffffff").fontSize(18).text("TalentIQ", 55, 50, { bold: true });
    doc.fontSize(11).fillColor("#f87171").text("CONFIDENTIAL  |  Hiring Assessment & Interview Evaluation", 55, 75, { bold: true });
    doc.fontSize(9).fillColor("#cbd5e1").text(`Date: ${dateStr}`, 400, 75, { align: "right", width: 140 });

    let yPos = 120;

    // Candidate & Session Meta Table
    doc.rect(40, yPos, 515, 55).fillAndStroke("#f8fafc", "#cbd5e1");
    doc.fillColor("#0f172a").fontSize(10).text(`Candidate: ${ir.candidateName || report.candidate?.name || "N/A"}`, 50, yPos + 10, { bold: true });
    doc.fontSize(9).fillColor("#475569").text(`Email: ${ir.candidateEmail || report.candidate?.email || "N/A"}`, 50, yPos + 24);
    doc.text(`Problem Evaluated: ${ir.problemTitle || "Coding Task"} (${ir.difficulty || "Medium"})`, 50, yPos + 38);

    doc.fontSize(9).fillColor("#475569").text(`Session ID: ${report.session?.toString() || ""}`, 300, yPos + 10);
    doc.text(`Interviewer: ${report.interviewer?.name || "Technical Interviewer"}`, 300, yPos + 24);

    yPos += 75;

    // Overall Hiring Recommendation & Score
    const rec = ir.overallRecommendation || "Hire";
    const score = ir.overallScore || 4.0;
    const isHire = rec.toLowerCase().includes("hire") && !rec.toLowerCase().includes("no hire");

    doc.rect(40, yPos, 250, 55).fillAndStroke(isHire ? "#f0fdf4" : "#fef2f2", isHire ? "#86efac" : "#fca5a5");
    doc.fillColor("#64748b").fontSize(9).text("Hiring Recommendation", 50, yPos + 10);
    doc.fillColor(isHire ? "#16a34a" : "#dc2626").fontSize(16).text(rec, 50, yPos + 26, { bold: true });

    doc.rect(305, yPos, 250, 55).fillAndStroke("#f8fafc", "#cbd5e1");
    doc.fillColor("#64748b").fontSize(9).text("Overall Technical Score", 315, yPos + 10);
    doc.fillColor("#0284c7").fontSize(16).text(`${score} / 5.0`, 315, yPos + 26, { bold: true });

    yPos += 75;

    // Technical Competencies Breakdown
    doc.fontSize(12).fillColor("#0f172a").text("1. Technical Competencies Evaluation", 40, yPos, { bold: true });
    yPos += 18;

    const comps = ir.technicalCompetencies || [];
    comps.forEach((c) => {
      doc.rect(40, yPos, 515, 30).fillAndStroke("#ffffff", "#e2e8f0");
      doc.fillColor("#0f172a").fontSize(9.5).text(c.skill, 50, yPos + 8, { bold: true });
      doc.fillColor("#0284c7").fontSize(10).text(`${c.score}/5`, 340, yPos + 8, { bold: true });
      doc.fillColor("#475569").fontSize(8.5).text(c.evidence || "", 50, yPos + 20, { width: 495 });
      yPos += 36;
    });

    yPos += 10;

    // Code Correctness & Evidence
    doc.fontSize(12).fillColor("#0f172a").text("2. Automated Code Correctness & Test Evidence", 40, yPos, { bold: true });
    yPos += 16;
    doc.fontSize(9.5).fillColor("#334155").text(ir.codeCorrectnessEvidence || "Automated test suite evaluated.", 45, yPos, { width: 510 });
    yPos += 20;

    // Interviewer Private Notes
    doc.fontSize(12).fillColor("#0f172a").text("3. Confidential Interviewer Notes", 40, yPos, { bold: true });
    yPos += 16;
    doc.rect(40, yPos, 515, 45).fillAndStroke("#fffbeb", "#fde68a");
    doc.fillColor("#78350f").fontSize(9).text(ir.interviewerPrivateNotes || "No private notes provided by the interviewer.", 48, yPos + 8, { width: 500 });
    yPos += 58;

    // Rubric Assessment Criteria
    doc.fontSize(12).fillColor("#0f172a").text("4. Hiring Rubric Alignment", 40, yPos, { bold: true });
    yPos += 16;

    const rubric = ir.rubricAssessment || [];
    rubric.forEach((item) => {
      const badge = item.met ? "[PASSED]" : "[NEEDS WORK]";
      const color = item.met ? "#16a34a" : "#dc2626";
      doc.fillColor(color).fontSize(9).text(badge, 45, yPos, { bold: true });
      doc.fillColor("#334155").fontSize(9).text(` ${item.criteria}: ${item.notes || ""}`, 110, yPos, { width: 440 });
      yPos += 16;
    });

    yPos += 10;

    // Strengths & Concerns
    if (yPos > 680) {
      doc.addPage();
      yPos = 45;
    }

    doc.fontSize(12).fillColor("#0f172a").text("5. Key Strengths & Potential Concerns", 40, yPos, { bold: true });
    yPos += 16;

    (ir.strengths || []).forEach((s) => {
      doc.fillColor("#16a34a").fontSize(9).text(`+ [Strength] ${s}`, 45, yPos, { width: 510 });
      yPos += 14;
    });

    (ir.concerns || []).forEach((c) => {
      doc.fillColor("#dc2626").fontSize(9).text(`- [Concern] ${c}`, 45, yPos, { width: 510 });
      yPos += 14;
    });

    // Footer
    doc.fontSize(8).fillColor("#94a3b8").text("CONFIDENTIAL: Strictly for internal hiring decision-making. Not for external dissemination.", 40, 780, { align: "center", width: 515 });

    doc.end();
  },
};

export default pdfService;
