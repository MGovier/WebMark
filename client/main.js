Meteor.startup(() => {
  $('html').attr('lang', 'en');
});

Meteor.subscribe('markingSchemes');

Template.main.onRendered(() => {
  $('.ui.menu .ui.dropdown').dropdown({
      on: 'hover'
    });
});

Template.markScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();
});

Template.insertScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();
  $.getScript('dragula.min.js', function () {
    let loaded = new Event('dragulaReady');
    document.dispatchEvent(loaded);
  });
});

Session.setDefault('adjustmentAllowed', false);
Session.setDefault('rubricObject', [{
  uuid: UI._globalHelpers.generateUUID(),
  rows: [{uuid: UI._globalHelpers.generateUUID()}],
}]);
Session.setDefault('comments', [{
  uuid: UI._globalHelpers.generateUUID()
}]);
Session.setDefault('rubricHistory', []);
Session.setDefault('unitName', UI._globalHelpers.generateFunName());
Session.setDefault('editingName', false);
Session.setDefault('commentHistory', []);
// Keep track of if rubric or comment field should be undone.
Session.setDefault('actionHistory', []);

Template.insertScheme.helpers({
  totalMarks: function () {
    let rObjs = Session.get('rubricObject'),
        totalMarks = 0;
    rObjs.forEach((rubric) => {
      let max = 0;
      rubric.rows.forEach((r) => {
        if (r.criteriaValue !== undefined && r.criteriaValue > max) {
          max = r.criteriaValue;
        } 
      });
      totalMarks += max;
    });
    return totalMarks;
  },
  'unitName': function () {
    return Session.get('unitName');
  },
  'editingName': function () {
    return Session.get('editingName');
  }
});

Template.insertScheme.events({
  'click .submit-scheme': function(evt) {
    let form = $('#marking-scheme-form')[0];
    if (form.checkValidity()) {
      evt.preventDefault();
      let schemaObject = {
        'name': $('input[name="scheme-name"]').val(),
        'description': $('textarea[name="scheme-desc"]').val(),
        'createdAt': new Date(),
        'aspects': Session.get('rubricObject'),
        'comments': Session.get('comments'),
        'adjustmentValuePositive': $('input[name="adjustment-positive"]').val(),
        'adjustmentValueNegative': $('input[name="adjustment-negative"]').val()
      };
      Meteor.call('addScheme', schemaObject, (error, result) => {
        if (error) {
          console.log(error.message, error.details);
        } else {
          Session.set('adjustmentAllowed', false);
          Session.set('rubricObject', [{
            uuid: UI._globalHelpers.generateUUID(),
            rows: [{uuid: UI._globalHelpers.generateUUID()}],
          }]);
          Session.set('comments', [{
            uuid: UI._globalHelpers.generateUUID()
          }]);
          Session.set('rubricHistory', []);
          Session.set('unitName', UI._globalHelpers.generateFunName());
          Session.set('editingName', false);
          Session.set('commentHistory', []);
          Session.set('actionHistory', []);
          form.reset();
          Router.go('/viewSchemes');
        }
      });
    } else {
      // Semantic validation checks
    }
  },
  'click .name-field': function () {
    Session.set('editingName', true);
    setTimeout(function() { $('input[name="scheme-name"]').select(); }, 100);

  },
  'blur input[name="scheme-name"]': function () {
    Session.set('editingName', false);
    Session.set('unitName', $('input[name="scheme-name"]').val());
  },
  'keydown': function (evt) {
    // Meta key works for ctrl on windows and cmd on mac.
    if (evt.keyCode == 90 && evt.metaKey) alert("Ctrl+z");
    // TODO: UNDO THINGS!
  }
});

Template.rubricBuilder.helpers({
  rubricObject: function () {
    return Session.get('rubricObject');
  },
  pickColour: function (index) {
    let colours = ['blue', 'pink', 'orange', 'green', 'yellow', 
                    'teal', 'violet', 'grey'];
    return colours[index % colours.length];
  },
  isLast: function (index) {
    let rObjs = Session.get('rubricObject'),
        className = '';
    rObjs.forEach((rubric) => {
      rubric.rows.forEach((r) => {
        if (r.uuid == this.uuid) {
          if (index === rubric.rows.length - 1) {
            className = 'last-row';
          }
        }
      });
    });
    return className;
  },
  canUndo: function() {
    return Session.get('rubricHistory').length > 0;
  }
});

