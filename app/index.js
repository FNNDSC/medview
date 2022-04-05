async function collaborate () {

    const ws = await connectToServer();   
    const viewer = document.getElementById('viewer') ;
    const renderImg = document.getElementsByClassName('renderImg') ;
    viewer.style = "cursor:none"
    let zoom = 1;
    const ZOOM_SPEED = 0.1;
    ws.onmessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);
        const cursor = getOrCreateCursorFor(messageBody);
        cursor.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;
        if(messageBody.p && renderImg[0]){
          if(messageBody.p> 0){    
            renderImg[0].style.transform = `scale(${zoom += ZOOM_SPEED})`;  
          }else{    
            renderImg[0].style.transform = `scale(${zoom -= ZOOM_SPEED})`;  }
          }
        
    };        
    
    viewer.onmousemove = (evt) => {
        const messageBody = { x: evt.clientX, y: evt.clientY };
        ws.send(JSON.stringify(messageBody));
    };
    
    viewer.addEventListener("wheel", function(e) {
        const messageBody = { p:e.deltaY };
        ws.send(JSON.stringify(messageBody));
    });
        
    async function connectToServer() {    
        const ws = new SockJS('http://localhost:1234/ws');
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if(ws.readyState === 1) {
                    clearInterval(timer);
                    resolve(ws);
                }
            }, 1);
        });   
    }

    function getOrCreateCursorFor(messageBody) {
        const sender = messageBody.sender;
        const existing = document.querySelector(`[data-sender='${sender}']`);
        if (existing) {
            return existing;
        }
        
        const template = document.getElementById('cursor');
        const cursor = template.content.firstElementChild.cloneNode(true);
        const svgPath = cursor.getElementsByTagName('path')[0];    
            
        cursor.setAttribute("data-sender", sender);
        svgPath.setAttribute('fill', `hsl(${messageBody.color}, 50%, 50%)`); 
        console.log(viewer.children)
        viewer.children[4].appendChild(cursor);

        return cursor;
    }

}
export default collaborate;
