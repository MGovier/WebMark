Template.markScheme.onCreated(function() {
  this.aspects = new ReactiveVar([]);
  this.marks = new ReactiveVar(0);
  this.markerName = new ReactiveVar(false);
  this.lastStudent = new ReactiveVar('');
  this.adjustmentValue = 0;
});

Template.markScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();
  // If they are logged in, we already know their name - skip to the next box!
  // Similiarly, if they have already filled this in once, we'll use that again.
  if (Meteor.userId() || Template.instance().markerName.get()) {
    Meteor.setTimeout(function() {
      $('input[name="student-no"]').focus();
    }, 100);
  }
});

var countMarksFunction = function() {
  let total = 0,
    aspects = Template.instance().aspects.get();
  aspects.forEach((aspect) => {
    total += aspect.mark;
  });
  let adjustment = parseInt($('input[name="adjustment"]').val(), 10) || 0;
  Template.instance().marks.set(total + adjustment);
};

var buildCommentsObject = function() {
  let comments = [];
  $('.preset-comments input[type="checkbox"]:checked')
    .each(function(index, comment) {
      comments.push($(comment).siblings('label').text());
  });
  return comments;
};

Template.markScheme.helpers({
  countMarks: function() {
    countMarksFunction();
    return Template.instance().marks.get();
  },
  markerName: function() {
    if (Meteor.user()) {
      return Meteor.user().profile.name;
    } else if (Template.instance().markerName.get()) {
      return Template.instance().markerName.get();
    } else {
      return false;
    }
  },
  lastStudent: function() {
    return Template.instance().lastStudent.get();
  },
  adjustable: function() {
    return (this.adjustmentValuePositive > 0 ||
      this.adjustmentValueNegative < 0);
  },
  percentage: function(mark, total) {
    return Math.round((mark / total) * 100);
  }
});

Template.markScheme.events({
  'click tr:not(.header-row)': function(evt) {
    $(evt.currentTarget).find('input').prop('checked', true);
    $('tr:last input:first').trigger('change');
    $('body').animate({
      scrollTop: $(window).scrollTop() + $(evt.currentTarget)
        .closest('table').height()
    }, 200);
  },
  'change tr input': function(evt, template) {
    let aspects = [];
    $('.aspect-table').each(function(index, table) {
      let bData = Blaze.getData(table),
        aObj = {
          aspect: bData.aspects[index].aspect,
          selected: $(table).find('input[type="radio"]:checked')
            .closest('tr').children('td.criteria').text(),
          // Shouldn't be using the DOM for this data!
          mark: parseInt($(table).find('input[type="radio"]:checked')
            .siblings('label').text().slice(0, -6), 10) || 0,
          maxMark: bData.aspects[index].maxMark
        };
      aspects.push(aObj);
    });
    template.aspects.set(aspects);
  },
  'change input[name="adjustment"]': function() {
    countMarksFunction();
  },
  'click .adj-plus-button': function(evt) {
    evt.preventDefault();
    let $number = $('input[name="adjustment"]');
    if ($number.val() < Blaze.getData(evt.currentTarget)
      .adjustmentValuePositive) {
        $number.val((parseInt($number.val(), 10) || 0) + 1);
    }
    $('input[name="adjustment"]').trigger('change');
  },
  'click .adj-minus-button': function(evt) {
    evt.preventDefault();
    let $number = $('input[name="adjustment"]');
    if ($number.val() >
      Blaze.getData(evt.currentTarget).adjustmentValueNegative) {
      $number.val((parseInt($number.val(), 10) || 0) - 1);
    }
    $('input[name="adjustment"]').trigger('change');
  },
  'focus input[type="radio"]': function(evt) {
    $(evt.currentTarget).closest('tr').addClass('highlighted');
  },
  'focusout input[type="radio"]': function(evt) {
    $(evt.currentTarget).closest('tr').removeClass('highlighted');
  },
  'submit form': function(evt, template) {
    let form = evt.currentTarget;
    if (form.checkValidity()) {
      evt.preventDefault();
      $('.submit-scheme').removeClass('submit-marks').addClass('loading');
      let markObject = {
        'marker': $('input[name="marker-name"]').val(),
        'studentNo': $('input[name="student-no"]').val(),
        'schemeId': Blaze.getData(form)._id,
        'schemeName': Blaze.getData(form).name,
        'schemeOwner': Blaze.getData(form).creator,
        'aspects': template.aspects.get(),
        'presetComments': buildCommentsObject(),
        'freeComment': $('.free-comment-field').val(),
        'adjustment': $('input[name="adjustment"]').val(),
        'marks': template.marks.get(),
        'maxMarks': Blaze.getData(form).maxMarks
      };
      template.lastStudent.set(markObject.studentNo);
      template.markerName.set($('input[name="marker-name"]').val());
      Meteor.call('addMark', markObject, (error) => {
        if (error) {
          sAlert.error('Error: ' + error.message +
            '. Please check your submission.');
        }
      });
      sAlert.success('Marks submitted for ' + markObject.studentNo, {
        position: 'top-right',
        timeout: 3000,
        offset: 60
      });
      $('.submit-marks').removeClass('loading').addClass('submit-marks');
      template.marks.set(0);
      template.aspects.set([]);
      form.reset();
      $('input[name="marker-name"]').val(template.markerName.get());
      $('input[name="student-no"]').focus();
      $('.marks-submitted').transition('pulse');
      $('body').scrollTop(0);
    } else {
      // Semantic validation checks
    }
  }
});
