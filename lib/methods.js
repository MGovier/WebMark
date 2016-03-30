import uuid from 'node-uuid';

function throwError(error, reason, details) {
  const meteorError = new Meteor.Error(error, reason, details);
  if (Meteor.isServer) {
    throw meteorError;
  }
  return meteorError;
}

Meteor.methods({
  // SCHEME DESIGN METHODS:
  addScheme(schemeArg) {
    const schemeObject = schemeArg;
    // require login to save:
    if (!Meteor.userId()) {
      throwError('not-authorized', 'User does not appear to be logged-in.');
    }
    if (!schemeObject) {
      throwError('missing-data', 'No marking scheme provided.');
    }
    // Check they haven't given an _id already in use.
    // We're trusting the client for IDs to enable offline mode.
    const exists = MarkingSchemes.findOne({ _id: schemeArg._id });
    if (exists) {
      // Either they have very bad luck, or they're... up to something.
      // Overwrite it!
      schemeObject._id = uuid.v4();
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
    MarkingSchemes.insert(schemeObject, (err, result) => {
      if (err) {
        throwError('bad-data', 'Data was not in the format expected.',
          err.invalidKeys);
      } else {
        Activities.insert({
          actor: 'You ',
          type: 'new',
          action: `created the ${schemeObject.name} scheme`,
          relevantTo: schemeObject.creator,
        });
      }
      return result;
    });
    if (schemeObject.unitCode !== 'zzNO_UNIT') {
      const unitContainer = Units.findOne({});
      if (!unitContainer) {
        Units.insert({
          units: [schemeObject.unitCode],
        });
      } else {
        Units.update(unitContainer._id, {
          $addToSet: {
            units: schemeObject.unitCode,
          },
        });
      }
    }
  },

  deleteScheme(schemeId) {
    if (!Meteor.userId()) {
      throwError('not-authorized', 'User does not appear to be logged-in.');
    }
    const schemeToDelete = MarkingSchemes.findOne({
      _id: schemeId,
    });
    if (!schemeToDelete) {
      throwError('not-found', 'Could not find that marking scheme to remove.');
    }
    if (Meteor.userId() === schemeToDelete.creator) {
      MarkingSchemes.remove(schemeId);
      Marks.remove({
        schemeId,
      });
    } else {
      throwError('not-authorized',
        'The current user does not match the creator of this scheme.');
    }
  },

  updateScheme(schemeId, schemeObject) {
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
    MarkingSchemes.update(schemeId, { $set: schemeObject }, (err, result) => {
      if (err) {
        throwError('bad-data', 'Data was not in the format expected.',
          err.invalidKeys);
      } else {
        Activities.insert({
          actor: 'You ',
          type: 'edit',
          action: `edited the ${schemeObject.name} scheme`,
          relevantTo: Meteor.userId(),
        });
      }
      return result;
    });
    if (schemeObject.unitCode !== 'zzNO_UNIT') {
      const unitContainer = Units.findOne({});
      if (!unitContainer) {
        Units.insert({
          units: [schemeObject.unitCode],
        });
      } else {
        Units.update(unitContainer._id, {
          $addToSet: {
            units: schemeObject.unitCode,
          },
        });
      }
    }
  },

  // MARK SUBMISSION METHODS:
  addMark(markObject) {
    let actorName = markObject.marker;
    if (Meteor.userId() && Meteor.userId() === markObject.schemeOwner) {
      actorName = 'You';
    }
    Marks.insert(markObject, (err, result) => {
      if (err) {
        throwError('bad-data', 'Data was not in the format expected.',
          err.invalidKeys);
      } else {
        Activities.insert({
          actor: actorName,
          type: 'mark',
          action: `submitted a mark for ${markObject.schemeName}`,
          relevantTo: markObject.schemeOwner,
        });
      }
      return result;
    });
  },

  deleteMark(mID) {
    if (!Meteor.userId()) {
      throwError('not-authorized', 'User does not appear to be logged-in.');
    }
    const markToDelete = Marks.findOne({
      _id: mID,
    });
    if (!markToDelete) {
      throwError('not-found', 'Could not find that mark to remove.');
    }
    if (Meteor.userId() === markToDelete.schemeOwner) {
      Marks.remove({
        _id: mID,
      });
    } else {
      throwError('not-authorized',
        'The current user does not match the owner of this scheme.');
    }
  },
});

if (Meteor.isClient) {
  Ground.methodResume([
    'addScheme',
    'deleteScheme',
    'updateScheme',
    'addMark',
    'deleteMark',
  ]);
}
