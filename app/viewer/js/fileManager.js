/**
 * This object takes care of all file reading and saving operations, including
 * cloud uploading/downloading operations as well as reading/writing the
 * HTML5 sandbox file system.
 *
 * FEATURES
 * - Upload/Download files from the cloud
 * - Read/write files from/to HTML5 sandbox file system
 *
 * TECHNOLOGY
 * - HTML5 filesystem API
 * - Google drive API
 */


//Provide a namespace
var fileManager = fileManager || {};


  fileManager.FileManager = function() {

    this.version = 0.0;
    // local filesystem object
    this.fs = null;

  }


  fileManager.FileManager.prototype.requestFileSystem = function(file){
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


  fileManager.FileManager.prototype.fsErrorHandler = function(fe) {
    var msg = '';

    switch (fe.code) {
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


  fileManager.FileManager.prototype.isLocalFile = function(file) {}

  fileManager.FileManager.prototype.readLocalFile = function(fileArray) {}

  fileManager.FileManager.prototype.writeLocalFile = function(fileArray) {}

  fileManager.FileManager.prototype.isInCloud = function(file) {}

  fileManager.FileManager.prototype.cloudUpload = function(fileArray) {}

  fileManager.FileManager.prototype.cloudDownload = function(fileArray) {}
