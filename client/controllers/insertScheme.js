/**
 * JS for new marking scheme functionality.
 */

import dragula from 'dragula';

const newScheme = new ReactiveDict('newScheme');

/**
 * Called when template inserted into DOM.
 * Initialise Semantic UI components and Dragula listener.
 */
Template.insertScheme.onRendered(function() {
  // SEMANTIC UI
  $('.ui.checkbox').checkbox();
  $('.unit-select').dropdown({
    allowAdditions: true,
    maxSelections: false,
    onChange: (value) => {
      newScheme.set('unitCode', value);
      $('textarea[name="scheme-desc"]').focus();
    },
  });
  $('.tooltip-buttons button').popup({
    inline: false,
    position: 'top left'
  });
  $('.name-field').trigger('click');
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
    let rObj = newScheme.get('rubricObject');
    newScheme.set('rubricObject', []);
    Meteor.setTimeout(function() {
      newScheme.set('rubricObject', rObj);
    }, 80);
  });
  this.rubric = newScheme.get('rubric');
  // If session var is defined, use that for the option value.
  if (newScheme.get('unitCode')) {
    $('.unit-select').dropdown('set selected', newScheme.get('unitCode'));
  }
});

/**
 * Define default variables the first time this template is rendered.
 */
Template.insertScheme.onCreated(() => {
  newScheme.setDefault('rubricObject', [{
    uuid: UI._globalHelpers.generateUUID(),
    rows: [{
      uuid: UI._globalHelpers.generateUUID()
    }],
    maxMark: 0
  }]);
  newScheme.setDefault('comments', [{
    uuid: UI._globalHelpers.generateUUID()
  }]);
  newScheme.setDefault('schemeName', UI._globalHelpers.generateFunName());
  newScheme.setDefault('unitCode', '');
  newScheme.setDefault('editingName', false);
  newScheme.setDefault('commentHistory', []);
});

 /**
  * Helper functions.
  */
Template.insertScheme.helpers({
  rubric: function() {
    return newScheme.get('rubricObject');
  },
  totalMarks: totalMarksFunction,
  schemeName: function() {
    return newScheme.get('schemeName');
  },
  editingName: function() {
    return newScheme.get('editingName');
  },
  isThisSelected: function() {
    return true;
  },
  newScheme: function() {
    return newScheme;
  }
});

/**
 * Event listeners.
 */
Template.insertScheme.events({
  'click .submit-scheme': function(evt) {
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
        'unitCode': newScheme.get('unitCode'),
        'aspects': newScheme.get('rubricObject'),
        'comments': newScheme.get('comments'),
        'adjustmentValuePositive': $('input[name="adjustment-positive"]').val(),
        'adjustmentValueNegative': $('input[name="adjustment-negative"]').val(),
        'maxMarks': totalMarksFunction()
      };
      // Call Meteor function to add data to DB. This will run offline first.
      Meteor.call('addScheme', schemaObject, (error) => {
        if (error) {
          // Alert user to error.
          sAlert.error(error.message, error.details);
          $('.scheme-submit-button').removeClass('loading')
            .addClass('submit-scheme');
        }
      });
      // If no error, show success notification.
      sAlert.success(schemaObject.name + ' added!', {
        position: 'top-right',
        onRouteClose: false,
        offset: 60
      });

      $('.scheme-submit-button').removeClass('loading')
        .addClass('submit-scheme');
      resetSchemeData();
      form.reset();
      // Send user to dashboard to use or share the new scheme.
      Router.go('dashboard');
    }
    // Semantic validation could be added here for additional user guidance.
  },
  'click .scheme-submit-button .loading': function(evt) {
    evt.preventDefault();
  },
  // Change name field to input when selected.
  'click .name-field': function() {
    newScheme.set('editingName', true);
    setTimeout(function() {
      $('input[name="scheme-name"]').select();
    }, 100);
  },
  // Change the input back to heading after they leave.
  'blur input[name="scheme-name"]': function() {
    newScheme.set('editingName', false);
    newScheme.set('schemeName', $('input[name="scheme-name"]').val());
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

// UTILITY FUNCTIONS

/**
 * Reset session variables. Used on submission.
 * UUIDs not ideal, but used for tracking drag-and-drop and deletion.
 */
function resetSchemeData() {
  newScheme.set('rubricObject', [{
    uuid: UI._globalHelpers.generateUUID(),
    rows: [{
      uuid: UI._globalHelpers.generateUUID()
    }],
    maxMark: 0
  }]);
  newScheme.set('comments', [{
    uuid: UI._globalHelpers.generateUUID()
  }]);
  newScheme.set('schemeName', UI._globalHelpers.generateFunName());
  newScheme.set('unitCode', '');
  newScheme.set('editingName', false);
  newScheme.set('commentHistory', []);
}

/**
 * Calculate total marks for this scheme using the max mark for each rubric.
 */
function totalMarksFunction() {
  let rObjs = newScheme.get('rubricObject'),
    totalMarks = 0;
  rObjs.forEach((rubric) => {
    totalMarks += rubric.maxMark;
  });
  return totalMarks;
}
