throwError = function(error, reason, details) {  
  var meteorError = new Meteor.Error(error, reason, details);
  if (Meteor.isClient) {
    return meteorError;
  } else if (Meteor.isServer) {
    throw meteorError;
  }
};

Meteor.methods({
  addScheme: function (schemeObject) {
    // if (! Meteor.userId()) {
    //   throw new Meteor.Error("not-authorized");
    // }

    // Remove empty array elements
    schemeObject.aspects.forEach((rubric, index, rArray) => {
      if (!(rubric.hasOwnProperty('aspect') && rubric.aspect.length > 0)) {
        rArray.splice(index, 1);
      } else {
        rubric.rows.forEach((row, index2, lArray) => {
          if (!((row.hasOwnProperty('criteria') && row.criteria.length > 0) || (row.hasOwnProperty('criteriaValue') && row.criteriaValue !== null && !isNaN(row.criteriaValue)))) {
            lArray.splice(index2, 1);
          }
        });
      }
    });
    schemeObject.comments.forEach((com, index, cArray) => {
      if (!((com.hasOwnProperty('comment') && com.comment.length > 0))) {
        cArray.splice(index, 1);
      }
    });
    MarkingSchemes.insert(schemeObject, function (err, result) {
      if (err) {
        throwError('bad-data', 'Data was not in the format expected.', err.invalidKeys);
      } else {
        return result;
      }
    });
  },
  deleteScheme: function (schemeId) {
    MarkingSchemes.remove(schemeId);
  },
  updateScheme: function (schemeId, schemeObject) {
    MarkingSchemes.update(taskId, schemeObject);
  }
});