import dragula from 'dragula';
import { generateUUID, calculateTotalMarks } from '../lib/utils';

const editScheme = new ReactiveDict('editScheme');

Template.editScheme.onRendered(function render() {
  // First, need to reassign UUIDs for tracking deletion and drag.
  const rubricAspects = this.data.scheme.aspects;
  for (const i in rubricAspects) {
    if (rubricAspects.hasOwnProperty(i)) {
      const aspect = rubricAspects[i];
      aspect.uuid = generateUUID();
      for (const j in aspect.rows) {
        if (aspect.rows.hasOwnProperty(j)) {
          aspect.rows[j].uuid = generateUUID();
        }
      }
    }
  }
  const comments = this.data.scheme.comments;
  for (const i in comments) {
    if (comments.hasOwnProperty(i)) {
      comments[i].uuid = generateUUID();
    }
  }

  editScheme.set('rubricObject', rubricAspects);
  editScheme.set('comments', comments);
  editScheme.set('schemeName', this.data.scheme.name);
  editScheme.set('unitCode', this.data.scheme.unitCode);
  editScheme.set('editingName', false);
  editScheme.set('commentHistory', []);

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
      editScheme.set('unitCode', value);
      $('textarea[name="scheme-desc"]').focus();
    },
  });
  $('.tooltip-buttons button').popup({
    inline: false,
    position: 'top left',
  });
  $('.name-field').trigger('click');
  if (editScheme.get('unitCode') !== 'zzNO_UNIT') {
    $('.unit-select').dropdown('set selected', editScheme.get('unitCode'));
  }

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
    const rObj = editScheme.get('rubricObject');
    editScheme.set('rubricObject', []);
    Meteor.setTimeout(() => {
      editScheme.set('rubricObject', rObj);
    }, 80);
  });
});

/**
 * Helper functions.
 */
Template.editScheme.helpers({
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
    return Template.instance().data.scheme.description;
  },
  editScheme() {
    return editScheme;
  },
});

/**
 * Event listeners.
 */
Template.editScheme.events({
  'click .submit-scheme'(event, templateInstance) {
    const form = $('#marking-scheme-form')[0];
    if (form.checkValidity()) {
      // Change class to show request is being processed.
      $('.submit-scheme').removeClass('submit-scheme').addClass('loading');
      event.preventDefault();
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
      Meteor.call('updateScheme', templateInstance.data.scheme._id, schemaObject,
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
      form.reset();
      // Send user to dashboard to use or share the updated scheme.
      Router.go('dashboard');
    }
    // Semantic validation could be added here for additional user guidance.
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
