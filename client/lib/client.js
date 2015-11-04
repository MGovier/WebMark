Meteor.startup(() => {
  AutoForm.setDefaultTemplate("semanticUI");
  $('html').attr('lang', 'en');
});

// counter starts at 0
Session.setDefault('counter', 0);

Schemas = {};

Template.registerHelper("Schemas", Schemas);

Schemas.Scheme = new SimpleSchema({
	rubric: {
		type: [Object],
		minCount: 1
	},
	'rubric.$.mark': {
		type: Number
	},
	'rubric.$.criteria': {
		type: String,
		optional: true
	},
	comments: {
		type: [String],
		optional: true
	},
	allowAdjustment:{
		type: Boolean
	}
})

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

