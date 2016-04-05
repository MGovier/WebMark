import uuid from 'node-uuid';
import { calculateTotalMarks, checkFormValidity, initializeEditScheme } from '../lib/utils';

const editScheme = new ReactiveDict('editScheme');

Template.editScheme.onCreated(function created() {
  const self = this;
  self.autorun(() => {
    self.subscribe('markingSchemes', FlowRouter.getParam('_id'));
    self.subscribe('units');
  });
  self.autorun(() => {
    if (!Meteor.userId()) {
      FlowRouter.go('landing');
    }
  });
  self.autorun(() => {
    if (self.subscriptionsReady()) {
      let comments = [{
        uuid: uuid.v4(),
      }];
      let rubricAspects = [{
        uuid: uuid.v4(),
        rows: [{
          uuid: uuid.v4(),
        }],
        maxMark: 0,
      }];
      const scheme = MarkingSchemes.findOne({ _id: FlowRouter.getParam('_id') });
      // First, need to reassign UUIDs for tracking deletion and drag.
      if (scheme.aspects) {
        rubricAspects = scheme.aspects;
        for (const i in rubricAspects) {
          if (rubricAspects.hasOwnProperty(i)) {
            const aspect = rubricAspects[i];
            aspect.uuid = uuid.v4();
            for (const j in aspect.rows) {
              if (aspect.rows.hasOwnProperty(j)) {
                aspect.rows[j].uuid = uuid.v4();
              }
            }
          }
        }
      }
      if (scheme.comments) {
        comments = scheme.comments;
        for (const i in comments) {
          if (comments.hasOwnProperty(i)) {
            comments[i].uuid = uuid.v4();
          }
        }
      }

      editScheme.set('rubricObject', rubricAspects);
      editScheme.set('comments', comments);
      editScheme.set('schemeName', scheme.name);
      editScheme.set('unitCode', scheme.unitCode);
      editScheme.set('description', scheme.description);
      editScheme.set('editingName', false);
      editScheme.set('commentHistory', []);

      $('input[name="adjustment-positive"]')
        .val(scheme.adjustmentValuePositive);
      $('input[name="adjustment-negative"]')
        .val(scheme.adjustmentValueNegative);

      Meteor.setTimeout(() => {
        initializeEditScheme(editScheme);
      }, 100);
    }
  });
});

// Call this in case we're offline.
Template.insertScheme.onRendered(() => initializeEditScheme(editScheme));

/**
 * Helper functions.
 */
Template.editScheme.helpers({
  scheme() {
    return MarkingSchemes.findOne({ _id: FlowRouter.getParam('_id') });
  },
  units() {
    const unitCollection = Units.findOne({ creator: Meteor.userId() });
    return unitCollection.units;
  },
  totalMarks() {
    return calculateTotalMarks(editScheme);
  },
  schemeName() {
    return editScheme.get('schemeName');
  },
  editingName() {
    return editScheme.get('editingName');
  },
  isThisSelected() {
    return true;
  },
  description() {
    return editScheme.get('description');
  },
  editScheme() {
    return editScheme;
  },
});

/**
 * Event listeners.
 */
Template.editScheme.events({
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
        unitCode: editScheme.get('unitCode'),
        aspects: editScheme.get('rubricObject'),
        comments: editScheme.get('comments'),
        adjustmentValuePositive: $('input[name="adjustment-positive"]').val(),
        adjustmentValueNegative: $('input[name="adjustment-negative"]').val(),
        maxMarks: calculateTotalMarks(editScheme),
      };
      // Call Meteor function to add data to DB. This will run offline first.
      Meteor.call('updateScheme', FlowRouter.getParam('_id'), schemaObject,
        (error) => {
          if (error) {
            // Alert user to error.
            sAlert.error(error.message, error.details);
            $('.scheme-submit-button').removeClass('loading')
              .addClass('submit-scheme');
          }
        });
      // If no error, show success notification.
      sAlert.success(`${schemaObject.name} edited!`, {
        position: 'top-right',
        onRouteClose: false,
        offset: 60,
      });
      $('.scheme-submit-button').removeClass('loading')
        .addClass('submit-scheme');
      // Send user to dashboard to use or share the updated scheme.
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
    editScheme.set('editingName', true);
    setTimeout(() => {
      $('input[name="scheme-name"]').select();
    }, 100);
  },
  // Change the input back to heading after they leave.
  'blur input[name="scheme-name"]'() {
    editScheme.set('editingName', false);
    editScheme.set('schemeName', $('input[name="scheme-name"]').val());
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
});
