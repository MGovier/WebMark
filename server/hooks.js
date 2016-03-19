/**
 * Database event hooks.
 * These are called on certain update, insertion, or removal events.
 */

/* jshint maxlen:false */

/**
 * Remove older activity entries when a new one is added.
 */
Activities.after.insert(function(userId) {
  let log = Activities.find({relevantTo: userId}, {sort:{performedAt: 1}}),
    array = log.fetch(),
    count = log.count();
  console.log(count);
  for (var i = 0; i < count - 5; i++) {
    console.log('removing', array[i]);
    Activities.remove(array[i]._id);
  }
});

/**
 * Create an example marking scheme, with marks, for a new user.
 */
Meteor.users.after.insert(function(userId, doc) {
  let example = {
      "name": "Example",
      "description": "This is an example marking scheme, using rubrics and pre-set comments. Click to view example marks!",
      "creator": doc._id,
      "createdAt": new Date(),
      "aspects": [{
        "aspect": "Report Structure",
        "rows": [{
          "criteria": "Excellent structure that meets all requirements.",
          "criteriaValue": 10
        }, {
          "criteria": "Good, nearly complete, structure.",
          "criteriaValue": 8
        }, {
          "criteria": "Structure interrupts flow of paper, and could benefit from re-ordering - but otherwise good.",
          "criteriaValue": 7
        }, {
          "criteria": "Some elements of report are missing.",
          "criteriaValue": 5
        }, {
          "criteria": "No submission.",
          "criteriaValue": 0
        }],
        "maxMark": 10
      }, {
        "aspect": "Evaluation Quality",
        "rows": [{
          "criteria": "Thorough evaluation, with originality and and a scientific approach.",
          "criteriaValue": 10
        }, {
          "criteria": "Strong evaluation, although following a traditional approach.",
          "criteriaValue": 8
        }, {
          "criteria": "Nearly complete.",
          "criteriaValue": 7
        }, {
          "criteria": "Some elements overlooked.",
          "criteriaValue": 5
        }, {
          "criteria": "No submission.",
          "criteriaValue": 0
        }],
        "maxMark": 10
      }, {
        "aspect": "Knowledge and Understanding",
        "rows": [{
          "criteria": "Research is thorough and goes beyond what was presented in class or in the assigned texts.",
          "criteriaValue": 20
        }, {
          "criteria": "Research is adequate but does not go much beyond what was presented in class or in the assigned text.",
          "criteriaValue": 10
        }, {
          "criteria": "Little or no research is apparent.",
          "criteriaValue": 5
        }],
        "maxMark": 20
      }, {
        "aspect": "Thinking and Inquiry",
        "rows": [{
          "criteria": "The presentation is centered around a thesis which shows a highly developed awareness of historiographic or social issues and a high level of conceptual ability.",
          "criteriaValue": 10
        }, {
          "criteria": "The presentation shows an analytical structure and a central thesis, but the analysis is not always fully developed and/or linked to the thesis.",
          "criteriaValue": 6
        }, {
          "criteria": "The presentation shows no analytical structure and no central thesis.",
          "criteriaValue": 3
        }],
        "maxMark": 10
      }, {
        "aspect": "Presentation Skills",
        "rows": [{
          "criteria": "The presenter speaks clearly and loudly enough to be heard, using eye contact, a lively tone, gestures, and body language to engage the audience.",
          "criteriaValue": 10
        }, {
          "criteria": "The presenter speaks clearly and loudly enough to be heard, but  tends to drone and/or fails to use eye contact, gestures, and body language consistently or effectively at times.",
          "criteriaValue": 6
        }, {
          "criteria": "The presenter cannot be heard and/or speaks so unclearly that s/he cannot be understood. There is no attempt to engage the audience through eye contact, gestures, or body language.",
          "criteriaValue": 2
        }],
        "maxMark": 10
      }],
      "comments": [{
        "comment": "Try to research alternative ways of structuring your information."
      }, {
        "comment": "Investigate more objective means of evaluating your work."
      }, {
        "comment": "Citations were not in the correct style. Use Harvard APA 6th Edition."
      }, {
        "comment": "Label your diagrams."
      }, {
        "comment": "Excellent supporting evidence."
      }],
      "adjustmentValuePositive": 5,
      "adjustmentValueNegative": -5,
      "maxMarks": 60,
      "unitCode": "zzNO_UNIT"
    },
    exampleMarks = [{
      "marker": "Anna",
      "studentNo": "up100",
      "schemeName": "Example",
      "aspects": [{
        "aspect": "Report Structure",
        "selected": "Good, nearly complete, structure.",
        "mark": 8,
        "maxMark": 10
      }, {
        "aspect": "Evaluation Quality",
        "selected": "Nearly complete.",
        "mark": 7,
        "maxMark": 10
      }, {
        "aspect": "Knowledge and Understanding",
        "selected": "Research is thorough and goes beyond what was presented in class or in the assigned texts.",
        "mark": 20,
        "maxMark": 20
      }, {
        "aspect": "Thinking and Inquiry",
        "selected": "The presentation shows an analytical structure and a central thesis, but the analysis is not always fully developed and/or linked to the thesis.",
        "mark": 6,
        "maxMark": 10
      }, {
        "aspect": "Presentation Skills",
        "selected": "The presenter speaks clearly and loudly enough to be heard, but  tends to drone and/or fails to use eye contact, gestures, and body language consistently or effectively at times.",
        "mark": 6,
        "maxMark": 10
      }],
      "presetComments": [
        "Citations were not in the correct style. Use Harvard APA 6th Edition.",
        "Excellent supporting evidence."
      ],
      "freeComment": "Great effort, but try to actively engage the audience in the presentation.",
      "adjustment": 1,
      "marks": 48,
      "maxMarks": 60,
      "createdAt": new Date()
    }, {
      "marker": "Ben",
      "studentNo": "up101",
      "schemeName": "Example",
      "aspects": [{
        "aspect": "Report Structure",
        "selected": "Excellent structure that meets all requirements.",
        "mark": 10,
        "maxMark": 10
      }, {
        "aspect": "Evaluation Quality",
        "selected": "Thorough evaluation, with originality and and a scientific approach.",
        "mark": 10,
        "maxMark": 10
      }, {
        "aspect": "Knowledge and Understanding",
        "selected": "Research is thorough and goes beyond what was presented in class or in the assigned texts.",
        "mark": 20,
        "maxMark": 20
      }, {
        "aspect": "Thinking and Inquiry",
        "selected": "The presentation is centered around a thesis which shows a highly developed awareness of historiographic or social issues and a high level of conceptual ability.",
        "mark": 10,
        "maxMark": 10
      }, {
        "aspect": "Presentation Skills",
        "selected": "The presenter speaks clearly and loudly enough to be heard, using eye contact, a lively tone, gestures, and body language to engage the audience.",
        "mark": 10,
        "maxMark": 10
      }],
      "presetComments": [
        "Excellent supporting evidence."
      ],
      "freeComment": "An excellent piece of work, supported by a strong presentation. It is easy to forget that this project was completed in only 2 weeks!",
      "marks": 60,
      "maxMarks": 60,
      "createdAt": new Date()
    }, {
      "marker": "Charlie",
      "studentNo": "up102",
      "schemeName": "Example",
      "aspects": [{
        "aspect": "Report Structure",
        "selected": "Some elements of report are missing.",
        "mark": 5,
        "maxMark": 10
      }, {
        "aspect": "Evaluation Quality",
        "selected": "No submission.",
        "mark": 0,
        "maxMark": 10
      }, {
        "aspect": "Knowledge and Understanding",
        "selected": "Little or no research is apparent.",
        "mark": 5,
        "maxMark": 20
      }, {
        "aspect": "Thinking and Inquiry",
        "selected": "The presentation shows no analytical structure and no central thesis.",
        "mark": 3,
        "maxMark": 10
      }, {
        "aspect": "Presentation Skills",
        "selected": "The presenter speaks clearly and loudly enough to be heard, but  tends to drone and/or fails to use eye contact, gestures, and body language consistently or effectively at times.",
        "mark": 6,
        "maxMark": 10
      }],
      "presetComments": [
        "Investigate more objective means of evaluating your work.",
        "Citations were not in the correct style. Use Harvard APA 6th Edition."
      ],
      "freeComment": "You need to be able to critically evaluate your work - this section was missing. The abstract also failed to mention the technique for solving the problem.",
      "adjustment": -2,
      "marks": 17,
      "maxMarks": 60,
      "createdAt": new Date()
    }, {
      "marker": "Dawn",
      "studentNo": "up103",
      "schemeName": "Example",
      "aspects": [{
        "aspect": "Report Structure",
        "selected": "Structure interrupts flow of paper, and could benefit from re-ordering - but otherwise good.",
        "mark": 7,
        "maxMark": 10
      }, {
        "aspect": "Evaluation Quality",
        "selected": "Some elements overlooked.",
        "mark": 5,
        "maxMark": 10
      }, {
        "aspect": "Knowledge and Understanding",
        "selected": "Research is adequate but does not go much beyond what was presented in class or in the assigned text.",
        "mark": 10,
        "maxMark": 20
      }, {
        "aspect": "Thinking and Inquiry",
        "selected": "The presentation is centered around a thesis which shows a highly developed awareness of historiographic or social issues and a high level of conceptual ability.",
        "mark": 10,
        "maxMark": 10
      }, {
        "aspect": "Presentation Skills",
        "selected": "The presenter speaks clearly and loudly enough to be heard, using eye contact, a lively tone, gestures, and body language to engage the audience.",
        "mark": 10,
        "maxMark": 10
      }],
      "presetComments": [
        "Label your diagrams."
      ],
      "freeComment": "Excellent presentation. A bit more research and supporting evidence would have pushed this into the higher mark categories!",
      "marks": 42,
      "maxMarks": 60,
      "createdAt": new Date()
    }, {
      "marker": "Ellen",
      "studentNo": "up104",
      "schemeName": "Example",
      "aspects": [{
        "aspect": "Report Structure",
        "selected": "Good, nearly complete, structure.",
        "mark": 8,
        "maxMark": 10
      }, {
        "aspect": "Evaluation Quality",
        "selected": "Strong evaluation, although following a traditional approach.",
        "mark": 8,
        "maxMark": 10
      }, {
        "aspect": "Knowledge and Understanding",
        "selected": "Research is adequate but does not go much beyond what was presented in class or in the assigned text.",
        "mark": 10,
        "maxMark": 20
      }, {
        "aspect": "Thinking and Inquiry",
        "selected": "The presentation is centered around a thesis which shows a highly developed awareness of historiographic or social issues and a high level of conceptual ability.",
        "mark": 10,
        "maxMark": 10
      }, {
        "aspect": "Presentation Skills",
        "selected": "The presenter speaks clearly and loudly enough to be heard, using eye contact, a lively tone, gestures, and body language to engage the audience.",
        "mark": 10,
        "maxMark": 10
      }],
      "presetComments": [
        "Investigate more objective means of evaluating your work.",
        "Label your diagrams.",
        "Excellent supporting evidence."
      ],
      "freeComment": "Strong purpose to the project, that was clearly explained and well researched. A more unique method of evaluation could have been used.",
      "adjustment": 1,
      "marks": 47,
      "maxMarks": 60,
      "createdAt": new Date()
    }];

  MarkingSchemes.insert(example, {
    'bypassCollection2': true
  }, function(err, id) {
    if (err) {
      console.log(err);
    }
    exampleMarks.forEach((mark) => {
      mark.schemeId = id;
      mark.schemeOwner = doc._id;
      Marks.insert(mark, {
        'bypassCollection2': true
      }, function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
  });
});
