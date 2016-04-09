/**
 * Global controllers.
 * Used for alerting, autoscrolling and navigation, which are attached to
 * layouts not specific templates.
 */

Meteor.startup(() => {
  // Set html language attribute;
  $('html').attr('lang', 'en');
  // Tell Autoscroll about the nav bar.
  RouterAutoscroll.marginTop = 50;
  // Default alerting config.
  sAlert.config({
    position: 'top',
    effect: 'stackslide',
    html: true,
  });
});

/**
 * Initialize Semantic UI navigation components.
 */
Template.navigation.onRendered(() => {
  $('.ui.menu .ui.dropdown').dropdown({
    on: 'hover',
  });
  $('.ui.menu .sign-in').popup({
    inline: true,
    hoverable: true,
    position: 'bottom right',
    delay: {
      show: 100,
      hide: 800,
    },
  });
});
