/**
 * Controller for adding comments to new scheme.
 */

import { generateUUID } from '../lib/utils';

/**
 * Helper functions.
 */
Template.commentBuilder.helpers({
  comments() {
    return Template.instance().data.scheme.get('comments');
  },
  isLast(index) {
    if (index === Template.instance().data.scheme.get('comments').length - 1) {
      return 'last-comment';
    }
    return '';
  },
  canUndo() {
    const commentHistory = Template.instance().data.scheme.get('commentHistory');
    return commentHistory && commentHistory.length > 0;
  },
});

/**
 * Event listeners.
 */
Template.commentBuilder.events({
  'click .comment-remove'(event, templateInstance) {
    event.preventDefault();
    let comments = templateInstance.data.scheme.get('comments');
    const id = $(event.currentTarget).closest('.comment-item').attr('data-uuid');
    comments = comments.filter(com => {
      return com.uuid !== id;
    });
    templateInstance.data.scheme.set('comments', comments);
  },
  'click .add-comment'(event, templateInstance) {
    event.preventDefault();
    const comments = templateInstance.data.scheme.get('comments');
    comments.push({
      uuid: generateUUID(),
    });
    templateInstance.data.scheme.set('comments', comments);
  },
  'change input'(event, templateInstance) {
    const comments = templateInstance.data.scheme.get('comments');
    const commentArray = templateInstance.data.scheme.get('commentHistory');
    // Most efficient loop through array elements https://jsperf.com/loops
    for (const i in comments) {
      if (comments.hasOwnProperty(i)) {
        const com = comments[i];
        com.comment = $(`.comment-item[data-uuid="${com.uuid}"] input`).val();
      }
    }
    templateInstance.data.scheme.set('comments', comments);
    commentArray.push(comments);
    templateInstance.data.scheme.set('commentHistory', commentArray);
  },
  'keydown .last-comment'(event) {
    if (event.keyCode === 9 && !event.shiftKey &&
      $(event.currentTarget).find('input').val().length > 0) {
      event.preventDefault();
      $('.add-comment').trigger('click');
      setTimeout(() => {
        $('.last-comment input').focus();
      }, 100);
    }
  },
  'keydown input'(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      // Translate that return into a tab...
      const e = new jQuery.Event('keydown', {
        keyCode: 9,
      });
      $(event.currentTarget).trigger(e);
    }
  },
  'click .undo-comment-action'(event, templateInstance) {
    event.preventDefault();
    const commentArray = templateInstance.data.scheme.get('commentHistory');
    templateInstance.data.scheme.set('comments', commentArray.pop());
    templateInstance.data.scheme.set('commentHistory', commentArray);
  },
});
