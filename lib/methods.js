var throwError = function(error, reason, details) {
  var meteorError = new Meteor.Error(error, reason, details);
  if (Meteor.isClient) {
    return meteorError;
  } else if (Meteor.isServer) {
    throw meteorError;
  }
};

Meteor.methods({
  // SCHEME DESIGN METHODS:
  addScheme: function(schemeObject) {
    // require login to save:
    if (!Meteor.userId()) {
      throwError('not-authorized', 'User does not appear to be logged-in.');
    }

    // Remove empty array elements
    schemeObject.aspects.forEach((rubric, index, rArray) => {
      if (!(rubric.hasOwnProperty('aspect') && rubric.aspect.length > 0)) {
        rArray.splice(index, 1);
      } else {
        rubric.rows.forEach((row, index2, lArray) => {
          if (!((row.hasOwnProperty('criteria') && row.criteria.length > 0) ||
            (row.hasOwnProperty('criteriaValue') &&
            row.criteriaValue !== null &&
            !isNaN(row.criteriaValue)))) {
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
    MarkingSchemes.insert(schemeObject, function(err, result) {
      if (err) {
        throwError('bad-data', 'Data was not in the format expected.',
          err.invalidKeys);
      } else {
        Activities.insert({
          actor: 'You ',
          type: 'new',
          action: 'created the ' + schemeObject.name + ' scheme',
          relevantTo: schemeObject.creator
        });
        return result;
      }
    });
    if (schemeObject.unitCode !== 'zzNO_UNIT') {
      let unitContainer = Units.findOne({});
      if (!unitContainer) {
        Units.insert({
          units: [schemeObject.unitCode]
        });
      } else {
        Units.update(unitContainer._id, {
          $addToSet: {
            units: schemeObject.unitCode
          }
        });
      }
    }
  },
  deleteScheme: function(schemeId) {
    if (!Meteor.userId()) {
      throwError('not-authorized', 'User does not appear to be logged-in.');
    }
    let schemeToDelete = MarkingSchemes.findOne({
      _id: schemeId
    });
    if (!schemeToDelete) {
      throwError('not-found', 'Could not find that marking scheme to remove.');
    }
    if (Meteor.userId() === schemeToDelete.creator) {
      MarkingSchemes.remove(schemeId);
      Marks.remove({
        schemeId: schemeId
      });
    } else {
      throwError('not-authorized',
        'The current user does not match the creator of this scheme.');
    }
  },
  updateScheme: function(schemeId, schemeObject) {
    MarkingSchemes.update(schemeId, schemeObject);
  },
  // MARK SUBMISSION METHODS:
  addMark: function(markObject) {
    let actorName = markObject.marker;
    if (Meteor.userId() && Meteor.userId() === markObject.schemeOwner) {
      actorName = 'You';
    }
    Marks.insert(markObject, function(err, result) {
      if (err) {
        throwError('bad-data', 'Data was not in the format expected.',
          err.invalidKeys);
      } else {
        Activities.insert({
          actor: actorName,
          type: 'mark',
          action: 'submitted a mark for ' + markObject.schemeName,
          relevantTo: markObject.schemeOwner
        });
        return result;
      }
    });
  }
});

if (Meteor.isClient) {
  Ground.methodResume([
    'addScheme',
    'deleteScheme',
    'updateScheme',
    'addMark'
  ]);
}
