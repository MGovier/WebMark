/**
 * Utilities package.
 * Exports all functions for use by specific module imports.
 */

import { adjectives, scientists } from './naming.js';

/**
 * Create a unique ID string according to standard.
 * Source: User 'broofa' at StackOverflow:
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * @return {String} UUID
 */
function generateUUID() {
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
  dict.set('description', '');
}

/**
 * Generate a JSON file from template data.
 * @param  {Object} template  Data used to render this instance.
 * @return {Object}           JSON object of all data rows.
 */
function generateJSON(markingScheme, marks) {
  const output = {
    schemeName: markingScheme.name,
    schemeCreator: Meteor.user().profile.name,
    exportTime: new Date(),
    reportCount: marks.count(),
    reports: [],
    maxMarks: markingScheme.maxMarks,
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
  marks.forEach(addMark);
  return output;
}

/**
 * Generate a CSV file from template data.
 * @param  {Object} template  Data used to render this instance.
 * @return {String}           CSV formatted data.
 */
function generateCSV(markingScheme, marks) {
  // Create CSV header first.
  let output = 'Student No,Marker,Marks,Max Marks,Preset Comments,Comment';
  markingScheme.aspects.forEach((aspect) => {
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

  marks.forEach(addMark);
  return output;
}

/**
 * Count marks from rubric selections and adjustment.
 * @todo Abstract this.
 * @return {Number} Total marks.
 */
function countMarks() {
  let total = 0;
  const aspects = Template.instance().aspects.get();
  aspects.forEach((aspect) => {
    total += aspect.mark;
  });
  const adjustment = parseInt($('input[name="adjustment"]').val(), 10) || 0;
  Template.instance().marks.set(total + adjustment);
}

/**
 * Create an object of all toggled re-usable comments.
 * @return {Array} Active comments.
 */
function buildCommentsObject() {
  const comments = [];
  $('.preset-comments input[type="checkbox"]:checked')
    .each((index, comment) => {
      comments.push($(comment).siblings('label').text());
    });
  return comments;
}

const validationRules = {
  schemeName: {
    identifier: 'scheme-name',
    rules: [
      {
        type: 'empty',
        prompt: 'Please enter a name for this scheme',
      },
    ],
  },
  aspectName: {
    identifier: 'rubric-aspect',
    rules: [
      {
        type: 'empty',
        prompt: 'Please enter an aspect for this rubric.',
      },
    ],
  },
  criterionValue: {
    identifier: 'criteria-value',
    rules: [
      {
        type: 'empty',
        prompt: 'Please enter a mark value for this criterion.',
      },
      {
        type: 'number',
        prompt: 'Please use a number for criterion values.',
      },
    ],
  },
};

function initValidation() {
  $('#marking-scheme-form').form({
    fields: validationRules,
    inline: true,
    keyboardShortcuts: false,
    onFailure() {
      sAlert.warning('Some errors were found. They\'ve been highlighted!',
      { position: 'top-right', timeout: 5000 });
    },
  });
}

// Export all functions.
export {
  generateUUID,
  generateFunName,
  resetSchemeData,
  calculateTotalMarks,
  generateCSV,
  generateJSON,
  countMarks,
  buildCommentsObject,
  initValidation,
};
