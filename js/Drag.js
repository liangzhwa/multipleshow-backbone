var Drag={
    "obj":null,
	"init":function(handle, dragBody, e){
		if (e == null) {
			handle.onmousedown=Drag.start;
		}
		handle.root = dragBody;
		
		if(isNaN(parseInt(handle.root.style.left)))handle.root.style.left="0px";
		if(isNaN(parseInt(handle.root.style.top)))handle.root.style.top="0px";
		handle.root.onDragStart=new Function();
		handle.root.onDragEnd=new Function();
		handle.root.onDrag=new Function();
		if (e !=null) {
			var handle=Drag.obj=handle;
			e=Drag.fixe(e);
			var top=parseInt(handle.root.style.top);
			var left=parseInt(handle.root.style.left);
			handle.root.onDragStart(left,top,e.pageX,e.pageY);
			handle.lastMouseX=e.pageX;
			handle.lastMouseY=e.pageY;
			document.onmousemove=Drag.drag;
			document.onmouseup=Drag.end;
		}
	},
	"start":function(e){
		var handle=Drag.obj=this;
		e=Drag.fixEvent(e);
		var top=parseInt(handle.root.style.top);
		var left=parseInt(handle.root.style.left);
		handle.root.onDragStart(left,top,e.pageX,e.pageY);
		handle.lastMouseX=e.pageX;
		handle.lastMouseY=e.pageY;
		document.onmousemove=Drag.drag;
		document.onmouseup=Drag.end;
		return false;
	},	
	"drag":function(e){
		e=Drag.fixEvent(e);
		var handle=Drag.obj;
		var mouseY=e.pageY;
		var mouseX=e.pageX;
		var top=parseInt(handle.root.style.top);
		var left=parseInt(handle.root.style.left);
		
		var currentLeft,currentTop;
		currentLeft=left+mouseX-handle.lastMouseX;
		currentTop=top+(mouseY-handle.lastMouseY);
		
		handle.root.style.left=currentLeft +"px";
		handle.root.style.top=currentTop+"px";
		
		handle.lastMouseX=mouseX;
		handle.lastMouseY=mouseY;
		
		handle.root.onDrag(currentLeft,currentTop,e.pageX,e.pageY);
		return false;
	},
	"end":function(){
		document.onmousemove=null;
		document.onmouseup=null;
		Drag.obj.root.onDragEnd(parseInt(Drag.obj.root.style.left),parseInt(Drag.obj.root.style.top));
		Drag.obj=null;
	},
	"fixEvent":function(e){
		if(typeof e=="undefined")e=window.event;
		if(typeof e.layerX=="undefined")e.layerX=e.offsetX;
		if(typeof e.layerY=="undefined")e.layerY=e.offsetY;
		if(typeof e.pageX == "undefined")e.pageX = e.clientX + document.body.scrollLeft - document.body.clientLeft;
		if(typeof e.pageY == "undefined")e.pageY = e.clientY + document.body.scrollTop - document.body.clientTop;
		return e;
	}
};

function findPosX(obj) {
	var curleft = 0;
	if (obj && obj.offsetParent) {
		while (obj.offsetParent) {
			curleft += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	} else if (obj && obj.x) curleft += obj.x;
	return curleft;
}

function findPosY(obj) {
	var curtop = 0;
	if (obj && obj.offsetParent) {
		while (obj.offsetParent) {
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		}
	} else if (obj && obj.y) curtop += obj.y;
	return curtop;
}