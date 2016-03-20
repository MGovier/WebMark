import dragula from 'dragula';

Template.editScheme.onRendered(function() {
  let rubricUUIDs = this.data.scheme.aspects;
  rubricUUIDs.forEach(aspect => {
    aspect.uuid = UI._globalHelpers.generateUUID();
    aspect.rows.forEach(row => {
      row.uuid = UI._globalHelpers.generateUUID();
    });
  });

  Session.set('adjustmentAllowed', false);
  Session.set('rubricObject', this.data.scheme.aspects);
  Session.set('comments', this.data.scheme.comments);
  Session.set('schemeName', this.data.scheme.name);
  Session.set('unitCode', this.data.scheme.unitCode);
  Session.set('editingName', false);
  Session.set('commentHistory', []);

  $('input[name="adjustment-positive"]')
    .val(this.data.scheme.adjustmentValuePositive);
  $('input[name="adjustment-negative"]')
    .val(this.data.scheme.adjustmentValueNegative);

  // SEMANTIC UI
  $('.ui.checkbox').checkbox();
  $('.unit-select').dropdown({
    allowAdditions: true,
    maxSelections: false,
    onChange: (value) => {
      Session.set('unitCode', value);
      $('textarea[name="scheme-desc"]').focus();
    },
  });
  $('.tooltip-buttons button').popup({
    inline: false,
    position: 'top left'
  });
  $('.name-field').trigger('click');
  if (Session.get('unitCode') !== 'zzNO_UNIT') {
    $('.unit-select').dropdown('set selected', Session.get('unitCode'));
  }

  // DRAGULA
  var drake = dragula({
    isContainer: function(el) {
      return el.classList.contains('dragula-container');
    },
    invalid: function(el) {
      return el.nodeName === 'INPUT';
    }
  });
  drake.on('dragend', function() {
    $('.rubric-table input:first').trigger('change');
    let rObj = Session.get('rubricObject');
    Session.set('rubricObject', []);
    Meteor.setTimeout(function() {
      Session.set('rubricObject', rObj);
    }, 80);
  });
});

Template.editScheme.onDestroyed(() => {
  Session.set('adjustmentAllowed', false);
  Session.set('rubricObject', [{
    uuid: UI._globalHelpers.generateUUID(),
    rows: [{
      uuid: UI._globalHelpers.generateUUID()
    }],
    maxMark: 0
  }]);
  Session.set('comments', [{
    uuid: UI._globalHelpers.generateUUID()
  }]);
  Session.set('schemeName', UI._globalHelpers.generateFunName());
  Session.set('unitCode', '');
  Session.set('editingName', false);
  Session.set('commentHistory', []);
});

/**
 * Calculate total marks for this scheme using the max mark for each rubric.
 */
var totalMarksFunction = function() {
  let rObjs = Session.get('rubricObject'),
    totalMarks = 0;
  if (!rObjs) {
    return 0;
  }
  rObjs.forEach((rubric) => {
    totalMarks += rubric.maxMark;
  });
  return totalMarks;
};

/**
 * Helper functions.
 */
Template.editScheme.helpers({
  totalMarks: totalMarksFunction,
  schemeName: function() {
    return Session.get('schemeName');
  },
  editingName: function() {
    return Session.get('editingName');
  },
  isThisSelected: function() {
    return true;
  },
  description: function() {
    return Template.instance().data.scheme.description;
  }
});

/**
 * Event listeners.
 */
Template.editScheme.events({
  'click .submit-scheme': function(evt, template) {
    let form = $('#marking-scheme-form')[0];
    if (form.checkValidity()) {
      // Change class to show request is being processed.
      $('.submit-scheme').removeClass('submit-scheme').addClass('loading');
      evt.preventDefault();
      // Serialize data.
      let schemaObject = {
        'name': $('input[name="scheme-name"]').val(),
        'description': $('textarea[name="scheme-desc"]').val(),
        'createdAt': new Date(),
        'unitCode': Session.get('unitCode'),
        'aspects': Session.get('rubricObject'),
        'comments': Session.get('comments'),
        'adjustmentValuePositive': $('input[name="adjustment-positive"]').val(),
        'adjustmentValueNegative': $('input[name="adjustment-negative"]').val(),
        'maxMarks': totalMarksFunction()
      };
      // Call Meteor function to add data to DB. This will run offline first.
      Meteor.call('updateScheme', template.data.scheme._id, schemaObject,
        (error) => {
          if (error) {
            // Alert user to error.
            sAlert.error(error.message, error.details);
            $('.scheme-submit-button').removeClass('loading')
              .addClass('submit-scheme');
            console.log(error);
          }
      });
      // If no error, show success notification.
      sAlert.success(schemaObject.name + ' edited!', {
        position: 'top-right',
        onRouteClose: false,
        offset: 60
      });

      $('.scheme-submit-button').removeClass('loading')
        .addClass('submit-scheme');
      form.reset();
      // Send user to dashboard to use or share the updated scheme.
      Router.go('dashboard');
    }
    // Semantic validation could be added here for additional user guidance.
  },
  'click .scheme-submit-button .loading': function(evt) {
    evt.preventDefault();
  },
  // Change name field to input when selected.
  'click .name-field': function() {
    Session.set('editingName', true);
    setTimeout(function() {
      $('input[name="scheme-name"]').select();
    }, 100);
  },
  // Change the input back to heading after they leave.
  'blur input[name="scheme-name"]': function() {
    Session.set('editingName', false);
    Session.set('schemeName', $('input[name="scheme-name"]').val());
  },
  // Allow return to move between initial inputs
  'keydown': function(evt) {
    if (evt.keyCode === 13 &&
      $(evt.currentTarget).attr('name') === "scheme-name") {
        evt.preventDefault();
        $('#unit-field input').focus();
    } else if (evt.keyCode === 13 &&
      $(evt)[0].target === $('input.search:first')[0]) {
        evt.preventDefault();
        $('textarea[name="scheme-desc"]').focus();
    }
  }
});
