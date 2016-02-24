Template.marks.created = function() {
  this.filter = new ReactiveTable.Filter('filter-table');
};

Template.marks.helpers({
  settings: function() {
    return {
      collection: Template.instance().data.marks,
      rowsPerPage: 40,
      filters: ['filter-table'],
      class: 'ui table striped selectable',
      fields: [{
        key: 'studentNo',
        label: 'Student No.'
      }, {
        key: 'marker',
        label: 'Marked By'
      }, {
        key: 'createdAt',
        label: 'Marked At',
        fn: function(value) {
          return moment(value).format('llll');
        }
      }, {
        key: 'marks',
        label: 'Mark'
      }, {
        key: 'percentage',
        label: 'Percentage',
        fn: function(value, object) {
          return Math.round((object.marks / object.maxMarks) * 100);
        }
      }]
    };
  }
});

function generateJSON (template) {
  let output = {
    'schemeName': template.data.markingScheme.name,
    'schemeCreator': Meteor.user().profile.name,
    'exportTime': new Date(),
    'reportCount': template.data.marks.count(),
    'reports': [],
    'maxMarks': template.data.markingScheme.maxMarks
  },
  addMark = function (report) {
    output.reports.push({
      'marker': report.marker,
      'studentNo': report.studentNo,
      'marks': report.marks,
      'aspects': report.aspects,
      'presetComments': report.presetComments,
      'comment': report.freeComment
    });
  };
  template.data.marks.forEach(addMark);
  return output;
}

Template.marks.events({
  'click .reactive-table tbody tr': function(evt, template) {
    Router.go('markReport', {
      _id: this._id,
      _sid: template.data.markingScheme._id
    });
  },
  'keyup #filter-table': function(evt, template) {
    template.filter.set($(evt.currentTarget).val());
  },
  'click .generate-json': function(evt, template) {
    let output = generateJSON(template);
    $('.export-output').text(JSON.stringify(output, null, '  '));
    $('.download-data').attr('href', "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(generateJSON(template), null, '  ')));
    $('.download-data').removeClass('stealth');
  },
  'click .generate-csv': function(evt, template) {
    window.alert('coming soon!');
  }
});

Template.marks.helpers({
  filterVar: function() {
    return Template.instance().filter.get();
  }
});

Template.markingReport.helpers({
  percentage: function(mark, total) {
    return Math.round((mark / total) * 100);
  },
  showAdj: function(value) {
    if (value > 0) {
      return '+' + value;
    } else {
      return value;
    }
  }
});
