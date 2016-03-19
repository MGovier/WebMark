/**
 * Data publications.
 * No arrow functions here, need access to 'this' context!
 */

/**
 * Publish data relevant to this user.
 * Return a specific scheme if an ID was given.
 * @param  {String}   idArg   Optional scheme id.
 */
Meteor.publish('markingSchemes', function(idArg) {
  // Return specific scheme if id is provided.
  // Security through obscurity, Google Docs style.
  if (idArg) {
    return MarkingSchemes.find({
      _id: idArg
    });
  } else {
    // Return nothing is the user is not logged in.
    if (!this.userId) {
      return [];
    }
    // Give the users the schemes they created.
    return MarkingSchemes.find({
      creator: this.userId
    });
  }
});

/**
 * Client access to marking reports.
 * @param  {String}   idArg       Optional marking report ID.
 * @param  {String}   schemeId    Optional marking scheme ID.
 */
Meteor.publish('marks', function(idArg, schemeId) {
  // If idArg is set, we're looking for a specific marking report.
  // This can be sent without user authentication, for student access.
  if (idArg) {
    return Marks.find({
      _id: idArg
    });
  }
  // Other methods require user authentication.
  if (!this.userId) {
    return [];
  }
  if (schemeId) {
    return Marks.find({
      schemeId: schemeId,
      schemeOwner: this.userId
    });
  }
  // If no arguments, return all marks relevant to the current user.
  return Marks.find({
    schemeOwner: this.userId
  });
});

/**
 * Publish activities relevant to the logged in user.
 */
Meteor.publish('activities', function() {
  if (!this.userId) {
    return [];
  }
  return Activities.find({
    relevantTo: this.userId
  }, {
    limit: 5,
    sort: {
      performedAt: -1
    }
  });
});

/**
 * Publish a user's unit history.
 */
Meteor.publish('units', function() {
  if (!this.userId) {
    return [];
  }
  return Units.find({
    creator: this.userId
  });
});
