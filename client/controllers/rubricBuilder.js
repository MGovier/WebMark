/**
 * JS for Rubric builder in scheme designer.
 */

 Template.rubricBuilder.helpers({
   rubricObject: function() {
     return Session.get('rubricObject');
   },
   canUndo: function() {
     return Session.get('rubricHistory').length > 0;
   },
   randomExample: function(index) {
     let examples = ['writing quality', 'level of documentation',
       'testing strategy', 'detail of analysis', 'referencing'];
     return examples[index % examples.length];
   },
   randomCriterion: function (index) {
     let criteria = ['unfinished', 'excellent', 'inconsistent',
       'only meets basic requirements', 'shows originality'];
     return criteria[index % criteria.length];
   }
 });

Template.rubricBuilder.events({
  'click .add-criterion': function(evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
      id = $(evt.currentTarget).closest('.rubric-table').attr('data-uuid');
    rObjs.forEach((rubric) => {
      if (rubric.uuid === id) {
        rubric.rows.push({
          uuid: UI._globalHelpers.generateUUID()
        });
      }
    });
    Session.set('rubricObject', rObjs);
  },
  'click .add-aspect': function(evt) {
    evt.preventDefault();
    let rObj = Session.get('rubricObject');
    rObj.push({
      uuid: UI._globalHelpers.generateUUID(),
      rows: [{
        uuid: UI._globalHelpers.generateUUID()
      }],
      maxMark: 0
    });
    Session.set('rubricObject', rObj);
  },
  'click .rubric-array-remove': function(evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
      rowId = $(evt.currentTarget).closest('tr').attr('data-uuid'),
      tableId = $(evt.currentTarget).closest('table').attr('data-uuid');
    rObjs.forEach((rubric) => {
      if (rubric.uuid === tableId) {
        let maxMark = 0;
        rubric.rows = rubric.rows.filter((row) => {
          return row.uuid !== rowId;
        });
        rubric.rows.forEach((row) => {
          if (row.criteriaValue > maxMark) {
            maxMark = row.criteriaValue;
          }
        });
        rubric.maxMark = maxMark;
      }
    });
    Session.set('rubricObject', rObjs);
  },
  'click .remove-aspect': function(evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
      id = $(evt.currentTarget).closest('.rubric-table').attr('data-uuid');
    rObjs = rObjs.filter((rubric) => {
      return rubric.uuid !== id;
    });
    Session.set('rubricObject', rObjs);
  },
  'change input': function() {
    let rObj = [],
      $tables = $('.rubric-table');
    $tables.each((index, table) => {
      let $rows = $(table).children('tbody').children('tr'),
        rows = [],
        maxMark = 0,
        rubric = {};
      rubric.aspect = $(table).find('input[name="rubric-aspect"]').val();
      rubric.uuid = $(table).attr('data-uuid');
      $rows.each((index, row) => {
        let rowObj = {};
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
    Session.set('rubricObject', rObj);
  },
  'keydown input[name="criteria-value"]': function(evt) {
    let $table = $(evt.currentTarget).closest('table'),
      $lastRow = $table.find('tr:last'),
      lastRowId = $lastRow.attr('data-uuid'),
      eventId = $(evt.currentTarget).closest('tr').attr('data-uuid');
    if (eventId === lastRowId) {
      if (evt.keyCode === 9 && !evt.shiftKey &&
          ($(evt.currentTarget).val() ||
          $lastRow.find('input[name="criteria"]').val().length > 0)) {
            evt.preventDefault();
            $table.find('.add-criterion').trigger('click');
            Meteor.setTimeout(function() {
              $table.find('tr:last input[name="criteria"]').focus();
            }, 100);
      }
    }
  },
  'keydown input': function(evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      // Translate that return into a tab...
      let e = jQuery.Event('keydown', {
        keyCode: 9
      });
      $(evt.currentTarget).trigger(e);
    }
  },
  'click .duplicate-aspect': function(evt) {
    evt.preventDefault();
    let rObj = Session.get('rubricObject'),
      id = $(evt.currentTarget).closest('.rubric-table').attr('data-uuid');
    rObj.forEach((rubric) => {
      if (rubric.uuid === id) {
        let newRows = [];
        rubric.rows.forEach((row) => {
          newRows.push({
            uuid: UI._globalHelpers.generateUUID(),
            criteria: row.criteria,
            criteriaValue: row.criteriaValue
          });
        });
        rObj.push({
          aspect: rubric.aspect,
          uuid: UI._globalHelpers.generateUUID(),
          rows: newRows,
          maxMark: rubric.maxMark
        });
      }
    });
    Session.set('rubricObject', rObj);
  }
});
