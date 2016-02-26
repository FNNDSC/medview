/**
 * Medview app
 *
 * This app can read a directory tree (chrome) or multiple neuroimage files in the same
 * directory (other browsers) for their visualization and collaboration. Alternatively,
 * users can directly drag in and drop files/folders onto the viewer.
 */

// define a new module
define(
  [
  // bower components
  '../../../gcjs/src/js/gcjs',
  '../../../viewerjs/src/js/viewerjs'

  ], function(cjs, viewerjs) {

    // Provide a namespace
    var medview = medview || {};

    medview.App = function() {

      // Client ID from the Google's developer console
      this.CLIENT_ID = '1050768372633-ap5v43nedv10gagid9l70a2vae8p9nah.apps.googleusercontent.com';

      this.collaborator = new cjs.GDriveCollab(this.CLIENT_ID);

      // Create a new viewerjs.Viewer object
      // A collaborator object is only required if we want to enable realtime collaboration.
      this.view = new viewerjs.Viewer('viewercontainer', this.collaborator);
    };

    medview.App.prototype.init = function() {

      this.view.init();
    };

    medview.App.prototype.destroy = function() {

      this.view.destroy();
    };

    return medview;
  });
