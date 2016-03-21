/**
 * Controller for adding comments to new scheme.
 */

/**
 * Helper functions.
 */
Template.commentBuilder.helpers({
  comments: function() {
    return Template.instance().data.scheme.get('comments');
  },
  isLast: function(index) {
    if (index === Template.instance().data.scheme.get('comments').length - 1) {
      return 'last-comment';
    } else {
      return '';
    }
  },
  canUndo: function() {
    let commentHistory = Template.instance().data.scheme.get('commentHistory');
    return commentHistory && commentHistory.length > 0;
  }
});

/**
 * Event listeners.
 */
Template.commentBuilder.events({
  'click .comment-remove': function(evt, template) {
    evt.preventDefault();
    let comments = template.data.scheme.get('comments'),
      id = $(evt.currentTarget).closest('.comment-item').attr('data-uuid');
    comments = comments.filter((com) => {
      return com.uuid !== id;
    });
    template.data.scheme.set('comments', comments);
  },
  'click .add-comment': function(evt, template) {
    evt.preventDefault();
    let comments = template.data.scheme.get('comments');
    comments.push({
      uuid: UI._globalHelpers.generateUUID()
    });
    template.data.scheme.set('comments', comments);
  },
  'change input': function(evt, template) {
    let comments = template.data.scheme.get('comments'),
      commentArray = template.data.scheme.get('commentHistory');
    comments.forEach((com) => {
      com.comment = $('.comment-item[data-uuid="' + com.uuid + '"] input')
        .val();
    });
    template.data.scheme.set('comments', comments);
    commentArray.push(comments);
    template.data.scheme.set('commentHistory', commentArray);

  },
  'keydown .last-comment': function(evt) {
    if (evt.keyCode === 9 && !evt.shiftKey &&
        $(evt.currentTarget).find('input').val().length > 0) {
          evt.preventDefault();
          $('.add-comment').trigger('click');
          setTimeout(function() {
            $('.last-comment input').focus();
          }, 100);
    }
  },
  'keydown input': function(evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      // Translate that return into a tab...
      var e = jQuery.Event('keydown', {
        keyCode: 9
      });
      $(evt.currentTarget).trigger(e);
    }
  },
  'click .undo-comment-action': function(evt, template) {
    evt.preventDefault();
    let commentArray = template.data.scheme.get('commentHistory');
    template.data.scheme.set('comments', commentArray.pop());
    template.data.scheme.set('commentHistory', commentArray);
  }
});
