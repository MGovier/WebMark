/**
 * Utilities package.
 * Exports all functions for use by specific module imports.
 */

import { adjectives, scientists } from './naming.js';

function generateUUID() {
  // Source: User 'broofa' at StackOverflow:
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Calculate total marks for this scheme using the max mark for each rubric.
 */
function calculateTotalMarks(scheme) {
  const rObjs = scheme.get('rubricObject');
  let totalMarks = 0;
  if (rObjs) {
    rObjs.forEach((rubric) => {
      totalMarks += rubric.maxMark;
    });
  }
  return totalMarks;
}

function generateFunName() {
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}
 ${scientists[Math.floor(Math.random() * scientists.length)]}`;
}

/**
 * Reset session variables. Used on submission.
 * UUIDs not ideal, but used for tracking drag-and-drop and deletion.
 */
function resetSchemeData(dict) {
  dict.set('rubricObject', [{
    uuid: generateUUID(),
    rows: [{
      uuid: generateUUID(),
    }],
    maxMark: 0,
  }]);
  dict.set('comments', [{
    uuid: generateUUID(),
  }]);
  dict.set('schemeName', generateFunName());
  dict.set('unitCode', '');
  dict.set('editingName', false);
  dict.set('commentHistory', []);
}

/**
 * Generate a JSON file from template data.
 * @param  {Object} template  Data used to render this instance.
 * @return {Object}           JSON object of all data rows.
 */
function generateJSON(template) {
  const output = {
    schemeName: template.data.markingScheme.name,
    schemeCreator: Meteor.user().profile.name,
    exportTime: new Date(),
    reportCount: template.data.marks.count(),
    reports: [],
    maxMarks: template.data.markingScheme.maxMarks,
  };
  function addMark(report) {
    output.reports.push({
      marker: report.marker,
      studentNo: report.studentNo,
      marks: report.marks,
      aspects: report.aspects,
      presetComments: report.presetComments,
      comment: report.freeComment,
      adjustment: report.adjustment,
    });
  }
  template.data.marks.forEach(addMark);
  return output;
}

/**
 * Generate a CSV file from template data.
 * @param  {Object} template  Data used to render this instance.
 * @return {String}           CSV formatted data.
 */
function generateCSV(template) {
  // Create CSV header first.
  let output = 'Student No,Marker,Marks,Max Marks,Preset Comments,Comment';
  template.data.markingScheme.aspects.forEach((aspect) => {
    output += `,"${aspect.aspect} Level","${aspect.aspect} Mark","${aspect.aspect} Max Mark"`;
  });
  output += ',Adjustment\n';

  // Function to run on each data row.
  function addMark(report) {
    output += `"${report.studentNo}"`;
    output += `,"${report.marker}"`;
    output += `,${report.marks}`;
    output += `,${report.maxMarks}`;
    output += `,"${report.presetComments}"`;
    output += `,"${report.freeComment}"`;
    report.aspects.forEach(aspect => {
      output += `,"${aspect.selected}"`;
      output += `,${aspect.mark}`;
      output += `,${aspect.maxMark}`;
    });
    output += `,${(report.adjustment || 0)}`;
    output += '\n';
  }

  template.data.marks.forEach(addMark);
  return output;
}

export {
  generateUUID,
  generateFunName,
  resetSchemeData,
  calculateTotalMarks,
  generateCSV,
  generateJSON,
};
