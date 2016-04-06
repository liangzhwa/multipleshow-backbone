var jsonDemon = "";
var originJsonData = "";
var title="";
var canEdit = true;
var currentId = "";
var currentPageIndex=1;
var pageCount = 1;
var nodeId = "";
var hrNotice = "Please click the bar and add a new item";
var sourceInputNotice = "Please input url here...";
var htmlSourceInputNotice = "Please input html source here..."
var neo4jAPIBaseURL = "http://adelie.fla.fujitsu.com:7474/db/data/node/";
var solrAPI = "http://133.164.60.100/solr/select?fq=type:video&wt=json";
var youtubeAPI = "https://gdata.youtube.com/feeds/api/videos?q=@key&alt=json-in-script&start-index=@start&max-results=10&callback=showData";
var imageType = [".jpg",".jpeg",".gif",".bmp",".png",".tiff",".pcx",".tga",".exif",".fpx",".svg",".psd",".cdr",".pcd",".dxf",".ufo",".eps",".ai",".raw"];
var URLKey = {"youtube":"www.youtube.com",
				 "hulu":"www.hulu.com",
				"vimeo":"vimeo.com",
				"slide":"slide.do?action=showSlide",
		   "slideshare":"www.slideshare.net",
			   "flickr":"flickr.com"};

$(document).ready(Init);

