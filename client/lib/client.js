Meteor.startup(() => {
  AutoForm.setDefaultTemplate("semanticUI");
  $('html').attr('lang', 'en');
});

Schemas = {};

Template.registerHelper("Schemas", Schemas);

Schemas.Scheme = new SimpleSchema({
    name: {
      type: String,
      optional: false
    },
    description: {
      type: String,
      optional: true
    },
    aspects: {
        type: [Object]
    },
    'aspects.$.focus': {
        type: String
    },
    'aspects.$.rubric': {
        type: [Object],
        minCount: 1
    },
    'aspects.$.rubric.$.mark': {
        type: Number
    },
    'aspects.$.rubric.$.criteria': {
        type: String,
        optional: true
    },
    comments: {
        type: [String],
        optional: true
    },
    allowAdjustment: {
        type: Boolean
    },
    adjustmentValuePositive: {
        type: Number,
        optional: true,
        min: 0
    },
    adjustmentValueNegative: {
      type: Number,
      optional: true,
      max: 0
    }
});

Template.main.onRendered(() => {
  $('.ui.menu .ui.dropdown').dropdown({
      on: 'hover'
    });
});

Template.markScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();

  $('table tr').click(function(evt) {
    $(this).find('input[type=radio]').prop('checked', true);
    var qid = (evt.currentTarget.parentElement.parentElement.parentElement.id),
    nextQid = 'q' + (parseInt(qid.substring(1,qid.length)) + 1);
    if($('#' + nextQid).length == 0) {
      $('html, body').animate({
        scrollTop: $('#comments-select').offset().top
      }, 300);
    } else {
      $('html, body').animate({
        scrollTop: $('#' + nextQid).offset().top
      }, 300);
    }
  });
});

Template.insertScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();
});

Session.setDefault('adjustmentAllowed', false);
Session.setDefault('rubricObject', [{uuid:Math.floor((Math.random() * 9999999)), rows:[{uuid:Math.floor((Math.random() * 9999999))}]}]);

Template.insertScheme.helpers({
  isAdjustmentAllowed: function() {
      return Session.get('adjustmentAllowed');
  },
  rubricObject: function() {
    return Session.get('rubricObject');
  },
  randomColour: function () {
    var colours = ['red', 'orange', 'blue', 'green', 'yellow', 'teal', 'violet', 'pink', 'grey'];
    return colours[this.uuid % colours.length];
  }
});

Template.insertScheme.events({
  'click .checkbox': function (evt) {
    Session.set('adjustmentAllowed', evt.currentTarget.classList.contains('checked'));
  },
  'click .add-criterion': function (evt) {
    evt.preventDefault();
    var rObjs = Session.get('rubricObject');
    rObjs.forEach((rubric) => {
      if (rubric.uuid == evt.currentTarget.id.substring(2)) {
        rubric['rows'].push({uuid:Math.floor((Math.random() * 9999999))})
      }
    });
    Session.set('rubricObject', rObjs);
  },
  'click .add-aspect': function (evt) {
    evt.preventDefault();
    var rObj = Session.get('rubricObject');
    rObj.push({uuid:Math.floor((Math.random() * 9999999)), rows:[{uuid:Math.floor((Math.random() * 9999999))}]});
    Session.set('rubricObject', rObj);
  }
});

