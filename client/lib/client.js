Meteor.startup(() => {
  AutoForm.setDefaultTemplate("semanticUI");
  $('html').attr('lang', 'en');
});

// counter starts at 0
Session.setDefault('counter', 0);

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

Template.insertScheme.helpers({
    isAdjustmentAllowed: function() {
        return AutoForm.getFieldValue('allowAdjustment');
    }
});

Template.body.events({
    'click table tr': function(){

    }
});

Template.body.onRendered(function() {
    $('.ui.menu .ui.dropdown').dropdown({
        on: 'hover'
      });
});

Template.hello.helpers({
  counter: function () {
    return Session.get('counter');
  }
});

Template.hello.events({
  'click button': function () {
    // increment the counter when button is clicked
    Session.set('counter', Session.get('counter') + 1);
  }
});