Template.rubricBuilder.events({
  'click .add-criterion': function (evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
        id = $(evt.currentTarget).closest('table').attr('data-uuid');
    rObjs.forEach((rubric) => {
      if (rubric.uuid == id) {
        rubric['rows'].push({uuid: UI._globalHelpers.generateUUID()});
      }
    });
    Session.set('rubricObject', rObjs);
  },
  'click .add-aspect': function (evt) {
    evt.preventDefault();
    let rObj = Session.get('rubricObject');
    rObj.push({
      uuid: UI._globalHelpers.generateUUID(),
      rows: [{uuid: UI._globalHelpers.generateUUID()}]
    });
    Session.set('rubricObject', rObj);
  },
  'click .rubric-array-remove': function (evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
        rowId = $(evt.currentTarget).closest('tr').attr('data-uuid'),
        tableId = $(evt.currentTarget).closest('table').attr('data-uuid');
    rObjs.forEach((rubric) => {
      if (rubric.uuid == tableId) {
        rubric.rows = rubric.rows.filter((row) => {
          return row.uuid != rowId;
        });
      }
    });
    Session.set('rubricObject', rObjs);
  },
  'click .remove-aspect': function (evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
        id = $(evt.currentTarget).closest('table').attr('data-uuid');
    rObjs = rObjs.filter((rubric) => {
      return rubric.uuid != id;
    });
    Session.set('rubricObject', rObjs);
  },
  'change input': function () {
    let rObjs = Session.get('rubricObject'),
        historyArray = Session.get('rubricHistory');
    historyArray.push(rObjs);

    rObjs.forEach((rubric) => {
      let $table = $('table[data-uuid="' + rubric.uuid + '"]');
      rubric.aspect = $table.find('input[name="rubric-aspect"]').val();
      rubric.rows.forEach((row) => {
        let $row = $('tr[data-uuid="' + row.uuid + '"]');
        row.criteria = $row.find('input[name="criteria"]').val();
        // Parse if defined. Use base 10.
        if ($row.find('input[name="criteria-value"]').val() !== undefined) {
          row.criteriaValue = parseInt($row.find('input[name="criteria-value"]').val(), 10);
        }       
      });
    });

    let actionHistory = Session.get('actionHistory');
    actionHistory.push('rubric');
    Session.set('actionHistory', actionHistory);
    Session.set('rubricHistory', historyArray);
    Session.set('rubricObject', rObjs);
  },
  'keydown .last-row input[name="criteria-value"]': function (evt) {
    let id = $(evt.currentTarget).closest('table').attr('data-uuid'),
        $table = $('table[data-uuid="' + id + '"]');
    if (evt.keyCode === 9 && !evt.shiftKey && ($(evt.currentTarget).val() || $table.find('.last-row input[name="criteria"]').val().length > 0)) {
      evt.preventDefault();
      $table.find('.add-criterion').trigger('click');
      setTimeout(function() { $table.find('.last-row input[name="criteria"]').focus(); }, 100);
    }
  },
  'keydown input': function (evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      // Translate that return into a tab...
      let e = jQuery.Event('keydown', { keyCode: 9 });
      $(evt.currentTarget).trigger(e);
    }
  },
  'click .duplicate-aspect': function (evt) {
    evt.preventDefault();
    let rObj = Session.get('rubricObject'),
        id = $(evt.currentTarget).closest('table').attr('data-uuid'),
        historyArray = Session.get('rubricHistory');
    historyArray.push(rObj);
    Session.set('rubricHistory', historyArray);

    rObj.forEach((rubric) => {
      if (rubric.uuid == id) {
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
          rows: newRows
        });
      }
    });

    Session.set('rubricObject', rObj);
  },
  'click .undo-rubric-action': function (evt) {
    evt.preventDefault();
    let historyArray = Session.get('rubricHistory');
    Session.set('rubricObject', historyArray.pop());
    Session.set('rubricHistory', historyArray);
  }
});

Template.commentBuilder.helpers({
  comments: function () {
    return Session.get('comments');
  },
  isLast: function(index) {
    if (index === Session.get('comments').length - 1) {
      return 'last-comment';
    } else {
      return '';
    }
  },
  canUndo: function() {
    return Session.get('commentHistory').length > 0;
  }
});

Template.commentBuilder.events({
  'click .comment-remove': function (evt) {
    evt.preventDefault();
    let comments = Session.get('comments'),
        id = $(evt.currentTarget).closest('.comment-item').attr('data-uuid');
    comments = comments.filter((com) => {
      return com.uuid != id;
    });
    Session.set('comments', comments);
  },
  'click .add-comment': function (evt) {
    evt.preventDefault();
    let comments = Session.get('comments');
    comments.push({uuid: UI._globalHelpers.generateUUID()});
    Session.set('comments', comments);
  },
  'change input': function () {
    let comments = Session.get('comments'),
        commentArray = Session.get('commentHistory');
    comments.forEach((com) => {
      com.comment = $('.comment-item[data-uuid="' + com.uuid + '"] input').val();
    });
    Session.set('comments', comments);
    commentArray.push(comments);
    Session.set('commentHistory', commentArray);

    let actionHistory = Session.get('actionHistory');
    actionHistory.push('comment');
    Session.set('actionHistory', actionHistory);
  },
  'keydown .last-comment': function (evt) {
    if (evt.keyCode === 9 && !evt.shiftKey && $(evt.currentTarget).find('input').val().length > 0) {
      evt.preventDefault();
      $('.add-comment').trigger('click');
      setTimeout(function() { $('.last-comment input').focus(); }, 100);
    }
  },
  'keydown input': function (evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      // Translate that return into a tab...
      var e = jQuery.Event('keydown', { keyCode: 9 });
      $(evt.currentTarget).trigger(e);
    }
  },
  'click .undo-comment-action': function (evt) {
    evt.preventDefault();
    let commentArray = Session.get('commentHistory');
    Session.set('comments', commentArray.pop());
    Session.set('commentHistory', commentArray);
  }
});

Template.viewSchemes.helpers({
  markingSchemes: function () {
    return MarkingSchemes.find({}, {sort: {name: 1}});
  }
});

Template.viewSchemesListItem.helpers({
  friendlyDate: function () {
    return this.createdAt.toLocaleDateString('en-GB');
  }
});

Template.viewSchemesListItem.events({
  'click .delete-scheme': function () {
    console.log('deleting: ', this._id);
    Meteor.call('deleteScheme', this._id);
  }
});
