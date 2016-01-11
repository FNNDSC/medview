/**
 * mi2b2 app
 *
 * This app reads a directory tree from a directory picker/dropzone button (chrome)
 * or multiple neuroimage files in the same directory (other browsers) into an array
 * of objects and pass it to a viewerjs.Viewer object for visualization and collaboration.
 * The app can contain several viewerjs.Viewer objects which will be displayed in different tabs.
 * A new viewer tab can also be started by joining an existing realtime collaboration among
 * remote viewerjs.Viewer instances.
 */

// define a new module
define(['utiljs', 'gcjs', 'viewerjs'], function(util, cjs, viewerjs) {

  // Provide a namespace
  var mi2b2 = mi2b2 || {};

    mi2b2.App = function() {

      // client ID from the Google's developer console
      this.CLIENT_ID = '1050768372633-ap5v43nedv10gagid9l70a2vae8p9nah.apps.googleusercontent.com';

      // array of file objects, each object has properties url: the file's url and file: HTML5 File obj
      this._fObjArr = [];

      // array of viewer objects (one viewer per tab)
      this.views = [];
      this.nviews = 0;
    };

    /**
     * Init the mi2b2 app.
     */
    mi2b2.App.prototype.init = function() {
      var self = this;

      // init jQuery UI tabs
      self.tabs = $('#tabs').tabs({ beforeActivate: function() {

        for (var i=0; i<self.views.length; i++) {

          if (self.views[i] && self.views[i].chat && self.views[i].chat.isOpen()) {
            self.views[i].chat.close();
          }
        } }
      });

      self.tabs = $('#tabs').tabs({ activate: function(event, ui) {
        var viewId = ui.newPanel.attr('id');

        if (viewId!=='tabload') {
          var viewNum = parseInt(viewId.replace('tabviewer', ''));

          if (self.views[viewNum].chat) {
            self.views[viewNum].chat.open();
          }
        }

        util.documentRepaint();}
      });

      // close icon: removing the tab on click
      self.tabs.delegate( "span.ui-icon-close", "click", function() {

        var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
        var pStrL= panelId.length;
        var ix = parseInt(parseInt(panelId.charAt(pStrL-2)) ? panelId.substr(pStrL-2) : panelId.charAt(pStrL-1));

        self.views[ix].destroy();
        self.views[ix] = null;
        self.nviews--;

        $( "#" + panelId ).remove();
        self.tabs.tabs( "refresh" );
      });

      // Event handler for the collab button
      $('#collabbutton').click(function() {

        $('.collab > .collab-input').slideToggle("fast");

        if ($(this).text()==='Hide room ID') {

          $(this).text('Join collaboration');

        } else {

          $(this).text('Hide room ID');
          $('#roomId').focus();

          // create a collaborator object,
          var collab = new cjs.GDriveCollab(self.CLIENT_ID);

          // request GDrive authorization and load the realtime Api
          collab.authorizeAndLoadApi(true, function(granted) {

            var goButton = document.getElementById('gobutton');
            var roomIdInput = document.getElementById('roomId');

            if (granted && roomIdInput.value) {

              // realtime API ready.
              goButton.onclick = function() {

                // data will be loaded remotely
                self.localData = false;

                var view = self.addView(collab);

                // start the collaboration as an additional collaborator
                view.collab.joinRealtimeCollaboration(roomIdInput.value);
              };

            } else {

              goButton.onclick = function() {

                // start the authorization flow.
                collab.authorizeAndLoadApi(false, function(granted) {

                  if (granted && roomIdInput.value) {

                    // realtime API ready.
                    // data will be loaded remotely
                    self.localData = false;

                    var view = self.addView(collab);

                    // start the collaboration as an additional collaborator
                    view.collab.joinRealtimeCollaboration(roomIdInput.value);
                  }
                });
              };
            }
          });
        }
      });

      // Event handler for the README button
      $('#READMEbutton').click(function() {
        window.open('https://github.com/FNNDSC/mi2b2/blob/master/README.md');
      });

      // Event handler for the directory loader button
      var dirBtn = document.getElementById('dirbtn');

      dirBtn.onchange = function(e) {

        // data is loaded locally
        self.localData = true;

        var files = e.target.files;
        var fileObj;

        self._fObjArr = [];

        for (var i=0; i<files.length; i++) {

          fileObj = files[i];

          if ('webkitRelativePath' in fileObj) {

            fileObj.fullPath = fileObj.webkitRelativePath;

          } else if (!('fullPath' in fileObj)) {

            fileObj.fullPath = fileObj.name;
          }

          self._fObjArr.push({
            'url': files[i].fullPath,
            'file': files[i]
          });
        }

        if (self._fObjArr.length) {

          // create a collaborator object to enable realtime collaboration
          var collab = new cjs.GDriveCollab(self.CLIENT_ID);

          // add a new viewer
          self.addView(collab);
        }
      };

      // Dropzone
      util.setDropzone('tabload', function(fObjArr) {

        // data is loaded locally
        self.localData = true;

        if (fObjArr.length) {

          self._fObjArr = fObjArr;

          // create a collaborator object to enable realtime collaboration
          var collab = new cjs.GDriveCollab(self.CLIENT_ID);

          // add a new viewer
          self.addView(collab);
        }
      });
    };

    /**
     * Add a new viewer to the list of viewers and append its GUI.
     *
     * @param {Object} optional collaborator object to enable realtime collaboration.
     */
    mi2b2.App.prototype.addView = function(collaborator) {
      var self = this;

      // disable tabs when adding a new view
      $('#tabs').tabs("disable");

      var viewNum = self.views.length;
      var viewId = 'viewer' + viewNum;
      var tabContentId = 'tabviewer' + viewNum;

      // add a new tab with a close icon
      $('div#tabs ul').append('<li><a href="#' + tabContentId + '">' + 'Viewer' + (viewNum+1) +
        '</a><span class="ui-icon ui-icon-close" role=presentation>Remove Tab</span></li>');

      $('div#tabs').append('<div id="' + tabContentId  + '"></div>');

      $("div#tabs").tabs("refresh");

      // append viewer div
      $('#' + tabContentId).append('<div id="' + viewId + '" class="viewer-container">');

      // instantiate a new viewerjs.Viewer object
      // a collaborator object is only required if we want to enable realtime collaboration.
      var view = new viewerjs.Viewer(viewId, collaborator);

      // overwrite onViewerReady event that is fired when a collaborator's viewer is ready
      view.onViewerReady = function() {

        $('#tabs').tabs("enable");
      };

      if (self.localData) {

        // start the viewer with local data
        view.init();

        view.addData(self._fObjArr, function() {

          $('#tabs').tabs("enable");
        });
      }

      self.views.push(view);
      ++self.nviews;

      $('#tabs').tabs("option", "active", self.nviews);

      return view;
    };


  return mi2b2;
});