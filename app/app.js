import cujs from 'chris-upload';
import collaborate from './index';
import Request from '@fnndsc/chrisapi/src/request';

// Create an object
var cu = new cujs();
let feedId;

/**
 * Private method to download a blob/file/stream from CUBE 
 *
 * @param {String} url API endpoint to a particular resource in CUBE
 * @response {Promise} JS promise, resolves to a string value
 */
async function _download(url){
    var client = await cu.getToken();
    const req = new Request(client.auth, 'application/octet-stream', 30000000);
    const blobUrl = url;
    return req.get(blobUrl).then(resp => resp.data);
};




const upload = document.getElementById('upload');
const share = document.getElementById('share');
const login = document.getElementById('login');
const txtUser = document.getElementById('txtUser');
const txtPwd = document.getElementById('txtPwd');
const lblMsg = document.getElementById('lblMsg');
const txtShareUser = document.getElementById('txtShareUser');
const download = document.getElementById('download');
const txtCollab = document.getElementById('txtCollab');
const txtShareCollab = document.getElementById('txtShareCollab');
const alert = document.getElementById('alert');
const myShared = document.getElementById('myShared');
const myUploaded = document.getElementById('myUploaded');
const myFiles = document.getElementById('myFiles');
const lblUser = document.getElementById('lblUser');
const viewer = document.getElementById('viewer');
const renderImg = document.getElementsByClassName('renderImg') ;
const xclk = document.getElementById('x');
const yclk = document.getElementById('y');
const zclk = document.getElementById('x');
const delay = ms => new Promise(res => setTimeout(res, ms));

alert.style.display='none';

xclk.onclick = function(){
  if(renderImg){
    renderImg[0].style.transform = 'rotate(90deg)';
  }
};
yclk.onclick = function(){
  if(renderImg){
    renderImg[0].style.transform = 'rotate(180deg)';
  }
};
zclk.onclick = function(){
  if(renderImg){
    renderImg[0].style.transform = 'rotate(270deg)';
  }
};
/**
 *
 *
 *
 */
const zoomElement = document.querySelector(".zoom");
let zoom = 1;
const ZOOM_SPEED = 0.1;

document.addEventListener("wheel", function(e) {

  
  if(zoomElement){  
    
    if(e.deltaY > 0){    
        zoomElement.style.transform = `scale(${zoom += ZOOM_SPEED})`;  
    }else{    
        zoomElement.style.transform = `scale(${zoom -= ZOOM_SPEED})`;  }
  }

});


/**
 * Click on my files tab
 *
 *
 */
myFiles.onclick = function () {
  // Clean first
  // Load shared feeds in the sidebar

  mySidebar.style.display = "block";
  mySidebar.style.width = "15%";
}

/**
 * Display shared feeds to this user
 *
 */
 async function displaySharedFeeds(){

    var resp = cu.getFeeds('share');
    
    var shared =[];
    resp.then(data=>{
     for (const f of data.collection.items){
      shared.push(f.data[0].value+":"+f.data[3].value);
     }
    });
    await delay(1000);
    loadFiles(shared,myShared);
 };


upload.onchange = function(){
  var fileNames = [];
  for(var i=0; i<upload.files.length;i++){
    fileNames.push(URL.createObjectURL(upload.files[i]));
  }
  createThumbnails(upload.files)
  viewer.onload(fileNames);

};

viewer.onload = function(fileNames){

  var newView = document.createElement('div');
  newView.id = "test"
  viewer.appendChild(newView)

  // create a new 3d renderer
  var r = new X.renderer2D();
  r.orientation='X'
  r.container='test'
  r.init();
    
  // create a mesh from a .vtk file
  var skull = new X.volume();

  skull.file = fileNames
    
  // add the object
  r.add(skull);
    
  // .. and render it
  r.render();
}


async function createThumbnails(files){
  for(var i=0; i<files.length;i++){
    var a = document.createElement('a');
    a.className ="w3-bar-item def w3-button w3-small"
    a.target = "_blank";
    a.addEventListener("click",renderImage,true);
    var img = document.createElement('img');
    img.className="thumbnail"
    img.alt=files[i].name;
    img.id = i
    img.src=URL.createObjectURL(files[i]);
    img.style = "width:100px";
    a.appendChild(img);
    myUploaded.appendChild(a);
  }

  
};

