/**
 * Controller for adding comments to new scheme.
 */

/**
 * Helper functions.
 */
Template.commentBuilder.helpers({
  comments: function() {
    return Session.get('comments');
  },
  isLast: function(index) {
    if (index === Session.get('comments').length - 1) {
      return 'last-comment';
    } else {
      return '';
    }
  },
  canUndo: function() {
    let commentHistory = Session.get('commentHistory');
    return commentHistory && commentHistory.length > 0;
  }
});

/**
 * Event listeners.
 */
Template.commentBuilder.events({
  'click .comment-remove': function(evt) {
    evt.preventDefault();
    let comments = Session.get('comments'),
      id = $(evt.currentTarget).closest('.comment-item').attr('data-uuid');
    comments = comments.filter((com) => {
      return com.uuid !== id;
    });
    Session.set('comments', comments);
  },
  'click .add-comment': function(evt) {
    evt.preventDefault();
    let comments = Session.get('comments');
    comments.push({
      uuid: UI._globalHelpers.generateUUID()
    });
    Session.set('comments', comments);
  },
  'change input': function() {
    let comments = Session.get('comments'),
      commentArray = Session.get('commentHistory');
    comments.forEach((com) => {
      com.comment = $('.comment-item[data-uuid="' + com.uuid + '"] input')
        .val();
    });
    Session.set('comments', comments);
    commentArray.push(comments);
    Session.set('commentHistory', commentArray);

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
  'click .undo-comment-action': function(evt) {
    evt.preventDefault();
    let commentArray = Session.get('commentHistory');
    Session.set('comments', commentArray.pop());
    Session.set('commentHistory', commentArray);
  }
});
