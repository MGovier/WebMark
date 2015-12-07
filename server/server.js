Meteor.startup(function () {
    // code to run on server at startup
 });

Meteor.publish("markingSchemes", function () {
	return MarkingSchemes.find();
});