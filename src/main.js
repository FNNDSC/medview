require.config({
  baseUrl: 'js/components',
  paths: {
    // The left side is the module ID, the right side is the path to the file relative
    // to baseUrl (which is in turn relative to the directory of this config script).
    // Also, the path should NOT include the '.js' file extension.
    // This example tries to load jQuery from Google's CDN first and if failure then falls
    // back to the local jQuery at jquery/dist/jquery.min.js relative to the baseUrl.
    //
    // All JS modules are needed in development mode. However the only modules needed after
    // building the app are jquery, jquery_ui and mi2b2.
    jquery: ['https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min', 'jquery/dist/jquery.min'],
    jquery_ui: ['https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min', 'jquery-ui/jquery-ui.min'],
    gapi: 'https://apis.google.com/js/api',
    jszip: 'jszip/dist/jszip',
    dicomParser: 'dicomParser/dist/dicomParser.min',
    utiljs: 'utiljs/src/js/utiljs',
    fmjs: 'fmjs/src/js/fmjs',
    gcjs: 'gcjs/src/js/gcjs',
    rendererjs: 'rendererjs/src/js/rendererjs',
    xtk: 'rendererjs/src/js/lib/xtk',
    rboxjs: 'rboxjs/src/js/rboxjs',
    thbarjs: 'thbarjs/src/js/thbarjs',
    toolbarjs: 'toolbarjs/src/js/toolbarjs',
    chatjs: 'chatjs/src/js/chatjs',
    jqdlgext: 'chatjs/src/js/lib/jquery.dialogextend',
    viewerjs: 'viewerjs/src/js/viewerjs',
    mi2b2: '../mi2b2'
  }
});


require(['mi2b2'], function(mi2b2) {

  // Entry point
  var app = new mi2b2.App();

  app.init();
});
