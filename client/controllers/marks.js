/**
 * Create a filter object the first time this template is instantiated.
 * Careful with arrow functions due to `this` context.
 */

import moment from 'moment';
import { generateJSON, generateCSV } from '../lib/utils';

const sessionSelect = new ReactiveDict('sessionSelect');

Template.marks.onCreated(function created() {
  const self = this;
  self.filter = new ReactiveTable.Filter('filter-table');
  self.autorun(() => {
    self.subscribe('markingSchemes', FlowRouter.getParam('_id'));
    self.subscribe('marks', null, FlowRouter.getParam('_id'));
  });
});

/**
 * Check a session variable exists if this scheme was rendered but not created.
 * Attach a tracker to the marks data, to update the chart automatically.
 */
Template.marks.onRendered(function render() {
  const schemeId = FlowRouter.getParam('_id');
  // Unique session variable to track selected rows across app navigation.
  // Using a shared one would cause delete operations to affect other tables.
  sessionSelect.setDefault(schemeId, []);
  this.graph = Tracker.autorun(() => {
    const marks = Marks.find({
      schemeId: FlowRouter.getParam('_id'),
      schemeOwner: Meteor.userId(),
    });
    const markingScheme = MarkingSchemes.findOne({ _id: FlowRouter.getParam('_id') });
    if (marks.count() > 0 && markingScheme) {
      const markArray = marks.fetch();
      const maxMarks = markingScheme.maxMarks;
      const interval = maxMarks / 6;
      const labels = [];
      const series = [];
      for (let i = 0; i < 6; ++i) {
        const lowerInterval = interval * i;
        const upperInterval = (interval * (i + 1)) - (i === 5 ? 0 : 1);
        const label = `${lowerInterval.toFixed(0)} - ${upperInterval.toFixed(0)}`;
        let count = 0;
        labels.push(label);
        for (let m = 0; m < markArray.length; ++m) {
          if (markArray[m].marks >= lowerInterval &&
              markArray[m].marks <= upperInterval) {
            count++;
          }
        }
        series.push((count / markArray.length) * 100);
      }
      const data = {
        labels,
        series,
      };
      const options = {
        axisY: {
          onlyInteger: true,
          offset: 20,
        },
        distributeSeries: true,
      };
      // Create a Chartist bar chart. Wait for DOM.
      Meteor.setTimeout(() => {
        new Chartist.Bar('.ct-chart', data, options).on('draw', chart => {
          if (chart.type === 'bar') {
            chart.element.attr({
              style: 'stroke-width: 20px',
            });
          }
        });
      }, 100);
    }
  });
});

/**
 * When this template leaves the DOM.
 */
Template.marks.onDestroyed(function destroy() {
  // Stop the tracker trying to auto-update the graph when destroyed.
  if (this.graph) {
    this.graph.stop();
  }
});

/**
 * Helper functions.
 */
Template.marks.helpers({
  // Configure ReactiveTable
  settings() {
    return {
      collection: Marks.find({
        schemeId: FlowRouter.getParam('_id'),
        schemeOwner: Meteor.userId(),
      }),
      rowsPerPage: 30,
      filters: ['filter-table'],
      class: 'ui table striped selectable',
      fields: [{
        key: 'studentNo',
        label: 'Student No.',
      }, {
        key: 'marker',
        label: 'Marked By',
      }, {
        key: 'createdAt',
        label: 'Marked On',
        fn(value) {
          return moment(value).format('D/M/YYYY');
        },
      }, {
        key: 'marks',
        label: 'Mark',
      }, {
        key: 'percentage',
        label: '%',
        fn(value, object) {
          return Math.round((object.marks / object.maxMarks) * 100);
        },
      }, {
        key: 'select',
        label: 'Select',
        sortable: false,
        fn(value, object) {
          const selectedRows = sessionSelect.get(MarkingSchemes.find().fetch()[0]._id);
          if (selectedRows && selectedRows.indexOf(object._id) > -1) {
            return new Spacebars.SafeString(`<div class="ui checked checkbox" id="${object._id}">
            <input type="checkbox" checked="" name="check"><label></label></div>`);
          }
          return new Spacebars.SafeString(`<div class="ui checkbox" id="${object._id}">
          <input type="checkbox" name="check"><label></label></div>`);
        },
      }],
    };
  },
  marks() {
    return Marks.find({
      schemeId: FlowRouter.getParam('_id'),
      schemeOwner: Meteor.userId(),
    });
  },
  markingScheme() {
    return MarkingSchemes.findOne({ _id: FlowRouter.getParam('_id') });
  },
  marksExist() {
    return Marks.find().count();
  },
  filterVar() {
    return Template.instance().filter.get();
  },
  jsonData(markingScheme, marks) {
    return `data:text/json;charset=utf-8,
    ${encodeURIComponent(JSON.stringify(generateJSON(markingScheme, marks), null, '  '))}`;
  },
  csvData(markingScheme, marks) {
    return `data:text/csv;charset=utf-8,
    ${encodeURIComponent(generateCSV(markingScheme, marks))}`;
  },
  deleteDisabled() {
    const selectedRows = sessionSelect.get(FlowRouter.getParam('_id'));
    return selectedRows && !selectedRows.length;
  },
});

/**
 * Event listeners.
 */
Template.marks.events({
  'click .reactive-table tbody tr'(event) {
    if (event.target.className === 'select' || event.target.nodeName === 'DIV') {
      $(event.target).children('.ui .checkbox').checkbox('toggle');
    } else if (event.target.nodeName !== 'INPUT' &&
        event.target.nodeName !== 'LABEL') {
      FlowRouter.go('markReport', {
        _id: this._id,
        _sid: FlowRouter.getParam('_id'),
      });
    }
  },
  'keyup #filter-table'(event, templateInstance) {
    templateInstance.filter.set($(event.currentTarget).val());
  },
  'change .ui .checkbox'(event) {
    const selectedRows = sessionSelect.get(FlowRouter.getParam('_id'));
    if ($(`#${event.currentTarget.id}`).checkbox('is checked')) {
      selectedRows.push(event.currentTarget.id);
    } else {
      for (let i = selectedRows.length - 1; i >= 0; --i) {
        if (selectedRows[i] === event.currentTarget.id) {
          selectedRows.splice(i, 1);
        }
      }
    }
    sessionSelect.set(FlowRouter.getParam('_id'), selectedRows);
  },
  'click .delete-rows'() {
    $('.ui.basic.delete-check.modal')
      .modal({
        closable: false,
        onApprove() {
          const selectedRows = sessionSelect.get(FlowRouter.getParam('_id'));
          selectedRows.forEach(sID => {
            Meteor.call('deleteMark', sID);
          });
          // Reset the selected rows attribute after they have been deleted.
          sessionSelect.set(FlowRouter.getParam('_id'), []);
        },
        detachable: false,
      }).modal('show');
  },
});
