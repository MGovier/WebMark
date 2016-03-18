Meteor.publish('markingSchemes', function(idArg) {
  // Return nothing if not logged in.
  if (idArg) {
    return MarkingSchemes.find({
      _id: idArg
    });
  } else {
    if (!this.userId) {
      return [];
    }
    return MarkingSchemes.find({
      creator: this.userId
    });
  }
});

Meteor.publish('marks', function(idArg, schemeId) {
  if (idArg) {
    return Marks.find({
      _id: idArg
    });
  } else if (schemeId) {
    return Marks.find({
      schemeId: schemeId
    });
  } else {
    if (!this.userId) {
      return [];
    }
    return Marks.find({
      schemeOwner: this.userId
    });
  }
});

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

Meteor.publish('units', function() {
  if (!this.userId) {
    return [];
  }
  return Units.find({
    creator: this.userId
  });
});
