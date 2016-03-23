/**
 * JS for Rubric builder in scheme designer.
 */
import { generateUUID } from '../lib/utils';

Template.rubricBuilder.helpers({
  rubricObject() {
    return Template.instance().data.scheme.get('rubricObject');
  },
  randomExample(index) {
    const examples = ['writing quality', 'level of documentation',
     'testing strategy', 'detail of analysis', 'referencing'];
    return examples[index % examples.length];
  },
  randomCriterion(index) {
    const criteria = ['unfinished', 'excellent', 'inconsistent',
     'only meets basic requirements', 'shows originality'];
    return criteria[index % criteria.length];
  },
});

Template.rubricBuilder.events({
  'click .add-criterion'(event, templateInstance) {
    event.preventDefault();
    const rObjs = templateInstance.data.scheme.get('rubricObject');
    const id = $(event.currentTarget).closest('.rubric-table').attr('data-uuid');
    rObjs.forEach(rubric => {
      if (rubric.uuid === id) {
        rubric.rows.push({
          uuid: generateUUID(),
        });
      }
    });
    templateInstance.data.scheme.set('rubricObject', rObjs);
  },
  'click .add-aspect'(event, templateInstance) {
    event.preventDefault();
    const rObj = templateInstance.data.scheme.get('rubricObject');
    rObj.push({
      uuid: generateUUID(),
      rows: [{
        uuid: generateUUID(),
      }],
      maxMark: 0,
    });
    templateInstance.data.scheme.set('rubricObject', rObj);
  },
  'click .rubric-array-remove'(event, templateInstance) {
    event.preventDefault();
    const rObjs = templateInstance.data.scheme.get('rubricObject');
    const rowId = $(event.currentTarget).closest('tr').attr('data-uuid');
    const tableId = $(event.currentTarget).closest('table').attr('data-uuid');
    // Most efficient loop through array elements https://jsperf.com/loops
    for (const i in rObjs) {
      if (rObjs.hasOwnProperty(i)) {
        const rubric = rObjs[i];
        if (rubric.uuid === tableId) {
          let maxMark = 0;
          rubric.rows = rubric.rows.filter(row => {
            return row.uuid !== rowId;
          });
          rubric.rows.forEach((row) => {
            if (row.criteriaValue > maxMark) {
              maxMark = row.criteriaValue;
            }
          });
          rubric.maxMark = maxMark;
        }
      }
    }
    templateInstance.data.scheme.set('rubricObject', rObjs);
  },
  'click .remove-aspect'(event, templateInstance) {
    event.preventDefault();
    let rObjs = templateInstance.data.scheme.get('rubricObject');
    const id = $(event.currentTarget).closest('.rubric-table').attr('data-uuid');
    rObjs = rObjs.filter((rubric) => {
      return rubric.uuid !== id;
    });
    templateInstance.data.scheme.set('rubricObject', rObjs);
  },
  'change input'(event, templateInstance) {
    const rObj = [];
    const $tables = $('.rubric-table');
    $tables.each((index, table) => {
      const $rows = $(table).children('tbody').children('tr');
      const rows = [];
      const rubric = {};
      let maxMark = 0;
      rubric.aspect = $(table).find('input[name="rubric-aspect"]').val();
      rubric.uuid = $(table).attr('data-uuid');
      $rows.each((i, row) => {
        const rowObj = {};
        rowObj.uuid = $(row).attr('data-uuid');
        rowObj.criteria = $(row).find('input[name="criteria"]').val();
        // Parse if defined. Use base 10.
        if ($(row).find('input[name="criteria-value"]').val() !== undefined) {
          rowObj.criteriaValue = parseInt($(row)
            .find('input[name="criteria-value"]').val(), 10);
        }
        if (rowObj.criteriaValue > maxMark) {
          maxMark = rowObj.criteriaValue;
        }
        rows.push(rowObj);
      });
      rubric.rows = rows;
      rubric.maxMark = maxMark;
      rObj.push(rubric);
    });
    templateInstance.data.scheme.set('rubricObject', rObj);
  },
  'keydown input[name="criteria-value"]'(event) {
    const $table = $(event.currentTarget).closest('table');
    const $lastRow = $table.find('tr:last');
    const lastRowId = $lastRow.attr('data-uuid');
    const eventId = $(event.currentTarget).closest('tr').attr('data-uuid');
    if (eventId === lastRowId) {
      if (event.keyCode === 9 && !event.shiftKey &&
        ($(event.currentTarget).val() ||
        $lastRow.find('input[name="criteria"]').val().length > 0)) {
        event.preventDefault();
        $table.find('.add-criterion').trigger('click');
        Meteor.setTimeout(() => {
          $table.find('tr:last input[name="criteria"]').focus();
        }, 100);
      }
    }
  },
  'keydown input'(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      // Translate that return into a tab...
      const e = new jQuery.Event('keydown', {
        keyCode: 9,
      });
      $(event.currentTarget).trigger(e);
    }
  },
  'click .duplicate-aspect'(event, templateInstance) {
    event.preventDefault();
    const rObj = templateInstance.data.scheme.get('rubricObject');
    const id = $(event.currentTarget).closest('.rubric-table').attr('data-uuid');
    rObj.forEach((rubric) => {
      if (rubric.uuid === id) {
        const newRows = [];
        rubric.rows.forEach((row) => {
          newRows.push({
            uuid: generateUUID(),
            criteria: row.criteria,
            criteriaValue: row.criteriaValue,
          });
        });
        rObj.push({
          aspect: rubric.aspect,
          uuid: generateUUID(),
          rows: newRows,
          maxMark: rubric.maxMark,
        });
      }
    });
    templateInstance.data.scheme.set('rubricObject', rObj);
  },
});
