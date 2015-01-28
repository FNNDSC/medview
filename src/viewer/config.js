require.config({
    baseUrl: 'viewer',
    paths: {
        // the left side is the module ID, the right side is the path to
        // the file, relative to baseUrl.
        // Also, the path should NOT include the '.js' file extension.
        // This example is using jQuery located at
        // components/jquery/dist/jquery.min.js relative to the baseUrl.
        // It tries to load jQuery from Google's CDN first and falls back
        // to load locally
        jquery: ['https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min', 'components/jquery/dist/jquery.min'],
        jquery_ui: 'components/jquery-ui/jquery-ui.min',
        dicomParser: 'lib/dicomParser.min',
        collab: 'js/collab',
        fancytree: 'lib/fancytree/jquery.fancytree.min',
        xtk: 'lib/xtk',
        xdat: 'lib/xtk_xdat.gui',
        fmjs: 'js/fmjs',
        viewer: 'js/viewer',
    }
});

// 1st level dependencies
require(['jquery', 'jquery_ui', 'fmjs'], function() {
  // 2nd level dependencies
  require(['collab', 'fancytree', 'xtk', 'xdat', 'dicomParser'], function() {
    // 3rd level dependencies
    require(['https://togetherjs.com/togetherjs-min.js', 'https://apis.google.com/js/client.js', 'viewer'], function() {
      require([

        // Put the path to your script (the one who instantiates a viewer object)
        // relative to the viewer folder here
        '../main.js'

        ]);
    });
  });
});
