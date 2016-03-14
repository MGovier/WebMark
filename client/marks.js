Template.marks.onCreated(function() {
  this.filter = new ReactiveTable.Filter('filter-table');
  let schemeId = this.data.markingScheme._id;
  Session.setDefault('s-' + schemeId, []);
});

Template.marks.onRendered(() => {
  let schemeId = Template.instance().data.markingScheme._id;
  Session.setDefault('s-' + schemeId, []);
  this.graph = Tracker.autorun(function(){
    if (Marks.find().count() > 0) {
      var markArray = Marks.find().fetch(),
          maxMarks = markArray[0].maxMarks,
          interval = maxMarks / 6,
          labels = [],
          series = [];
      for (var i = 0; i < 6; i++) {
        var lowerInterval = interval * i,
            upperInterval = (interval * (i + 1)) - (i === 5 ? 0 : 1),
            count = 0;
        var label = `${lowerInterval} - ${upperInterval}`;
        labels.push(label);
        for (var m = 0; m < markArray.length; m++) {
          if (markArray[m].marks >= lowerInterval &&
              markArray[m].marks <= upperInterval) {
            count++;
          }
        }
        series.push((count / markArray.length) * 100);
      }
      var data = {
        labels,
        series
      };
      var options = {
        axisY: {
          onlyInteger: true,
          offset: 20
        },
        distributeSeries: true
      };

      new Chartist.Bar('.ct-chart', data, options).on('draw', function(data) {
        if(data.type === 'bar') {
          data.element.attr({
            style: 'stroke-width: 20px'
          });
        }
      });
    }
  });
});

Template.marks.onDestroyed(() => {
  if (this.graph) {
    this.graph.stop();
  }
});

Template.marks.helpers({
  settings: function() {
    return {
      collection: Template.instance().data.marks,
      rowsPerPage: 30,
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
        label: 'Marked On',
        fn: function(value) {
          return moment(value).format('D/M/YYYY');
        }
      }, {
        key: 'marks',
        label: 'Mark'
      }, {
        key: 'percentage',
        label: '%',
        fn: function(value, object) {
          return Math.round((object.marks / object.maxMarks) * 100);
        }
      }, {
        key: 'select',
        label: 'Select',
        sortable: false,
        fn: function (value, object) {
          let selectedRows = Session.get('s-' +
              MarkingSchemes.find().fetch()[0]._id);
          if (selectedRows.indexOf(object._id) > -1) {
            return new Spacebars.SafeString('<div class="ui checked checkbox"' +
                ' id="'+ object._id + '"><input type="checkbox" checked="" ' +
                'name="check"><label></label></div>');
          } else {
            return new Spacebars.SafeString('<div class="ui checkbox" ' +
                'id="'+ object._id + '"><input type="checkbox" ' +
                'name="check"><label></label></div>');
          }
        }
      }]
    };
  },
  marksExist: function () {
    return Marks.find().count();
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
    if (evt.target.className === 'select' || evt.target.nodeName === 'DIV') {
      $(evt.target).children('.ui .checkbox').checkbox('toggle');
    } else if (evt.target.nodeName !== 'INPUT' &&
        evt.target.nodeName !== 'LABEL') {
      Router.go('markReport', {
        _id: this._id,
        _sid: template.data.markingScheme._id
      });
    }
  },
  'keyup #filter-table': function(evt, template) {
    template.filter.set($(evt.currentTarget).val());
  },
  'change .ui .checkbox': function(evt, template) {
    let selectedRows = Session.get('s-' + template.data.markingScheme._id);
    if ($('#' + evt.currentTarget.id).checkbox('is checked')) {
      selectedRows.push(evt.currentTarget.id);
    } else {
      for (var i = selectedRows.length - 1; i >= 0; i--) {
        if (selectedRows[i] === evt.currentTarget.id) {
          selectedRows.splice(i, 1);
        }
      }
    }
    Session.set('s-' + template.data.markingScheme._id, selectedRows);
  },
  'click .delete-rows': function(evt, template) {
    $('.ui.basic.delete-check.modal')
      .modal({
        closable: false,
        onApprove: function() {
          var selectedRows = Session.get('s-' +
              template.data.markingScheme._id);
          //check
          selectedRows.forEach(sID => {
            Meteor.call('deleteMark', sID);
          });
          Session.set('s-' + template.data.markingScheme._id, []);
        },
        detachable: false
      }).modal('show');
  }
});

Template.marks.helpers({
  filterVar: function() {
    return Template.instance().filter.get();
  },
  jsonData: function() {
    return "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(
        generateJSON(Template.instance(), null, '  ')));
  },
  csvData: function() {
    return "data:text/csv;charset=utf-8," +
      encodeURIComponent(generateCSV(Template.instance()));
  },
  deleteDisabled: function() {
    let selectedRows = Session.get('s-' +
        Template.instance().data.markingScheme._id);
    return !selectedRows.length;
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
