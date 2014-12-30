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
    this.id = '';

  }


  fileManager.FileManager.prototype.isInCloud = function(file){}

  fileManager.FileManager.prototype.cloudUpload = function(fileArray){}

  fileManager.FileManager.prototype.cloudDownload = function(fileArray){}

  fileManager.FileManager.prototype.isLocalFile = function(file){}

  fileManager.FileManager.prototype.readLocalFile = function(fileArray){}

  fileManager.FileManager.prototype.writeLocalFile = function(fileArray){}
