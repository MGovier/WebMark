/**
 * JS for new marking scheme functionality.
 */


import { resetSchemeData,
  calculateTotalMarks,
  checkFormValidity,
  initializeNewScheme,
} from '../lib/utils';

const newScheme = new ReactiveDict('newScheme');

Template.insertScheme.onCreated(function created() {
  const self = this;
  self.autorun(() => {
    self.subscribe('units');
  });
  self.autorun(() => {
    if (!Meteor.userId()) {
      FlowRouter.go('landing');
    }
  });
  self.autorun(() => {
    if (self.subscriptionsReady()) {
      Meteor.setTimeout(() => {
        initializeNewScheme(newScheme);
      }, 100);
    }
  });
});

// Call this in case we're offline.
Template.insertScheme.onRendered(() => initializeNewScheme(newScheme));

 /**
  * Helper functions.
  */
Template.insertScheme.helpers({
  rubric() {
    return newScheme.get('rubricObject');
  },
  units() {
    const unitCollection = Units.findOne({ creator: Meteor.userId() });
    return unitCollection ? unitCollection.units : [];
  },
  totalMarks() {
    return calculateTotalMarks(newScheme);
  },
  schemeName() {
    return newScheme.get('schemeName');
  },
  editingName() {
    return newScheme.get('editingName');
  },
  isThisSelected() {
    return true;
  },
  newScheme() {
    return newScheme;
  },
  description() {
    return newScheme.get('description');
  },
});

/**
 * Event listeners.
 */
Template.insertScheme.events({
  'click .submit-scheme'(event) {
    event.preventDefault();
    if (checkFormValidity($('#marking-scheme-form'))) {
      // Change class to show request is being processed.
      $('.submit-scheme').removeClass('submit-scheme').addClass('loading');
      // Serialize data.
      const schemaObject = {
        name: $('input[name="scheme-name"]').val(),
        description: $('textarea[name="scheme-desc"]').val(),
        createdAt: new Date(),
        unitCode: newScheme.get('unitCode'),
        aspects: newScheme.get('rubricObject'),
        comments: newScheme.get('comments'),
        adjustmentValuePositive: $('input[name="adjustment-positive"]').val(),
        adjustmentValueNegative: $('input[name="adjustment-negative"]').val(),
        maxMarks: calculateTotalMarks(newScheme),
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
      sAlert.success(`${schemaObject.name} added!`, {
        position: 'top-right',
        onRouteClose: false,
        offset: 60,
      });
      $('.scheme-submit-button').removeClass('loading')
        .addClass('submit-scheme');
      resetSchemeData(newScheme);
      // Send user to dashboard to use or share the new scheme.
      FlowRouter.go('dashboard');
    } else {
      $('html, body').animate({
        scrollTop: ($('.error').first().offset().top - 150),
      }, 200);
      sAlert.warning('Some errors were found - they\'ve been highlighted.',
      { position: 'top-right', timeout: 7000 });
    }
  },
  'click .scheme-submit-button .loading'(event) {
    event.preventDefault();
  },
  // Change name field to input when selected.
  'click .name-field'() {
    newScheme.set('editingName', true);
    setTimeout(() => {
      $('input[name="scheme-name"]').select();
    }, 100);
  },
  // Change the input back to heading after they leave.
  'blur input[name="scheme-name"]'() {
    newScheme.set('editingName', false);
    newScheme.set('schemeName', $('input[name="scheme-name"]').val());
  },
  // Allow return to move between initial inputs
  'keydown'(event) {
    if (event.keyCode === 13 &&
      $(event.currentTarget).attr('name') === 'scheme-name') {
      event.preventDefault();
      $('#unit-field input').focus();
    } else if (event.keyCode === 13 &&
      $(event)[0].target === $('input.search:first')[0]) {
      event.preventDefault();
      $('textarea[name="scheme-desc"]').focus();
    }
  },
  'change textarea[name="scheme-desc"]'() {
    newScheme.set('description', $('textarea[name="scheme-desc"]').val());
  },
});
