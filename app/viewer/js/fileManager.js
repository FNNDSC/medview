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

  /**
   * Request sandboxed filesystem
   */
  fileManager.FileManager.prototype.requestFileSystem = function() {
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

  /**
   * Determine whether a file exists in the sandboxed FS
   *
   * @param {String} file path.
   */
  fileManager.FileManager.prototype.isLocalFile = function(fPath) {

  }

  /**
   * Read a list of files from the sandboxed FS
   *
   * @param {Array} file path.
   */
  fileManager.FileManager.prototype.readLocalFile = function(fPathArray) {
    var isFile = false;

    if (this.fs) {
      this.fs.root.getFile('log.txt', {create: false}, function(fileEntry) {

     // fileEntry.isFile === true
     // fileEntry.name == 'log.txt'
     // fileEntry.fullPath == '/log.txt'

   }, errorHandler);
    }
    return isFile;

  }

  fileManager.FileManager.prototype.writeLocalFile = function(fPathArray) {}

  fileManager.FileManager.prototype.isInCloud = function(fPath) {}

  fileManager.FileManager.prototype.cloudUpload = function(fPathArray) {}

  fileManager.FileManager.prototype.cloudDownload = function(fPathArray) {}