function Init(){
	var paraStartIndex = this.location.toString().lastIndexOf("?nodeid="); 
	if(paraStartIndex>0){
		nodeId = this.location.toString().substr(paraStartIndex+8);
		if(nodeId == ""){
			nodeId="1690";
		}
	}else{
		nodeId="1690";
	}
	$.ajax( {
        type: 'GET',
        url: neo4jAPIBaseURL + nodeId,
        success: function(data) {
			//jwang
			//var jsonData = J.StrToJSON(data.data.stub);
			var jsonData = JSON.parse(data.data.stub);
			//alert(jsonData);
			if(typeof(jsonData.title) != "undefined" && jsonData.title != ""){
				$("#divTitleEdit").html(jsonData.title);
				title = jsonData.title;
			}
			if(typeof(jsonData.flexEmbeds) != "undefined"){
				loadViewData(jsonData);
				originJsonData = jsonData;
			}
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });

	Array.prototype.S=String.fromCharCode(2);  
	Array.prototype.in_array=function(e){  
		var r=new RegExp(this.S+e+this.S);  
		return (r.test(this.S+this.join(this.S)+this.S));  
	}

	$("#addAShowWindow").button();
	$("#saveAllData").button();
	$("#editData").button();
	$("#frametab" ).tabs();
	$("#content").hide();
	$("#displaytab").show();

	$("#edit").click(function() {
		$("#displaytab").hide();
		$("#content").show();
		
		if(originJsonData.flexEmbeds != undefined && originJsonData.flexEmbeds.length>0 && $("div.EditBlock").length==0){
			for(var i = 0; i<originJsonData.flexEmbeds.length;i++){
				addAShowWindow(originJsonData.flexEmbeds[i].id,originJsonData.flexEmbeds);
			}
		}
	});
	
	$("#view").click(function() {
		$("#content").hide();
		$("#displaytab").show();		
		if($(".oembedDiv").length>0){
			$("#displayblocks").empty();
			if(title != undefined && title != ""){
				$("<div style='font-size:14pt'>"+title+"</div>").appendTo("#displayblocks");
			}
			$("[id^='oembedDiv_']").each(function(index){
				if($(this).attr("embed") == undefined){
					return;
				}
				
				if(index==0){
				}else{
					$("<hr size=10 color=#D1E5F4  style=\"filter:alpha(opacity=0,finishopacity=100,style=3)\"></hr>").appendTo("#displayblocks");
				}
				var type=$(this).attr("type");
				var embe=$(this).attr("embed");
				var title=$(this).attr("title");
				var description=$(this).attr("description");
				if(type == "text"){
					$("<div class=\"DisplayBlock\">"+embe+"</div>").appendTo("#displayblocks");
				}else{
					var showContent = "<table style='width:100%;'><tr><td style='text-align:left;'><div id='divTitle_"+index+"' style='font-size:12pt;font-weight:bold;'>"+title+"</div></td></tr>"+
							  "<tr><td style='text-align:left;'><div class=\"DisplayBlock\">"+embe+"</div></td></tr>"+
							  "<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+index+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
					$(showContent).appendTo("#displayblocks"); 
					
					getdiv("divTitle_"+index);
					getdiv("divDescription_"+index);
				}
			})
		}
	});
	getdiv("divTitleEdit");
}
function initPageNation(){
    var initPagination = function() {
        var num_entries = $("#hiddenresult div.result").length;
        $("#Pagination").pagination(num_entries, {
            num_edge_entries: 1, 
            num_display_entries: 4, 
            items_per_page:1 
        });
    }();
}

function getStringNumberId(path){
	if(typeof(path) == "undefined"){
		return "undefined";
	}
	var lastIndex = path.lastIndexOf("_")+1;
	var id = path.substring(lastIndex,path.length);
	return id;
}
function getParameter(query,param){
	var iLen = param.length;
	var iStart = query.indexOf(param);
	if (iStart == -1)
	return "";
	iStart += iLen + 1;
	var iEnd = query.indexOf("&", iStart);
	if (iEnd == -1)
	  return query.substring(iStart);
	return query.substring(iStart, iEnd);
}
function formatTime(sec){
	hours = parseInt( sec / 3600 ) % 24; 
	minutes = parseInt( sec / 60 ) % 60; 
	seconds = sec % 60;  
	result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
	return result;
}
function json2str(o) {
	var arr = [];
	var fmt = function(s) {
		if (typeof s == 'object' && s != null) return json2str(s);
		return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
	 }
	 for (var i in o) arr.push("'" + i + "':" + fmt(o[i]));
	 return '{' + arr.join(',') + '}';
}
function loadViewData(jsonData){
	$("#content").hide();
	$("#displaytab").show();
	$("#displayblocks").empty();

	var topTitle = jsonData.title;
	if(topTitle != undefined && topTitle != ""){
		$("<div style='font-size:14pt'>"+topTitle+"</div>").appendTo("#displayblocks");
	}
	for(var i=0;i<jsonData.flexEmbeds.length;i++){
		var obj = jsonData.flexEmbeds[i];
		if(obj.embed == undefined){
			return;
		}		
		if(i!=0){
			$("<hr size=10 color=#D1E5F4  style=\"filter:alpha(opacity=0,finishopacity=100,style=3)\"></hr>").appendTo("#displayblocks");
		}
		var type=obj.type;
		var embe=obj.embed;
		var title=obj.title;
		var description=obj.description;
		var width = "790px";
		if(type == "text"){
			$("<div class=\"DisplayBlock\">"+embe+"</div>").appendTo("#displayblocks");
		}else{
			if(type=="iframe"){
				width = "100%";
			}
			var showContent = "<table style='width:"+width+";'><tr><td style='text-align:left;'><div id='divTitle_"+i+"' style='font-size:12pt;font-weight:bold;'>"+title+"</div></td></tr>"+
					  "<tr><td style='text-align:left;'><div class=\"DisplayBlock\">"+embe+"</div></td></tr>"+
					  "<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+i+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
			$(showContent).appendTo("#displayblocks"); 
			
			//getdiv("divTitle_"+i);
			//getdiv("divDescription_"+i);
		}
	}
}

function Edit_TempJsonArray(id){
	var numberId = getStringNumberId(id);
	var tabsNewId = "#tabsNew_" + numberId;
	var createNewDivId = "#dialog-createNew_" + numberId;
	var oembedDivId = "#oembedDiv_" + numberId;
	var commitbtnId = "#commitbtn_" + numberId;
	$("#" + id).hide();
	$(commitbtnId).show();
	$(oembedDivId).hide();
	$(createNewDivId).show();
}

function Sub_TempJsonArray(id){
	var numberId = getStringNumberId(id);
	var tabsNewId = "#tabsNew_" + numberId;
	var createNewDivId = "#dialog-createNew_" + numberId;
	var oembedDivId = "#oembedDiv_" + numberId;
	$(oembedDivId)[0].scrollIntoView(true);
	var editbtnId = "#editbtn_" + numberId;
	var selected = $(tabsNewId).tabs('option', 'selected'); 
	if(selected==0){
		var resourceURL = $(tabsNewId+" .resourceURL");
		if(resourceURL.attr("value")==sourceInputNotice){
			alert("please give your URL ");
			return;
		}		
		var orgiURL=resourceURL.attr("value");
		var URL=resourceURL.attr("value");
		var title = $("#title_" + numberId).attr("value");
		var description = $("#description_" + numberId).attr("value");
		var sourceFrom = "";
		
		var youtubeIndex = URL.indexOf(URLKey.youtube);
		var huluIndex = URL.indexOf(URLKey.hulu);
		var vimeoIndex = URL.indexOf(URLKey.vimeo);
		
		var urlIndex = URL.indexOf(URLKey.slide);
		var slideshareIndex = URL.indexOf(URLKey.slideshare);
		
		var urlFlickrIndex = URL.indexOf(URLKey.flickr);

		/////////////////////////////video/////////////////////////
		if(youtubeIndex>0 || huluIndex>0 || vimeoIndex>0){
			if(vimeoIndex > 0){
				URL = "http://vimeo.com/api/oembed.json?url="+URL+"&maxwidth=500";
				reviewType = "vimeo";
			}
			if(huluIndex > 0){
				URL = "http://www.hulu.com/api/oembed.json?url="+URL;
				reviewType = "hulu";
			}
			if(youtubeIndex >0 ){
				reviewType = "youtube";
				var vId = getParameter(URL,"v");
				$("#" + id).hide();
				$(editbtnId).show();
				$(createNewDivId).hide();
				$(oembedDivId).html("");
				$(oembedDivId).show();				
				var subdata = "<iframe width=\"459\" height=\"344\" src=\"http://www.youtube.com/embed/"+vId+"?fs=1&feature=oembed\" frameborder=\"0\" allowfullscreen></iframe>";
				var title_s = "(click to add title)";
				var description = "(click to add description)";
				if($(oembedDivId).attr("title") != undefined && $(oembedDivId).attr("title") != ""){
					title_s = $(oembedDivId).attr("title");
				}
				if($(oembedDivId).attr("description") != undefined && $(oembedDivId).attr("description") != ""){
					description = $(oembedDivId).attr("description");
				}
				var showContent = "<table style='width:790px;'><tr><td style='text-align:left;'><div id='divTitle_"+numberId+"' style='font-size:12pt; font-weight:bold;'>"+title_s+"</div></td></tr>"+
							  "<tr><td>"+subdata+"</td></tr>"+
							  "<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+numberId+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
				$(showContent).prependTo(oembedDivId);
				getdiv("divTitle_"+numberId,oembedDivId);
				getdiv("divDescription_"+numberId,oembedDivId);
				
				$(oembedDivId).css({border:"0px"});
				$(oembedDivId).attr("type","video");
				$(oembedDivId).attr("url",orgiURL);
				$(oembedDivId).attr("title",title_s=="(click to add title)"?"":title_s);
				$(oembedDivId).attr("description",description=="(click to add description)"?"":description);
				$(oembedDivId).attr("json","");
				$(oembedDivId).attr("embed",subdata);
				
			}else{
				$.ajax({
					 url: URL,
					 type: "POST",
					 dataType: "jsonp",
					 jsonp : "callback",
					 jsonpCallback: "jsonpcallback",
					 complete: function() {
					 },
					 beforeSend: function () {
					 },
					 success: function(data) {
						$("#" + id).hide();
						$(editbtnId).show();
						$(createNewDivId).hide();
						$(oembedDivId).html("");
						$(oembedDivId).show();
						
						var subdata = data.html;
						var title_s = "(click to add title)";
						var description = "(click to add description)";
						if($(oembedDivId).attr("title") != undefined && $(oembedDivId).attr("title") != ""){
							title_s = $(oembedDivId).attr("title");
						}
						if($(oembedDivId).attr("description") != undefined && $(oembedDivId).attr("description") != ""){
							description = $(oembedDivId).attr("description");
						}
						var showContent = "<table style='width:790px;'><tr><td style='text-align:left;'><div id='divTitle_"+numberId+"' style='font-size:12pt; font-weight:bold;'>"+title_s+"</div></td></tr>"+
							  "<tr><td>"+subdata+"</td></tr>"+
							  "<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+numberId+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
					$(showContent).prependTo(oembedDivId);
					getdiv("divTitle_"+numberId,oembedDivId);
					getdiv("divDescription_"+numberId,oembedDivId);
						$(oembedDivId).css({border:"0px"});
						$(oembedDivId).attr("type","video");
						$(oembedDivId).attr("url",orgiURL);
						$(oembedDivId).attr("title",title_s=="(click to add title)"?"":title_s);
						$(oembedDivId).attr("description",description=="(click to add description)"?"":description);
						//jwang 
						//$(oembedDivId).attr("json",json2str(data).replace(/"/g,'\\"'));
						$(oembedDivId).attr("json",JSON.stringify(data));
						$(oembedDivId).attr("embed",subdata);
					 },
					 error: function() {
					 }
				 });
			}
		}
		//////////////////slide share///////////////
		else if(urlIndex>0 || slideshareIndex>0){
			if(urlIndex > 0){
				URL = "http://review.fla.fujitsu.com/services/get/slide/slideid/" + getParameter(URL,'slideId');
				reviewType = "review";
			}
			if(slideshareIndex > 0){
				URL = "http://www.slideshare.net/api/oembed/2?url="+URL+"&format=json";
				reviewType = "slideshare";
			}
			$.ajax({
				 url: URL,
				 type: "POST",
				 dataType: "jsonp",
				 jsonp : "callback",
				 jsonpCallback: "jsonpcallback",
				 complete: function() {
					 },
				 beforeSend: function () {
				 },
				 success: function(data) {
					$("#" + id).hide();
					$(editbtnId).show();
					$(createNewDivId).hide();
					$(oembedDivId).html("");
					$(oembedDivId).show();
					var subdata="";
					if(reviewType=='review'){
						var subdata = data.slide[0].swf.embled;
						
					}else if(reviewType=='slideshare'){
						var subdata = getSubData(data.html);
						
					}
					var title_s = "(click to add title)";
					var description = "(click to add description)";
					if($(oembedDivId).attr("title") != undefined && $(oembedDivId).attr("title") != ""){
						title_s = $(oembedDivId).attr("title");
					}
					if($(oembedDivId).attr("description") != undefined && $(oembedDivId).attr("description") != ""){
						description = $(oembedDivId).attr("description");
					}
					var showContent = "<table style='width:790px;'><tr><td style='text-align:left;'><div id='divTitle_"+numberId+"' style='font-size:12pt; font-weight:bold;'>"+title_s+"</div></td></tr>"+
							  "<tr><td>"+subdata+"</td></tr>"+
							  "<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+numberId+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
					$(showContent).prependTo(oembedDivId);
					
					$(oembedDivId).css({border:"0px"});
					$(oembedDivId).attr("type","slide");
					$(oembedDivId).attr("url",orgiURL);
					$(oembedDivId).attr("title",title_s=="(click to add title)"?"":title_s);
					$(oembedDivId).attr("description",description=="(click to add description)"?"":description);
					//jwang JSON.stringify
					//$(oembedDivId).attr("json",json2str(data).replace(/"/g,'\\"'));
					$(oembedDivId).attr("json",JSON.stringify(data));
					$(oembedDivId).attr("embed",subdata);
					getdiv("divTitle_"+numberId,oembedDivId);
					getdiv("divDescription_"+numberId,oembedDivId);
				},
				error: function() {
					alert("error!");
				}
			});
		}
		/////////////////////////////////flick image/////////////////////
		else if(urlFlickrIndex>0 && !imageType.in_array(URL.substr(URL.lastIndexOf(".")))){
			URL = "http://www.flickr.com/services/oembed?url="+URL+"&format=json&jsoncallback=?";
			sourceFrom = "flickr";
			$.ajax({
				url: URL,
				type: "POST",
				dataType: "jsonp",
				jsonp : "callback",
				jsonpCallback: "jsonpcallback",
				complete: function() {
				},
				beforeSend: function () {
				},
				success:function(data){
					$("#" + id).hide();
					$(editbtnId).show();
					$(createNewDivId).hide();
					$(oembedDivId).html("");
					$(oembedDivId).show();
					var title_s = "(click to add title)";
					var description = "(click to add description)";
					if($(oembedDivId).attr("title") != undefined && $(oembedDivId).attr("title") != ""){
						title_s = $(oembedDivId).attr("title");
					}
					if($(oembedDivId).attr("description") != undefined && $(oembedDivId).attr("description") != ""){
						description = $(oembedDivId).attr("description");
					}
					var showContent = "<table style='width:790px;'><tr><td style='text-align:left;'><div id='divTitle_"+numberId+"' style='font-size:12pt; font-weight:bold;'>"+title_s+"</div></td></tr>"+
							  "<tr><td><img style=''></img></td></tr>"+
							  "<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+numberId+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
					$(showContent).appendTo(oembedDivId); 
					$(oembedDivId+" img").attr("src",data.url);
					getdiv("divTitle_"+numberId,oembedDivId);
					getdiv("divDescription_"+numberId,oembedDivId);
					imgReady(data.url, function () {
						if(this.width>790){
							$(oembedDivId+">img").width("790px");
						}else{
							$(oembedDivId+" img").css("top",($(oembedDivId).height()-$(oembedDivId+" img").height())/2); 
							$(oembedDivId+" img").css("left",($(oembedDivId).width()-$(oembedDivId+" img").width() - 80)/2);
						}
						
						$(oembedDivId).css("border","0px");
						$(oembedDivId).attr("type","image");
						$(oembedDivId).attr("url",orgiURL);
						$(oembedDivId).attr("title",title_s=="(click to add title)"?"":title_s);
						$(oembedDivId).attr("description",description=="(click to add description)"?"":description);
						//jwang JSON.stringify
						//$(oembedDivId).attr("json",json2str(data).replace(/"/g,'\\"'));
						$(oembedDivId).attr("json",JSON.stringify(data));
						$(oembedDivId).attr("embed","<img src='"+data.url+"' height='"+$(oembedDivId+" img").height()+"' width='"+$(oembedDivId+" img").width()+"'></img>");
					});
				},
				error:function(data){
					alert("error!");
				}
			});
		}
		///////////////////////////image////////////////
		else if(imageType.in_array(URL.substr(URL.lastIndexOf(".")))){
			$("#" + id).hide();
			$(editbtnId).show();
			$(createNewDivId).hide();
			$(oembedDivId).html("");
			$(oembedDivId).show();
			var title_s = "(click to add title)";
			var description = "(click to add description)";
			if($(oembedDivId).attr("title") != undefined && $(oembedDivId).attr("title") != ""){
				title_s = $(oembedDivId).attr("title");
			}
			if($(oembedDivId).attr("description") != undefined && $(oembedDivId).attr("description") != ""){
				description = $(oembedDivId).attr("description");
			}
			var showContent = "<table style='width:790px;'><tr><td style='text-align:left;'><div id='divTitle_"+numberId+"' style='font-size:12pt; font-weight:bold;'>"+title_s+"</div></td></tr>"+
							  "<tr><td><img style=''></img></td></tr>"+
							  "<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+numberId+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
			$(showContent).appendTo(oembedDivId); 
			getdiv("divTitle_"+numberId,oembedDivId);
			getdiv("divDescription_"+numberId,oembedDivId);
			
			$(oembedDivId+" img").attr("src",URL);			
			imgReady(URL, function () {
				if(this.width > 790){					
					$(oembedDivId+" img").width("790px");
				}
				else{
					$(oembedDivId+" img").css("top",($(oembedDivId).height()-$(oembedDivId+" img").height())/2); 
					$(oembedDivId+" img").css("left",($(oembedDivId).width()-$(oembedDivId+" img").width() - 80)/2);
				}
				$(oembedDivId).css("border","0px");
				$(oembedDivId).attr("type","image");
				$(oembedDivId).attr("url",orgiURL);
				$(oembedDivId).attr("title",title_s=="(click to add title)"?"":title_s);
				$(oembedDivId).attr("description",description=="(click to add description)"?"":description);
				$(oembedDivId).attr("json","");
				$(oembedDivId).attr("embed","<img src='"+URL+"' height='"+$(oembedDivId+" img").height()+"' width='"+$(oembedDivId+" img").width()+"'></img>");
			});
		}
		else{
			$("#" + id).hide();
			$(editbtnId).show();
			$(createNewDivId).hide();
			$(oembedDivId).html("");
			$(oembedDivId).show();
			var title_s = "(click to add title)";
			var description = "(click to add description)";
			if($(oembedDivId).attr("title") != undefined && $(oembedDivId).attr("title") != ""){
				title_s = $(oembedDivId).attr("title");
			}
			if($(oembedDivId).attr("description") != undefined && $(oembedDivId).attr("description") != ""){
				description = $(oembedDivId).attr("description");
			}
			var showContent = "<table style='width:100%;'><tr><td style='text-align:left;'><div id='divTitle_"+numberId+"' style='font-size:12pt; font-weight:bold;'>"+title_s+"</div></td></tr>"+
							  "<tr><td><iframe style='height:720px;width:100%;'></iframe></td></tr>"+
							  "<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+numberId+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
			$(showContent).appendTo(oembedDivId); 
			getdiv("divTitle_"+numberId,oembedDivId);
			getdiv("divDescription_"+numberId,oembedDivId);
			
			$(oembedDivId+" iframe").attr("src",URL);
			$(oembedDivId+" iframe").attr("src",URL);
			$(oembedDivId).css("border","0px");
			$(oembedDivId).height("780px");
			$(oembedDivId).attr("type","iframe");
			$(oembedDivId).attr("url",URL);
			$(oembedDivId).attr("title",title_s=="(click to add title)"?"":title_s);
			$(oembedDivId).attr("description",description=="(click to add description)"?"":description);
			$(oembedDivId).attr("json","");
			$(oembedDivId).attr("embed","<iframe src='"+URL+"' style='height:"+$(oembedDivId+" iframe").height()+"px; width:100%;'></iframe>");
		}
	}
	else if(selected==1){
		var sourceContent = $("#HtmlSourceContent_" + numberId).val();
		if(sourceContent==htmlSourceInputNotice){
			alert("please give your html source ");
			return;
		}	
		$("#" + id).hide();
		$(editbtnId).show();
		$(createNewDivId).hide();
		$(oembedDivId).html("");
		$(oembedDivId).show();
		var sourceContent = $("#HtmlSourceContent_" + numberId).attr("value");
		var title_s = "(click to add title)";
		var description = "(click to add description)";
		if($(oembedDivId).attr("title") != undefined && $(oembedDivId).attr("title") != ""){
			title_s = $(oembedDivId).attr("title");
		}
		if($(oembedDivId).attr("description") != undefined && $(oembedDivId).attr("description") != ""){
			description = $(oembedDivId).attr("description");
		}
		var showContent = "<table style='width:790px;'><tr><td style='text-align:left;'><div id='divTitle_"+numberId+"' style='font-size:12pt; font-weight:bold;'>"+title_s+"</div></td></tr>"+
						"<tr><td>"+sourceContent+"</td></tr>"+
						"<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+numberId+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
		$(showContent).appendTo(oembedDivId); 
		$(oembedDivId).css("border","0px");
		$(oembedDivId).attr("type","HtmlSource");
		$(oembedDivId).attr("url","");
		$(oembedDivId).attr("json","");
		$(oembedDivId).attr("title",title_s=="(click to add title)"?"":title_s);
		$(oembedDivId).attr("description",description=="(click to add description)"?"":description);
		$(oembedDivId).attr("embed",sourceContent);
		getdiv("divTitle_"+numberId,oembedDivId);
		getdiv("divDescription_"+numberId,oembedDivId);
		
	}else if(selected==2){
		if($(tabsNewId+" .Textcontent").attr("value")==""){
			alert("please enter your Textcontent");
			return
		}
		if($(tabsNewId+" .Textcontent").attr("value")!=""){
			var content=$(tabsNewId+" .Textcontent").attr("value");
			$("#" + id).hide();
			$(editbtnId).show();
			$(createNewDivId).hide();
			$(oembedDivId).html("");
			$(oembedDivId).show();
			if(	$(oembedDivId+">textarea").length==0){
				$("<div style='text-align:left; font-size:12pt; overflow:scroll; height:240px;width:780px;margin-left:1px'></div>").prependTo(oembedDivId);
				$(oembedDivId).css({border:"0px"});
			}
			$(oembedDivId+">div").html(content);
			$(oembedDivId).attr("type","text");
			$(oembedDivId).attr("url","");
			$(oembedDivId).attr("title","");
			$(oembedDivId).attr("description","");
			$(oembedDivId).attr("json","");
			$(oembedDivId).attr("embed","<div style='text-align:left; overflow:scroll;'>"+content+"</div>");
		}
	}
	Sub_AllJsonArray();
}


//jwang

/*
function Sub_AllJsonArray(){
	var str="{\"title\":\""+ title +"\",\"flexEmbeds\":[";
	
	$("[id^='oembedDiv_']").each(function(index){
		var embe=$(this).attr("embed");
		if(embe != undefined && embe.length>0){
			if(index!=0){str+=","}
			str+="{";
			str+= "\"id\":"+"\""+$(this).attr("id").replace("oembedDiv_","")+ "\",";
			str+= "\"type\":"+"\""+$(this).attr("type")+ "\",";
			//jwang
			//str+= "\"url\":"+"\""+$(this).attr("url")+ "\",";
			str+= "\"url\":"+"\""+$(this).attr("url").replace(/"/g,'\\"')+ "\",";
			str+= "\"title\":"+"\""+$(this).attr("title")+ "\",";
			str+= "\"description\":"+"\""+$(this).attr("description")+ "\",";
			str+= "\"json\":"+"\""+$(this).attr("json")+ "\",";
			embe = embe.replace(/"/g,'\\"');
			str+= "\"embed\":"+"\""+embe+"\"";
			str+="}";
		}
	});
	str+= "]}";
	jsonDemon = str;
	
	//test
	//jsonDemon = str.replace(/</g,'&lt;').replace(/>/g,'&gt;');	
	//$("#testContent").html(jsonDemon);
}
*/

function Sub_AllJsonArray(){
    var json_model = {"title": title, "flexEmbeds": [ ]};
	$("[id^='oembedDiv_']").each(function(index){
		var cur_item = {};
		var embe=$(this).attr("embed");
		if(embe != undefined && embe.length>0){
		    cur_item["embed"] = embe;
			cur_item["id"] = $(this).attr("id").replace("oembedDiv_","");
			cur_item["type"] = $(this).attr("type");
			cur_item["url"] = $(this).attr("url");
			cur_item["title"] = $(this).attr("title");
			cur_item["description"] = $(this).attr("description");
			cur_item["json"] = $(this).attr("json");
			
			json_model["flexEmbeds"].push(cur_item);
		}
    });
	jsonDemon = JSON.stringify(json_model);
	//jsonDemon = str.replace(/</g,'&lt;').replace(/>/g,'&gt;');	
	//$("#testContent").html(jsonDemon);
}		

	
//function Sub_AllJsonArray(){}
	


function saveAllData(){
    //jwang
	//alert("start to saveAllData!");
	
	//if(jsonDemon.length < 30 ){
	//	return;
	//}
	var tempJsonData=JSON.parse(jsonDemon);
	if(tempJsonData.flexEmbeds==undefined || tempJsonData.flexEmbeds.length<=0){
		return;
	}
	$("#noticeInfo").html("saving...");
	$.ajax( {
        type: 'POST',
        url: neo4jAPIBaseURL,
        data: { "stub" : jsonDemon, "ctitle" : "ctitle", "tropt" : "tropt","tiopt" : "tiopt", "encom" : "encom" },
        success: function(data) {
			alert(data.self);
			$("#noticeInfo").html("save complete.");
        },
        dataType: "json",
        //async: false,
        complete: function(jqHXR, status ) {
        }
    });
}

function editData(){
    //jwang
	//alert("start to saveAllData!");
	var tempJsonData=JSON.parse(jsonDemon);
	if(tempJsonData.flexEmbeds==undefined || tempJsonData.flexEmbeds.length<=0){
		return;
	}
	$("#noticeInfo").html("updating...");
	$.ajax( {
        type: 'PUT',
        url: neo4jAPIBaseURL+nodeId+'/properties',
        data: { "stub" : jsonDemon, "ctitle" : "ctitle", "tropt" : "tropt","tiopt" : "tiopt", "encom" : "encom" },
        success: function(data) {
			alert(data.self);
			$("#noticeInfo").html("update complete.");
        },
        dataType: "json",
        //async: false,
        complete: function(jqHXR, status ) {
			$("#noticeInfo").html("update complete.");
        }
    });
	$("#noticeInfo").html("update complete.");
}


/*
function saveAllData(){
   var test_str = jsonDemon;
   //var test_str2 = test_str.replace(/</g,'&lt;').replace(/>/g,'&gt;');
   alert(test_str);
   //$("#testContent").html(test_str2);
}
*/

//click insert
function addAShowWindow(id,json){
	var tempvalue = createDivTab();
	if(id!=""&&id.indexOf("Hr_")<0){
		$("<div class=\"EditBlock\" id=\"newWindow\" >"+tempvalue+"<div class=\"oembedDiv\" id=\"oembedDiv_\ style=\"display:none\"></div><div class=\"deletebtn\" id=\"delbtn_\" style=\"width:60px; \">Delete</div><div class=\"commitbtn\" id=\"commitbtn_\" style=\"width:60px; \" onclick=\"Sub_TempJsonArray(this.id)\">OK</div><div class=\"editbtn\" id=\"editbtn_\" style=\"display:none; width:60px;\" onclick=\"Edit_TempJsonArray(this.id)\">Edit</div></div>").appendTo("#blackBlocks")
		$("<hr size=10 color=\"#D1E5F4\" title='"+hrNotice+"' id=\"showHr_\" class=\"hrClass\" onclick=\"addAShowWindow(this.id,null)\" style=\"filter:alpha(opacity=0,finishopacity=100,style=3)\"></hr>").appendTo("#blackBlocks");
	}
	else{
		$("#"+id).after("<div class=\"EditBlock\" id=\"newWindow\" >"+tempvalue+"<div class=\"oembedDiv\" id=\"oembedDiv_\ style=\"display:none\"></div><div class=\"deletebtn\" id=\"delbtn_\" style=\"width:60px; \">Delete</div><div class=\"commitbtn\" id=\"commitbtn_\" style=\"width:60px; \" onclick=\"Sub_TempJsonArray(this.id)\">OK</div><div class=\"editbtn\" id=\"editbtn_\" style=\"display:none; width:60px;\" onclick=\"Edit_TempJsonArray(this.id)\">Edit</div></div><hr size=10 color=\"#D1E5F4\" title='"+hrNotice+"'  id=\"showHr_\" class=\"hrClass\" onclick=\"addAShowWindow(this.id,null)\" style=\"filter:alpha(opacity=0,finishopacity=100,style=3)\"></hr>");
	}
	$("#newWindow")[0].scrollIntoView(true);
	if(json == null || json.length == $("div.EditBlock").length){
		$("div.EditBlock").each(function(index){
			this.id="ShowBlock_"+index;
			$("#ShowBlock_"+index+" .deletebtn").attr("id","delbtn_"+index);
			$("#ShowBlock_"+index+" .commitbtn").attr("id","commitbtn_"+index);
			$("#ShowBlock_"+index+" .editbtn").attr("id","editbtn_"+index);
			$("#ShowBlock_"+index+" .dialog-createNew").attr("id","dialog-createNew_"+index);
			$("#ShowBlock_"+index+" .tabsNewClass").attr("id","tabsNew_"+index);
			$("#ShowBlock_"+index+" .resourceURL").attr("id","resourceURL_"+index);
			$("#ShowBlock_"+index+" .searchResource").attr("id","searchResource_"+index);
			$("#ShowBlock_"+index+" .nyroModal").attr("id","searchBtn_"+index);
			$("#ShowBlock_"+index+" .Textcontent").attr("id","Textcontent_"+index);
			$("#ShowBlock_"+index+" .title").attr("id","title_"+index);
			$("#ShowBlock_"+index+" .description").attr("id","description_"+index);
			$("#ShowBlock_"+index+" .HtmlSourceContent").attr("id","HtmlSourceContent_"+index);
			
			$('#ShowBlock_'+index+' .wysiwyg').remove();
			$('#Textcontent_'+index).wysiwyg();

			$("#ShowBlock_"+index+" .oembedDiv").attr("id","oembedDiv_"+index);
			$("#ShowBlock_"+index+"~hr").first().attr("id","showHr_"+index);
			$("#tabsNew_"+index).tabs();
			$("#delbtn_"+index).button();
			$("#commitbtn_"+index).button();
			$("#editbtn_"+index).button();
			$("#delbtn_"+index).click( function (event) { 
				$(this).parent().next().remove();
				$(this).parent().remove(); 
				event.stopPropagation();
				Sub_AllJsonArray();
			});
		});
	}
	if(json != null && json.length == $("div.EditBlock").length){
		$("div.EditBlock").each(function(index){
			var viewStr = "";
			if(json[index] != null){
				viewStr = " type=\"" + json[index].type + "\" url=\"" + json[index].url + "\" embed=\"" + json[index].embed + "\""; 
			}

			if(viewStr != ""){
				$("#oembedDiv_"+index).css({border:"0px"});
				$("#oembedDiv_"+index).attr("type",json[index].type);
				$("#oembedDiv_"+index).attr("url",json[index].url);
				$("#oembedDiv_"+index).attr("title",json[index].title);
				$("#oembedDiv_"+index).attr("description",json[index].description);
				$("#oembedDiv_"+index).attr("embed",json[index].embed);
				//$("#oembedDiv_"+index).html(json[index].embed);
				//$("#oembedDiv_"+index).children(0).css("position","absolute");
				//$("#oembedDiv_"+index).children(0).css("margin-left","1px");
				
				var title_s = "(click to add title)";
				var description = "(click to add description)";
				if(json[index].title != undefined && json[index].title != ""){
					title_s = json[index].title;
				}
				if(json[index].description != undefined && json[index].description != ""){
					description = json[index].description;
				}
				var contentWidth="790px";
				if(json[index].type == "iframe"){
					contentWidth="100%";
				}
				var showContent = "<table style='width:"+contentWidth+";'><tr><td style='text-align:left;'><div id='divTitle_"+index+"' style='font-size:12pt; font-weight:bold;'>"+title_s+"</div></td></tr>"+
						"<tr><td style='text-align:left;'>"+json[index].embed+"</td></tr>"+
						"<tr><td style='text-align:left;nowrap:false;'><div id='divDescription_"+index+"' style='font-size:12pt;'>"+description+"</div></td></tr></table>";
				if(json[index].type == "text"){
					$("#tabsNew_" + index).tabs('select', 2);
					$("#dialog-createNew_"+index + " .Textcontent").val(json[index].embed);
					$('#ShowBlock_'+index+' .wysiwyg').remove();
					$('#Textcontent_'+index).wysiwyg();					
					showContent = json[index].embed;
				}else if(json[index].type == "HtmlSource"){
					$("#tabsNew_" + index).tabs('select', 1);
					$("#dialog-createNew_"+index + " .HtmlSourceContent").val(json[index].embed);
				}else{
					$("#dialog-createNew_"+index + " .resourceURL").val(json[index].url);
				}
				$("#oembedDiv_"+index).html(showContent);
				getdiv("divTitle_"+index,"#oembedDiv_"+index);
				getdiv("divDescription_"+index,"#oembedDiv_"+index);
				
				$("#comitbtn_"+index).hide();
				$("#editbtn_"+index).show();
				$("#oembedDiv_"+index).show();
				$("#dialog-createNew_"+index).hide();
			}
		});
	}
	$("div.nu").button();
	initNyro($);
};

function createDivTab(){
  var tabDiv = "<div class=\"dialog-createNew\" id=\"dialog-createNew_\"  style=\"display: block;z-index:9999;\">";
	  tabDiv += "<div class=\"tabsNewClass\" id=\"tabsNew_\">";
	  tabDiv += "<ul>"; 
	  tabDiv += "<li><a href=\"#tabs-1\">Resource</a></li>"; 
	  tabDiv += "<li><a href=\"#tabs-2\">Html source</a></li>"; 
	  tabDiv += "<li><a href=\"#tabs-3\">Note</a></li>"; 
	  tabDiv += "</ul>"; 
	  tabDiv += "<div id=\"tabs-1\">"; 
	  tabDiv += "<table  style=\"table-layout: fixed; width: 100%; padding-right:100px;\">"; 
	  tabDiv += "<tr><td style='height:10px; width:255px'></td><td></td></tr>"; 
	  tabDiv += "<tr><td align='left' colspan=2><input size='90' class='resourceURL' id='resourceURL_' value='"+sourceInputNotice+"' style='font-size:12pt; background-color:silver; color:gray;' onclick='this.style.backgroundColor=\"white\";style.color=\"black\"; if(this.value==\""+sourceInputNotice+"\"){this.value=\"\";}' onblur='if(this.value==\"\"){this.style.backgroundColor=\"silver\";style.color=\"gray\"; this.value=\""+sourceInputNotice+"\";}'></input></td></tr>"; 
	  tabDiv += "<tr style='height:5px'><td colspan=2></td></tr>"; 
	  tabDiv += "<tr><td align='left' style='width:255px;'><select class='searchResource' id='searchResource_' style='width:250px; font-size:12pt'>";
	  tabDiv += "<option value='"+ solrAPI +"'>Open Education Resources</option>"; 
	  tabDiv += "<option value='"+ youtubeAPI +"'>youtube</option>"; 
	  tabDiv += "</select></td><td align='left'><div class='nu'><a id='searchBtn_' href='#popUp' class='nyroModal' onclick='showSearchDialog(this)'>Search</a></div></td></tr>"; 
	  tabDiv += "<tr><td style='height:1px; width:105px'></td><td></td></tr></table>"; 
	  tabDiv += "</div>"; 
	  tabDiv += "<div id=\"tabs-2\">"; 
	  tabDiv += "<table style=\"table-layout: fixed; width: 100%; padding-right:100px;\">"; 
	  tabDiv += "<tr><td><textarea rows='5' cols='80' resize='none' style='height: 180px; width:100%; overflow:auto;font-size:12pt;background-color:silver;color:gray;'  class='HtmlSourceContent' id='HtmlSourceContent_' onclick='this.style.backgroundColor=\"white\";style.color=\"black\"; if(this.value==\""+htmlSourceInputNotice+"\"){this.value=\"\";}' onblur='if(this.value==\"\"){this.style.backgroundColor=\"silver\";style.color=\"gray\"; this.value=\""+htmlSourceInputNotice+"\";}'>"+htmlSourceInputNotice+"</textarea></td></tr>"; 
	  tabDiv += "</table>";
	  tabDiv += "</div>";
	  tabDiv += "<div id=\"tabs-3\">"; 
	  tabDiv += "<table style=\"table-layout: fixed; width: 100%; padding-right:100px;\">"; 
	  tabDiv += "<tr><td><textarea rows='5' cols='80' resize='none' style='height: 180px; width:100%; overflow:auto;'  class='Textcontent' id='Textcontent_'></textarea></td></tr>"; 
	  tabDiv += "</table>";
	  tabDiv += "</div>";
	  tabDiv += "</div>";
	  tabDiv += "</div>";//rev='modal' 
	  return tabDiv;
}

function getSubData(data){
	var start = data.indexOf("\u003Ciframe");
	var end = data.indexOf("\u003E\u003C/iframe\u003E") + 10;
	return data.substring(start,end);
}

function getdiv(divId,parentId){
	$("#"+divId).click(function(){ 
		if($("#titleText").length>0){return;}
		var fontSize="12pt";
		var text="<span><input id='titleText' style='font-size:"+fontSize+"' size=50 value='"+$(this).html()+"'/> ";
		if(divId == "divTitleEdit"){
			fontSize = "12pt";
		}else{
			fontSize = "11pt";
			if(divId.indexOf("Description")>0){
				text="<span><textarea id='titleText' style='font-size:"+fontSize+"' rows=3 cols=40 value='"+$(this).html()+"'>"+$(this).html()+"</textarea> ";
			}
		}
		
		var revert=$(this).html();
		$(this).after(text).remove();
		$("#titleText").select();
		$("#titleText").blur(function(){saveChanges(this,false,divId,parentId); Sub_AllJsonArray();});
		});
	$("#"+divId).mouseover(function(){$(this).addClass("editable")}).mouseout(function(){$(this).removeClass("editable")})
}
function saveChanges(obj,cancel,divId,parentId){
	if(!cancel)
	{
		var t=$(obj).val();
		//$.post("index.html",{content:t},function(txt){alert(txt);});
	}else
	{
		var t=cancel;
	}
	var fontSize="";
	var fontWeight="";
	if(divId == "divTitleEdit"){
		fontSize = "14pt;";
		if(t=="") {
			t='(click to add title)';
		}else{
			title=t;
		}
	}else{
		fontSize = "12pt;";
		if(t=="") {
			if(divId.indexOf("Title")>0){
				t='(click to add title)';
				$(parentId).attr("title",t);
				fontWeight = "font-weight:bold;";
			}else{
				t='(click to add description)';
				$(parentId).attr("description",t);
			}
		}else{
			if(divId.indexOf("Title")>0){
				$(parentId).attr("title",t);
				fontWeight = "font-weight:bold;";
			}else{
				$(parentId).attr("description",t);
			}
		}
	}
	$(obj).parent().after("<span id='"+divId+"' style='font-size : "+fontSize+fontWeight+"'>"+t+'</span>').remove();
	getdiv(divId,parentId);
}

function showSearchDialog(obj){
	currentId = getStringNumberId(obj.id);
	getData(1);
}

function removeOldJSONScriptNodes() {
	var jsonScript = document.getElementById('jsonScript');
	if (jsonScript) {
		jsonScript.parentNode.removeChild(jsonScript);
	}
}

function getData(pageIndex){
	currentPageIndex = pageIndex;
	var start = (pageIndex-1)*10;
	var key = $("#tabsNew_"+ currentId +" .resourceURL").attr("value");
	var url = "http://133.164.60.100/solr/select?fq=type:video";

	var searchSource = $("#searchResource_"+currentId+" option:selected").text();
	if(searchSource =="youtube"){
		removeOldJSONScriptNodes();
		var script = document.createElement('script');
		script.setAttribute('src', youtubeAPI.replace('@key',key).replace('@start',start+1));
		script.setAttribute('id', 'jsonScript');
		script.setAttribute('type', 'text/javascript');
		document.documentElement.firstChild.appendChild(script);
	}else{	
		$.ajax({
			 url: url,
			 'data': {'wt':'json', 'q': key, 'start':start, 'rows':10},
			 dataType: "jsonp",
			 jsonp: 'json.wrf',
			 success: function(data) {
				pageCount = Math.ceil((data.response.numFound)/10);
				if(pageIndex == 1){
					var pageDiv = "";
					for(var i=0;i<pageCount;i++){
						pageDiv += "<div class='result'></div>"
					}
					$("#hiddenresult").html(pageDiv);
					initPageNation();
				}
				showData(data);
			 },
			 error: function() {
			 }
		 });
	}
}
function showData(jsonData){
	$("#searchContent").html("");
	var index = 0;
	var objs = null;
	var imgTable = "<Table>";
	
	if(jsonData.feed != undefined){
		objs = jsonData.feed.entry;
		pageCount = Math.ceil((jsonData.feed.openSearch$totalResults.$t)/10);
		
		if(currentPageIndex == 1){
			var pageDiv = "";
			for(var i=0;i<pageCount;i++){
				pageDiv += "<div class='result'></div>"
			}
			$("#hiddenresult").html(pageDiv);
			initPageNation();
		}
	}
	else{
		objs = jsonData.response.docs;
	}
	
	for(var i=0;i<5;i++){
		imgTable += "<tr>"
		for(var j=0;j<3;j++){
			if(objs.length>index && j!= 1){
				var obj = objs[index];
				if(jsonData.feed != undefined){					
					var updatedDate = obj.updated.$t.substr(0,10);
					var author = obj.author[0].name.$t;					
					var uri = obj.link[0].href;		
					var thumbnail = obj.media$group.media$thumbnail[0].url;
					var duration = formatTime(obj.media$group.yt$duration.seconds);
					var content = obj.content.$t;
					var title = obj.title.$t;
				}else{
					var updatedDate = obj.updatedDate.substr(0,10);
					var author = obj.author;
					var uri = obj.uri;
					var thumbnail = obj.thumbnail[0];
					var duration = formatTime(obj.duration);
					var content = obj.content;
					var title = obj.title;
				}
				
				if(content.length>153){
					content = content.substr(0,150) + "...";
				}					
				imgTable += "<td style='width:20%;height:100px;position:relative;'><div style='position:absolute;bottom:5px;right:10px;background-color:black;color:snow;'>"+duration+"</div><img alt='"+uri+"' src='"+thumbnail+"' style='height:100px; width:150px' class='nyroModalClose' onclick='Selected(this)' onmouseover='HighLightShow(this)' onmouseout='CancelHighLightShow(this)'/></td>";
				imgTable += "<td align='left' style='width:30%;height:100px;'><font color='blue'>"+title+"</font></br><font color='green'>"+updatedDate+" "+author+"</font></br>"+content+"</td>";
				index++;
			}else if(j==1){
				imgTable += "<td style='width:10px'></td>";
			}else{
				imgTable += "<td></td>";
			}
		}
	}
	imgTable += "</table>";
	$("#searchContent").append(imgTable);
}
function Selected(obj){
	document.getElementById("resourceURL_" + currentId).value=obj.alt;
	$("#closeSearchWindow").click();
	$("#commitbtn_" + currentId).click();
	$("iframe").show();
}
function HighLightShow(obj){
	obj.style.border='0.1cm groove pink';
	obj.style.cursor='hand';
}
function CancelHighLightShow(obj){
	obj.style.border='0';
	obj.style.cursor='default';
}


var J = {
   StrToJSON : function( str ) {
      var a;
      eval( 'a=' + str + ';' );
      return a;
   }
   ,
   JsonToStr : function( obj ) {
      switch( typeof( obj ) )
      {
         case 'object' :
            var ret = [];
            if ( obj instanceof Array )
            {
               for ( var i = 0, len = obj.length; i < len;
               i ++ )
               {
                  ret.push( J.JsonToStr( obj[i] ) );
               }
               return '[' + ret.join( ',' ) + ']';
            }
            else if ( obj instanceof RegExp )
            {
               return obj.toString();
            }
            else
            {
               for ( var a in obj )
               {
                  ret.push( a + ':' + J.JsonToStr( obj[a] ) );
               }
               return '{' + ret.join( ',' ) + '}';
            }
         case 'function' :
            return 'function() {}';
         case 'number' :
            return obj.toString();
         case 'string' :
            return "\"" + obj.replace(/(\\|\")/g, "\\$1" ).replace( /\n|\r|\t/g, function( a ) {
               return ( "\n" == a ) ? "\\n" : ( "\r" == a ) ? "\\r" : ( "\t" == a ) ? "\\t" : 

"";
            }
            ) + "\"";
         case 'boolean' :
            return obj.toString();
         default :
            return obj.toString();
      }
   }
};

   

var imgReady = (function () {
    var list = [], intervalId = null,
    tick = function () {
        var i = 0;
        for (; i < list.length; i++) {
            list[i].end ? list.splice(i--, 1) : list[i]();
        };
        !list.length && stop();
    },
    stop = function () {
        clearInterval(intervalId);
        intervalId = null;
    };

    return function (url, ready, load, error) {
        var onready, width, height, newWidth, newHeight,
            img = new Image();

        img.src = url;
        if (img.complete) {
            ready.call(img);
            load && load.call(img);
            return;
        };
        width = img.width;
        height = img.height;
        img.onerror = function () {
            error && error.call(img);
            onready.end = true;
            img = img.onload = img.onerror = null;
        };
        onready = function () {
            newWidth = img.width;
            newHeight = img.height;
            if (newWidth !== width || newHeight !== height ||
                newWidth * newHeight > 1024
            ) {
                ready.call(img);
                onready.end = true;
            };
        };
        onready();
        img.onload = function () {
            !onready.end && onready();
            load && load.call(img);
            img = img.onload = img.onerror = null;
        };
        if (!onready.end) {
            list.push(onready);
            if (intervalId === null) intervalId = setInterval(tick, 40);
        };
    };
})();