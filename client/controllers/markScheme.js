import { countMarks, buildCommentsObject } from '../lib/utils';

Template.markScheme.onCreated(function created() {
  this.aspects = new ReactiveVar([]);
  this.marks = new ReactiveVar(0);
  this.markerName = new ReactiveVar(false);
  this.lastStudent = new ReactiveVar('');
  this.adjustmentValue = 0;
  const self = this;
  self.autorun(() => {
    self.subscribe('markingSchemes', FlowRouter.getParam('_id'));
  });
});

Template.markScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();
  // If they are logged in, we already know their name - skip to the next box!
  // Similiarly, if they have already filled this in once, we'll use that again.
  if (Meteor.userId() || Template.instance().markerName.get()) {
    Meteor.setTimeout(() => {
      $('input[name="student-no"]').focus();
    }, 100);
  }
});

Template.markScheme.helpers({
  scheme() {
    const scheme = MarkingSchemes.findOne({});
    return scheme;
  },
  countMarks() {
    countMarks();
    return Template.instance().marks.get();
  },
  markerName() {
    if (Meteor.user()) {
      return Meteor.user().profile.name;
    } else if (Template.instance().markerName.get()) {
      return Template.instance().markerName.get();
    }
    return false;
  },
  lastStudent() {
    return Template.instance().lastStudent.get();
  },
  adjustable(scheme) {
    return (scheme.adjustmentValuePositive > 0 ||
      scheme.adjustmentValueNegative < 0);
  },
  percentage(mark, total) {
    return Math.round((mark / total) * 100);
  },
});

Template.markScheme.events({
  'click tr:not(.header-row)'(event) {
    $(event.currentTarget).find('input').prop('checked', true);
    $('tr:last input:first').trigger('change');
    $('body').animate({
      scrollTop: $(window).scrollTop() + $(event.currentTarget)
        .closest('table').height(),
    }, 200);
  },
  'change tr input'(event, templateInstance) {
    const aspects = [];
    $('.aspect-table').each((index, table) => {
      const bData = Blaze.getData(table);
      const aObj = {
        aspect: bData.aspects[index].aspect,
        selected: $(table).find('input[type="radio"]:checked')
          .closest('tr').children('td.criteria').text(),
        // Shouldn't be using the DOM for this data!
        mark: parseInt($(table).find('input[type="radio"]:checked')
          .siblings('label').text().slice(0, -6), 10) || 0,
        maxMark: bData.aspects[index].maxMark,
      };
      aspects.push(aObj);
    });
    templateInstance.aspects.set(aspects);
  },
  'change input[name="adjustment"]'() {
    countMarks();
  },
  'click .adj-plus-button'(event) {
    event.preventDefault();
    const $number = $('input[name="adjustment"]');
    if ($number.val() < Blaze.getData(event.currentTarget).adjustmentValuePositive) {
      $number.val((parseInt($number.val(), 10) || 0) + 1);
    }
    $('input[name="adjustment"]').trigger('change');
  },
  'click .adj-minus-button'(event) {
    event.preventDefault();
    const $number = $('input[name="adjustment"]');
    if ($number.val() >
      Blaze.getData(event.currentTarget).adjustmentValueNegative) {
      $number.val((parseInt($number.val(), 10) || 0) - 1);
    }
    $('input[name="adjustment"]').trigger('change');
  },
  'focus input[type="radio"]'(event) {
    $(event.currentTarget).closest('tr').addClass('highlighted');
  },
  'focusout input[type="radio"]'(event) {
    $(event.currentTarget).closest('tr').removeClass('highlighted');
  },
  'submit form'(event, templateInstance) {
    const form = event.currentTarget;
    if (form.checkValidity()) {
      event.preventDefault();
      $('.submit-scheme').removeClass('submit-marks').addClass('loading');
      const markObject = {
        marker: $('input[name="marker-name"]').val(),
        studentNo: $('input[name="student-no"]').val(),
        schemeId: Blaze.getData(form)._id,
        schemeName: Blaze.getData(form).name,
        schemeOwner: Blaze.getData(form).creator,
        aspects: templateInstance.aspects.get(),
        presetComments: buildCommentsObject(),
        freeComment: $('.free-comment-field').val(),
        adjustment: $('input[name="adjustment"]').val(),
        marks: templateInstance.marks.get(),
        maxMarks: Blaze.getData(form).maxMarks,
      };
      templateInstance.lastStudent.set(markObject.studentNo);
      templateInstance.markerName.set($('input[name="marker-name"]').val());
      Meteor.call('addMark', markObject, (error) => {
        if (error) {
          sAlert.error(`Error: ${error.message} Please check your submission.`);
        }
      });
      sAlert.success(`Marks submitted for ${markObject.studentNo}`, {
        position: 'top-right',
        timeout: 3000,
        offset: 60,
      });
      $('.submit-marks').removeClass('loading').addClass('submit-marks');
      templateInstance.marks.set(0);
      templateInstance.aspects.set([]);
      form.reset();
      $('input[name="marker-name"]').val(templateInstance.markerName.get());
      $('input[name="student-no"]').focus();
      $('.marks-submitted').transition('pulse');
      $('body').scrollTop(0);
    }
  },
  'click'() {
    // @todo: Do something less stupid to activate semantic ui...
    $('.ui.checkbox').checkbox();
  },
});
