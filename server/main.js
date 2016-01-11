Meteor.startup(function () {
    // code to run on server at startup
 });

Meteor.publish("markingSchemes", function (idArg) {
  // Return nothing if not logged in.
  if (idArg) {
    return MarkingSchemes.find({_id: idArg});
  } else {
    if (!this.userId) return [];
    return MarkingSchemes.find({creator: this.userId});
  }
});