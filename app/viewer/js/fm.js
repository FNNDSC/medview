/**
 * This file manager module takes care of all file reading and saving operations
 * on diverse filesystems, including cloud uploading/downloading operations as
 * well as reading/writing the HTML5 sandboxed file system.
 *
 * FEATURES
 * - Read/write files from/to HTML5 sandbox file system
 * - Upload/Download files from the cloud
 *
 * TECHNOLOGY
 * - HTML5 filesystem API
 * - Google drive API
 */


//Provide a namespace for the file manager module
var fm = fm || {};

  /**
   * Generic abstract method
   */
  fm.abstractmethod = function() {
    throw new Error('abstract method');
  }

  /**
   * Abstract class defining a file manager's interface
   */
  fm.AbstractFileManager = function() {
    throw new Error('Can not instantiate abstract classes');
  }

  fm.AbstractFileManager.prototype.isFile = fm.abstractmethod;

  fm.AbstractFileManager.prototype.readFile = fm.abstractmethod;

  fm.AbstractFileManager.prototype.writeFile = fm.abstractmethod;


  /**
   * Concrete class implementing a file manager for the local FS.
   * Currently uses the HTML5's sandboxed FS API (only implemented on Chrome)
   */
  fm.LocalFileManager = function() {

    // local filesystem object
    this.fs = null;

  }

  /**
   * fm.LocalFileManager class inherits from fm.AbstractFileManager class
   */
  fm.LocalFileManager.prototype = Object.create(fm.AbstractFileManager.prototype);
  fm.LocalFileManager.prototype.constructor = fm.LocalFileManager;

  /**
   * Request sandboxed filesystem
   */
  fm.LocalFileManager.prototype.requestFileSystem = function() {
    var self = this;

    // The file system has been prefixed as of Google Chrome 12:
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    // Request 5GB
    /*window.webkitStorageInfo.requestQuota( PERSISTENT, 5*1024*1024*1024, function(grantedBytes) {
      window.requestFileSystem(PERSISTENT, grantedBytes, function(fs){self.fs = fs;}, self.fsErrorHandler);
    }, function(e) {
      console.log('Error', e);} ); */
    if (window.requestFileSystem) {
      window.requestFileSystem(window.TEMPORARY, 5*1024*1024*1024, function(fs){
        self.fs = fs;
      }, self.fsErrorHandler);
    }
  }

  /**
   * Filesystem errors' handler callback
   *
   * @param {Object} FileError object.
   */
  fm.LocalFileManager.prototype.fsErrorHandler = function(fe) {
    var msg = '';

    switch(fe.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        break;
    };
    console.log('Error: ' + msg);
  }

  /**
   * Determine whether a file exists in the sandboxed FS
   *
   * @param {String} file's path.
   */
  fm.LocalFileManager.prototype.isFile = function(fPath) {

  }

  /**
   * Read a list of files from the sandboxed FS
   *
   * @param {Array} file's path.
   */
  fm.LocalFileManager.prototype.readFile = function(fPathArray) {
    var numOfReadFiles = 0;

    if (this.fs) {
      for (var i=0; i<fPathArray.length; i++) {

      }
      this.fs.root.getFile('log.txt', {create: false}, function(fileEntry) {

     // fileEntry.isFile === true
     // fileEntry.name == 'log.txt'
     // fileEntry.fullPath == '/log.txt'

   }, errorHandler);
    }
    return isFile;

  }

  /**
   * Write a list of files to the sandboxed FS
   *
   * @param {Array} file's path.
   */
  fm.LocalFileManager.prototype.writeFile = function(fPathArray) {}


  /**
   * Concrete class implementing a file manager for Google Drive.
   * Uses Google Drive's API
   */
  fm.GDriveFileManager = function() {


  }

  /**
   * fm.GDriveFileManager class inherits from fm.AbstractFileManager class
   */
  fm.GDriveFileManager.prototype = Object.create(fm.AbstractFileManager.prototype);
  fm.GDriveFileManager.prototype.constructor = fm.GDriveFileManager;

  /**
   * Determine whether a file exists in the GDrive cloud
   *
   * @param {String} file's url.
   */
  fm.GDriveFileManager.prototype.isFile = function(url) {

  }

  /**
   * Read a list of files from GDrive cloud
   *
   * @param {Array} file's url.
   */
  fm.GDriveFileManager.prototype.readFile = function(urlArray) {}

  /**
   * Write a list of files to GDrive cloud
   *
   * @param {Array} file's url.
   */
  fm.LocalFileManager.prototype.writeFile = function(urlArray) {}


  /**
   * Concrete class implementing a file manager for Dropbox.
   * Uses Dropbox API
   */
  fm.DropboxFileManager = function() {


  }

  /**
   * fm.DropboxFileManager class inherits from fm.AbstractFileManager class
   */
  fm.DropboxFileManager.prototype = Object.create(fm.AbstractFileManager.prototype);
  fm.DropboxFileManager.prototype.constructor = fm.DropboxFileManager;

  /**
   * Determine whether a file exists in the Dropbox cloud
   *
   * @param {String} file's url.
   */
  fm.DropboxFileManager.prototype.isFile = function(url) {

  }

  /**
   * Read a list of files from Dropbox cloud
   *
   * @param {Array} file's url.
   */
  fm.DropboxFileManager.prototype.readFile = function(urlArray) {}

  /**
   * Write a list of files to Dropbox cloud
   *
   * @param {Array} file's url.
   */
  fm.DropboxFileManager.prototype.writeFile = function(urlArray) {}
