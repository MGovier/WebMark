Session.setDefault('aspects', []);
Session.setDefault('marks', 0);
Session.setDefault('markerName', false);

var countMarksFunction = function () {
  let total = 0;
      aspects = Session.get('aspects');
  aspects.forEach((aspect) => {
    total += aspect.mark;
  });
  adjustment = parseInt($('input[name="adjustment"]').val(), 10) || 0;
  Session.set('marks', total + adjustment);
};

var buildCommentsObject = function () {
  comments = [];
  $('.preset-comments input[type="checkbox"]:checked').each(function (index, comment) {
    comments.push($(comment).siblings('label').text());
  });
  return comments;
};

Template.markScheme.helpers({
  countMarks: function () {
    countMarksFunction();
    return Session.get('marks');
  },
  markerName: function () {
    if (Meteor.user()) {
      return Meteor.user().profile.name;
    } else if (Session.get('markerName')) {
      return Session.get('markerName');
    } else {
      return '';
    }
  }
});

Template.markScheme.events({
  'click tr': function (evt) {
    $(evt.currentTarget).find('input').prop('checked', true);
    let aspects = [];
    $('.aspect-table').each(function (index, table) {
      let bData = Blaze.getData(table),
          aObj = {
            aspect: bData.aspects[index].aspect,
            selected: $(table).find('input[type="radio"]:checked').closest('tr').children('td.criteria').text(),
            // Slice 'marks' off the end... Shouldn't be using the DOM for this data!
            mark: parseInt($(table).find('input[type="radio"]:checked').siblings('label').text().slice(0, -6), 10) || 0,
            maxMark: bData.aspects[index].maxMark
          };
      aspects.push(aObj);
    });
    Session.set('aspects', aspects);
  },
  'change input[name="adjustment"]': function () {
    countMarksFunction();
  },
  'focus input[type="radio"]': function (evt) {
    $(evt.currentTarget).closest('tr').addClass('highlighted');
  },
  'focusout input[type="radio"]': function (evt) {
    $(evt.currentTarget).closest('tr').removeClass('highlighted');
  },
  'submit form': function (evt) {
    let form = evt.currentTarget;
    if (form.checkValidity()) {
      evt.preventDefault();
      $('.submit-scheme').removeClass('submit-marks').addClass('loading');
      let markObject = {
        'marker': $('input[name="marker-name"]').val(),
        'studentNo': $('input[name="student-no"]').val(),
        'schemeId': Blaze.getData(form)._id,
        'schemeOwner': Blaze.getData(form).creator,
        'aspects': Session.get('aspects'),
        'presetComments': buildCommentsObject(),
        'freeComment': $('.free-comment-field').val(),
        'adjustment': $('input[name="adjustment"]').val(),
        'marks': Session.get('marks'),
        'maxMarks': Blaze.getData(form).maxMarks
      };
      Session.set('markerName', $('input[name="marker-name"]').val());
      Meteor.call('addMark', markObject, (error, result) => {
        if (error) {
          console.log(error.message, error.details);
        } else {
          $('.submit-marks').removeClass('loading').addClass('submit-marks');
          Session.set('marks', 0);
          Session.set('aspects', []);
          form.reset();
        }
      });
    } else {
      // Semantic validation checks
    }
  }
});
