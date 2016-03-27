/**
 * Utilities package.
 * Exports all functions for use by specific module imports.
 */
import uuid from 'node-uuid';
import dragula from 'dragula';

import { adjectives, scientists } from './naming.js';

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
    uuid: uuid.v4(),
    rows: [{
      uuid: uuid.v4(),
    }],
    maxMark: 0,
  }]);
  dict.set('comments', [{
    uuid: uuid.v4(),
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
    output += `,"${report.freeComment ? report.freeComment : ''}"`;
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

function checkFormValidity(form) {
  let result = true;
  form.find('input, textarea').each((index, el) => {
    $(el).parents('div .field').removeClass('error');
    if (!el.checkValidity()) {
      result = false;
      $(el).parents('div .field').addClass('error');
    }
  });
  return result;
}

function initializeNewScheme(newScheme) {
  newScheme.setDefault('rubricObject', [{
    uuid: uuid.v4(),
    rows: [{
      uuid: uuid.v4(),
    }],
    maxMark: 0,
  }]);
  newScheme.setDefault('comments', [{
    uuid: uuid.v4(),
  }]);
  newScheme.setDefault('schemeName', generateFunName());
  newScheme.setDefault('unitCode', '');
  newScheme.setDefault('editingName', false);
  newScheme.setDefault('commentHistory', []);
  newScheme.setDefault('description', '');
  $('.ui.checkbox').checkbox();
  $('.unit-select').dropdown({
    allowAdditions: true,
    maxSelections: false,
    onChange: value => {
      newScheme.set('unitCode', value);
      $('textarea[name="scheme-desc"]').focus();
    },
  });
  $('.tooltip-buttons button').popup({
    inline: false,
    position: 'top left',
  });
  $('.name-field').trigger('click');
  // DRAGULA
  const drake = dragula({
    isContainer(el) {
      return el.classList.contains('dragula-container');
    },
    invalid(el) {
      return el.nodeName === 'INPUT';
    },
  });
  drake.on('dragend', () => {
    $('.rubric-table input:first').trigger('change');
    const rObj = newScheme.get('rubricObject');
    newScheme.set('rubricObject', []);
    Meteor.setTimeout(() => {
      newScheme.set('rubricObject', rObj);
    }, 80);
  });
  // If session var is defined, use that for the option value.
  if (newScheme.get('unitCode')) {
    $('.unit-select').dropdown('set selected', newScheme.get('unitCode'));
  }
}

// Export all functions.
export {
  generateFunName,
  resetSchemeData,
  calculateTotalMarks,
  generateCSV,
  generateJSON,
  countMarks,
  buildCommentsObject,
  checkFormValidity,
  initializeNewScheme,
};
