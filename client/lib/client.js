Meteor.startup(() => {
  AutoForm.setDefaultTemplate('semanticUI');
  $('html').attr('lang', 'en');
});

Schemas = {};

Template.registerHelper('Schemas', Schemas);

Template.registerHelper('generateUUID', function () {
  // Source: User 'broofa' at StackOverflow: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = crypto.getRandomValues(new Uint8Array(1))[0]%16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
});

Schemas.Scheme = new SimpleSchema({
    name: {
      type: String,
      optional: false
    },
    description: {
      type: String,
      optional: true
    },
    aspects: {
        type: [Object]
    },
    'aspects.$.focus': {
        type: String
    },
    'aspects.$.rubric': {
        type: [Object],
        minCount: 1
    },
    'aspects.$.rubric.$.mark': {
        type: Number
    },
    'aspects.$.rubric.$.criteria': {
        type: String,
        optional: true
    },
    comments: {
        type: [String],
        optional: true
    },
    adjustmentValuePositive: {
        type: Number,
        optional: true,
        min: 0,
        defaultValue: 0
    },
    adjustmentValueNegative: {
      type: Number,
      optional: true,
      max: 0,
      defaultValue: 0
    }
});

Template.main.onRendered(() => {
  $('.ui.menu .ui.dropdown').dropdown({
      on: 'hover'
    });
});

Template.markScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();

  $('table tr').click(function(evt) {
    $(this).find('input[type=radio]').prop('checked', true);
    var qid = (evt.currentTarget.parentElement.parentElement.parentElement.id),
    nextQid = 'q' + (parseInt(qid.substring(1,qid.length)) + 1);
    if($('#' + nextQid).length === 0) {
      $('html, body').animate({
        scrollTop: $('#comments-select').offset().top
      }, 300);
    } else {
      $('html, body').animate({
        scrollTop: $('#' + nextQid).offset().top
      }, 300);
    }
  });
});

Template.insertScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();
});

Session.setDefault('adjustmentAllowed', false);
Session.setDefault('rubricObject', [{
  uuid: UI._globalHelpers.generateUUID(),
  rows: [{uuid: 'r' + (UI._globalHelpers.generateUUID())}]
}]);

Template.insertScheme.helpers({
  isAdjustmentAllowed: function () {
    return Session.get('adjustmentAllowed');
  },
  rubricObject: function () {
    return Session.get('rubricObject');
  },
  pickColour: function (index) {
    let colours = ['red', 'orange', 'blue', 'green', 'yellow', 
                    'teal', 'violet', 'pink', 'grey'];
    return colours[index % colours.length];
  }
});

Template.insertScheme.events({
  'click .checkbox': function (evt) {
    Session.set('adjustmentAllowed', 
      evt.currentTarget.classList.contains('checked'));
  },
  'click .add-criterion': function (evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
        id = $(evt.currentTarget).closest('table').attr('data-uuid');
    rObjs.forEach((rubric) => {
      if (rubric.uuid == id) {
        rubric['rows'].push({uuid: UI._globalHelpers.generateUUID()});
      }
    });
    Session.set('rubricObject', rObjs);
  },
  'click .add-aspect': function (evt) {
    evt.preventDefault();
    let rObj = Session.get('rubricObject');
    rObj.push({
      uuid: UI._globalHelpers.generateUUID(),
      rows: [{uuid: UI._globalHelpers.generateUUID()}]
    });
    Session.set('rubricObject', rObj);
  },
  'click .rubric-array-remove': function (evt) {
    evt.preventDefault();
    let rObjs = Session.get('rubricObject'),
        rowId = $(evt.currentTarget).closest('tr').attr('data-uuid'),
        tableId = $(evt.currentTarget).closest('table').attr('data-uuid');
    rObjs.forEach((rubric) => {
      if (rubric.uuid == tableId) {
        rubric.rows = rubric.rows.filter((row) => {
          return row.uuid != rowId;
        });
      }
    });
    Session.set('rubricObject', rObjs);
  },
  'change input': function (evt) {
    let rObjs = Session.get('rubricObject');
    rObjs.forEach((rubric) => {
      let $table = $('table[data-uuid="' + rubric.uuid + '"]');
      rubric.aspect = $table.find('input[name="rubric-aspect"]').val();
      console.log(rubric.aspect);
    });
  }
});

