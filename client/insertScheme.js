Template.insertScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();
  $.getScript('dragula.min.js', function () {
    var lastItem;
    drake = dragula({
      isContainer: function (el) {
        return el.classList.contains('dragula-container');
      }
    });
    drake.on('dragend', function(item, tar, source, sibling) {
      $('.rubric-table input:first').trigger('change');
      let rObj = Session.get('rubricObject');
      Session.set('rubricObject', []);
      Meteor.setTimeout( function () {
        Session.set('rubricObject', rObj);
      }, 80);
    });
  });
});

Template.insertScheme.created = function () {
  Session.setDefault('adjustmentAllowed', false);
  Session.setDefault('rubricObject', [{
    uuid: UI._globalHelpers.generateUUID(),
    rows: [{uuid: UI._globalHelpers.generateUUID()}],
    maxMark: 0
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
};

var resetSession = function () {
  Session.set('adjustmentAllowed', false);
  Session.set('rubricObject', [{
    uuid: UI._globalHelpers.generateUUID(),
    rows: [{uuid: UI._globalHelpers.generateUUID()}],
    maxMark: 0
  }]);
  Session.set('comments', [{
    uuid: UI._globalHelpers.generateUUID()
  }]);
  Session.set('rubricHistory', []);
  Session.set('unitName', UI._globalHelpers.generateFunName());
  Session.set('editingName', false);
  Session.set('commentHistory', []);
  // Keep track of if rubric or comment field should be undone.
  Session.set('actionHistory', []);
};

var totalMarksFunction = function () {
  let rObjs = Session.get('rubricObject'),
      totalMarks = 0;
  rObjs.forEach((rubric) => {
    totalMarks += rubric.maxMark;
  });
  return totalMarks;
};

Template.insertScheme.helpers({
  totalMarks: totalMarksFunction,
  unitName: function () {
    return Session.get('unitName');
  },
  editingName: function () {
    return Session.get('editingName');
  }
});


Template.insertScheme.events({
  'click .submit-scheme': function(evt) {
    let form = $('#marking-scheme-form')[0];
    if (form.checkValidity()) {
      $('.submit-scheme').removeClass('submit-scheme').addClass('loading');
      evt.preventDefault();
      let schemaObject = {
        'name': $('input[name="scheme-name"]').val(),
        'description': $('textarea[name="scheme-desc"]').val(),
        'createdAt': new Date(),
        'aspects': Session.get('rubricObject'),
        'comments': Session.get('comments'),
        'adjustmentValuePositive': $('input[name="adjustment-positive"]').val(),
        'adjustmentValueNegative': $('input[name="adjustment-negative"]').val(),
        'maxMarks': totalMarksFunction()
      };
      // If connected, we can wait for server acceptance. If not, we'll uhh... hope it's fine.
      if (Meteor.status().connected) {
        Meteor.call('addScheme', schemaObject, (error, result) => {
          if (error) {
            console.log(error.message, error.details);
          } else {
            $('.submit-scheme').removeClass('loading').addClass('submit-scheme');
            resetSession();
            form.reset();
            Router.go('dashboard');
          }
        });
      } else {
        Meteor.call('addScheme', schemaObject);
        $('.submit-scheme').removeClass('loading').addClass('submit-scheme');
        resetSession();
        form.reset();
        Router.go('dashboard');
      }
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
    if (evt.keyCode == 90 && evt.metaKey) {
      alert("Ctrl+z");
    } else if (evt.keyCode === 13 && $(evt.currentTarget).attr('name') == "scheme-name") {
      evt.preventDefault();
      $('textarea[name="scheme-desc"]').focus();
    }
    // TODO: UNDO THINGS!
  },
  'click .reset-scheme': function (evt) {
    evt.preventDefault();
    $('.ui.basic.reset-check.modal')
      .modal({
        closable  : false,
        onApprove : function() {
          document.getElementById("marking-scheme-form").reset();
          $('input[name="scheme-name"]').val(Session.get('unitName'));
        },
        detachable: false
      }).modal('show');
  }
});

Template.rubricBuilder.helpers({
  rubricObject: function () {
    return Session.get('rubricObject');
  },
  pickColour: function (index) {
    let colours = ['blue', 'orange', 'green', 'yellow', 
                    'teal', 'violet', 'grey', 'pink'];
    return colours[index % colours.length];
  },
  canUndo: function() {
    return Session.get('rubricHistory').length > 0;
  }
});

Template.rubricBuilder.events({
  'click .add-criterion': function (evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
        id = $(evt.currentTarget).closest('div .grid').attr('data-uuid');
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
      rows: [{uuid: UI._globalHelpers.generateUUID()}],
      maxMark: 0
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
        let maxMark = 0;
        rubric.rows = rubric.rows.filter((row) => {
          return row.uuid != rowId;
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
  'click .remove-aspect': function (evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
        id = $(evt.currentTarget).closest('div .grid').attr('data-uuid');
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
      let $table = $('table[data-uuid="' + rubric.uuid + '"]'),
          $rows = $table.children('tbody').children('tr'),
          rows = [],
          maxMark = 0;
      rubric.aspect = $table.find('input[name="rubric-aspect"]').val();
      $rows.each((index, row) => {
        let rowObj = {};
        rowObj.uuid = $(row).attr('data-uuid');
        rowObj.criteria = $(row).find('input[name="criteria"]').val();
        // Parse if defined. Use base 10.
        if ($(row).find('input[name="criteria-value"]').val() !== undefined) {
          rowObj.criteriaValue = parseInt($(row).find('input[name="criteria-value"]').val(), 10);
        }
        if (rowObj.criteriaValue > maxMark) {
          maxMark = rowObj.criteriaValue;
        }
        rows.push(rowObj);
      })
      rubric.rows = rows;
      rubric.maxMark = maxMark;
    });

    let actionHistory = Session.get('actionHistory');
    actionHistory.push('rubric');
    Session.set('actionHistory', actionHistory);
    Session.set('rubricHistory', historyArray);
    Session.set('rubricObject', rObjs);
    
  },
  'keydown input[name="criteria-value"]': function (evt) {
    let id = $(evt.currentTarget).closest('table').attr('data-uuid'),
        $table = $('table[data-uuid="' + id + '"]');
        $lastRow = $table.find('tr:last');
        lastRowId = $lastRow.attr('data-uuid');
        eventId = $(evt.currentTarget).closest('tr').attr('data-uuid');
    if (eventId === lastRowId) {
      if (evt.keyCode === 9 && !evt.shiftKey && ($(evt.currentTarget).val() || $lastRow.find('input[name="criteria"]').val().length > 0)) {
        evt.preventDefault();
        $('div[data-uuid="' + id +'"]').find('.add-criterion').trigger('click');
        Meteor.setTimeout(function() { $table.find('tr:last input[name="criteria"]').focus(); }, 100);
      }
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
        id = $(evt.currentTarget).closest('div .grid').attr('data-uuid'),
        historyArray = Session.get('rubricHistory');

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
          rows: newRows,
          maxMark: rubric.maxMark
        });
      }
    });
    historyArray.push(rObj);
    Session.set('rubricHistory', historyArray);
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