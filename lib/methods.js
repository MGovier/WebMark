Meteor.methods({
  addScheme: function (schemeObject) {
    // if (! Meteor.userId()) {
    //   throw new Meteor.Error("not-authorized");
    // }
    // Remove empty array elements
    console.log(schemeObject);
    schemeObject.aspects.forEach((rubric, index, rArray) => {
      if (!(rubric.hasOwnProperty('aspect') && rubric.aspect.length > 0)) {
        rArray.splice(index, 1);
      } else {
        rubric.rows.forEach((row, index2, lArray) => {
          if (!((row.hasOwnProperty('criteria') && row.criteria.length > 0) || (row.hasOwnProperty('criteriaValue')))) {
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
    console.log(schemeObject);
    MarkingSchemes.insert(schemeObject, function (err, result) {
      if (err) {
        console.log(err.invalidKeys);
      } else {
        console.log('yay');
      }
    });
  },
  deleteScheme: function (schemeId) {
    MarkingSchemes.remove(id);
  },
  updateScheme: function (schemeId, schemeObject) {
    MarkingSchemes.update(taskId, schemeObject);
  }
});