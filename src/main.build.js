require.config({
  baseUrl: '.',
  paths: {
    jquery: ['https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min',
      'libs/jquery/dist/jquery.min'],
    jqueryUi: ['https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
      'libs/jquery-ui/jquery-ui.min'],
    medview: 'js/medview.min'
  }
});

require(['medview'], function(medview) {

  // Entry point
  var app = new medview.App();
  app.init();
});
