Meteor.startup(() => {
  $('html').attr('lang', 'en');
  RouterAutoscroll.marginTop = 50;
  sAlert.config({
    position: 'top',
    effect: 'stackslide',
    html: true,
  });
});

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