async function renderImage(event){
  var i,x;
  x = document.getElementsByClassName('renderImg');
  for(i=0; i<x.length;i++){
    x[i].remove();
  }
  var idx = event.path[0].id;
  var image = document.createElement('img');
  image.alt = upload.files[idx].name;
  image.src = URL.createObjectURL(upload.files[idx]);
  image.className = 'renderImg';
  viewer.appendChild(image);
  
};

async function loadFiles(files,control){
  
  clearControls("del");
  var myShared = document.createElement('div');
  myShared.className = "w3-bar-item shared";
  var button = document.createElement('button');
  button.className = "w3-bar-item w3-large w3-green";
  button.appendChild(document.createTextNode("Shared"));
  myShared.appendChild(button);
  mySidebar.appendChild(myShared)
  for(var i=0; i<files.length;i++){
    var a = document.createElement('div');
    //a.setAttribute('onclick', a_click());
    a.appendChild(document.createTextNode(files[i]));
    a.className ="w3-bar-item def w3-button w3-small"
    a.addEventListener("click",btnclick,true);
    var btn = document.createElement('button');
    btn.id = files[i]
    btn.className = "w3-small del w3-animate-left ";
    btn.appendChild(document.createTextNode("X"));
    a.appendChild(btn);
    myShared.appendChild(a);  
  }
  
};

/**
 * Clear all controls of a given class
 *
 *
 */
 function clearControls(className){
   var i,x;
   x = document.getElementsByClassName("shared");
   for(i=0;i<x.length;i++){
     x[i].remove();
   }

 };
 

async function btnclick(e){

  var path = e.path[0].id;
  var paths = path.split(':');
  
  await cu.deleteFeed(parseInt(paths[0]));
  alert.style.display='block';
  alert.className="w3-red w3-panel w3-display-container w3-display-topmiddle";
  msg.textContent = "Shared feed "+paths[1]+" deleted successfully";
  displaySharedFeeds()
  };




share.onclick = async function(){
  await cu.shareFeed(txtShareUser.value,parseInt(txtShareCollab.value),'Medview_share_'+Date.now());
  await delay(500);
  alert.style.display='block';
  alert.className="w3-green w3-panel w3-display-container w3-display-topmiddle";
  msg.textContent = "Collaboration id "+txtShareCollab.value+" shared with user "+txtShareUser.value;
  displaySharedFeeds();
  collaborate();
};


login.onclick = async function(){
  await cu.login('http://localhost:8000/api/v1/',txtUser.value,txtPwd.value);
  lblUser.textContent=txtUser.value;
  msg.textContent = "Logged in as "+ txtUser.value;
  alert.style.display='block';
  alert.className="w3-green w3-panel w3-display-container w3-display-topmiddle";
  await delay(500);
  displaySharedFeeds();
};


submit.onclick = async function(){
  msg.textContent="Generating token. Please wait";
  alert.style.display='block';
  alert.className="w3-orange w3-panel w3-display-container w3-display-topmiddle";
  var resp = cu.uploadFiles(upload.files,"Medview_"+Date.now() );
  resp.then(data =>{
    feedId=cu.getPluginId(data);
    cu.getFeedId(feedId);
    msg.textContent="Generated collaboration id is "+feedId;
    alert.style.display='block';
    alert.className="w3-blue w3-panel w3-display-container w3-display-topmiddle";
    });
};

download.onclick = async function(){

  msg.textContent = "Joining. Please wait";
  alert.style.display='block';
  alert.className="w3-orange w3-panel w3-display-container w3-display-topmiddle";
  let fileNames = [];
  fileNames =  await cu.viewFiles(parseInt(txtCollab.value),'saved');
  await delay(2000)
  if(fileNames.length>0){
    collaborate();
    var files =[];
    for(var i =0; i<fileNames.length;i++){
      var resp = await  _download(fileNames[i]);
      if(resp.type=='application/dicom'){
        files.push(URL.createObjectURL(resp));
      }

    }

    viewer.onload(files)
   
    msg.textContent = "Joined successfully."+fileNames.length +" files available!";
    
  }
  else{
    msg.textContent = "Files not available yet. Try again after sometime."
  }
  
  displaySharedFeeds();

  alert.style.display='block';
  alert.className="w3-green w3-panel w3-display-container w3-display-topmiddle";
};
