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
      'comment': report.freeComment,
      'adjustment': report.adjustment
    });
  };
  template.data.marks.forEach(addMark);
  return output;
}

function generateCSV (template) {
  // header first
  let output = 'Student No,Marker,Marks,Max Marks,Preset Comments,Comment';
  template.data.markingScheme.aspects.forEach((aspect) => {
    output += ',"' + aspect.aspect + ' Level","' + aspect.aspect + ' Mark","' +
      aspect.aspect + ' Max Mark"';
  });
  output += ',Adjustment\n';

  let addMark = function (report) {
    output += '"' + report.studentNo + '"';
    output += ',"' + report.marker + '"';
    output += ',' + report.marks;
    output += ',' + report.maxMarks;
    output += ',"' + report.presetComments + '"';
    output += ',"' + report.freeComment + '"';
    report.aspects.forEach((aspect) => {
      output += ',"' + aspect.selected + '"';
      output += ',' + aspect.mark;
      output += ',' + aspect.maxMark;
    });
    output += ',' + (report.adjustment || 0);
    output += '\n';
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
      encodeURIComponent(JSON.stringify(output, null, '  ')));
    $('.download-data').attr('download',
      template.data.markingScheme.name + '.json');
    $('.output-view').removeClass('stealth');
    $('.download-data').removeClass('stealth');
  },
  'click .generate-csv': function(evt, template) {
    let output = generateCSV(template);
    $('.export-output').text(output);
    $('.download-data').attr('href', "data:text/csv;charset=utf-8," +
      encodeURIComponent(output));
    $('.download-data').attr('download',
      template.data.markingScheme.name + '.csv');
    $('.output-view').removeClass('stealth');
    $('.download-data').removeClass('stealth');
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
