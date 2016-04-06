var jsonDemon = "";
var canEdit = true;
var currentId = "";
var currentPageIndex=1;
var pageCount = 1;
var nodeId = "";
var showBlockCount=0;
var targetIndex = 0;
var inputPathTitleNotice = "(Click to add the path title)";
var inputContentTitleNotice = "(Click to add the content title)";
var inputContentDescriptionNotice = "(Click to add the content description)";
var emptyResultNotice = "No result found!";
var hrNotice = "Please click the bar and add a new item";
var sourceInputNotice = "Please input keywords or URL here...";
var htmlSourceInputNotice = 'Please input Embedded HTML soure code here, for example, there is a snippet of embedded code from a slide on scribd.com \n\n<a title="View Python Idioms on Scribd" href="http://www.scribd.com/doc/39946630/Python-Idioms" style="margin: 12px auto 6px auto; font-family: Helvetica,Arial,Sans-serif; font-style: normal; font-variant: normal; font-weight: normal; font-size: 14px; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none; display: block; text-decoration: underline;">Python Idioms</a><iframe class="scribd_iframe_embed" src="http://www.scribd.com/embeds/39946630/content?start_page=1&view_mode=slideshow&access_key=key-njjjz8kkl4wlve3joa5" data-auto-height="true" data-aspect-ratio="1.33333333333333" scrolling="no" id="doc_46012" width="100%" height="600" frameborder="0"></iframe><script type="text/javascript">(function() { var scribd = document.createElement("script"); scribd.type = "text/javascript"; scribd.async = true; scribd.src = "http://www.scribd.com/javascripts/embed_code/inject.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(scribd, s); })();</script>';
var neo4jAPIBaseURL = "http://adelie.fla.fujitsu.com:7474/db/data/node/";
var solrAPI = "http://133.164.60.100/solr/select?fq=type:video&wt=json";
var youtubeAPI = "https://gdata.youtube.com/feeds/api/videos?q=@key&alt=json-in-script&start-index=@start&max-results=10&callback=showData";
var imageType = [".jpg",".jpeg",".gif",".bmp",".png",".tiff",".pcx",".tga",".exif",".fpx",".svg",".psd",".cdr",".pcd",".dxf",".ufo",".eps",".ai",".raw"];
var URLKey = {"youtube":"www.youtube.com",
				 "hulu":"www.hulu.com",
				"vimeo":"vimeo.com",
				"slide":"slide.do?action=showSlide",
		   "slideshare":"www.slideshare.net",
			   "flickr":"flickr.com"
			 };

window.onload = function(){
	window.Item = Backbone.Model.extend({
		defaults: function() {
			return {
				type:  			"",
				mechod:			"",
				text:			"",
				title: 			"",
				resourceContent:	"",
				embedHtmlContent:	"",
				noteContent:	"",
				embed:			"",
				description:	""
			};
		}
	});
	window.ItemList = Backbone.Collection.extend({
		model:	Item,
		localStorage:new Store("items")
	});
	window.Items = new ItemList();
	window.ItemView = Backbone.View.extend({
		template: _.template($('#tpl-item-details').html()),
		initialize : function(){
			this.model.bind('destroy', this.remove, this);
		},
		events: {
			"click #commitbtn" : "saveItemData",
			"click #editbtn" : "editItemData",
			"click #deletebtn" : "deleteItemData"
		},
		render: function(e) {
		    $(this.el).html(this.template(this.model.toJSON())); 
		    return this;
	    },
	    remove: function() {
	        $(this.el).remove();
	    },
		saveItemData: function(e){
			Sub_TempJsonArray(e.currentTarget,this.model);
		},
		editItemData: function(e){
			$(e.currentTarget).parent().find(".oembedDiv").hide();
			$(e.currentTarget).parent().find("#editbtn").hide();
			$(e.currentTarget).parent().find("#dialog-createNew").show();
			$(e.currentTarget).parent().find("#commitbtn").show();
		},
		deleteItemData : function(e){
			this.model.destroy();
		}
	});
	window.DisplayView = Backbone.View.extend({
		template : _.template($('#tpl-item-display').html()),
		events : {
			"click td" : "edit",
			"blur input,textarea" : "close"
		},
		initialize : function(){
			this.model.bind('change', this.render, this);
		},
		edit : function(e){
			$(e.currentTarget).find("input,textarea").val($(e.currentTarget).find(".display").html());
			$(e.currentTarget).addClass('editing').find('input,textarea').select();
		},
		close: function(e) {
			var input = $(e.currentTarget);
			var obj = {};
			obj[input.attr("name")] = input.val();
			this.model.save(obj);
			$(e.currentTarget).parent().parent().removeClass("editing");
	    },
		render: function() {	
		    $(this.el).html(this.template(this.model.toJSON())); 
		    return this;
	    }
	});
	window.DisplayBlockView = Backbone.View.extend({
		template : _.template($('#tpl-displayBlock').html()),
		initialize : function(){
			this.model.bind('change', this.render, this);
		},
		render: function() {
		    $(this.el).html(this.template(this.model.toJSON())); 
		    return this;
	    }
	});
	window.AppView = Backbone.View.extend({
		el : $("#frametab"),
		events : {
			"click #addAShowWindow,.hrClass" : "addAShowWindow",
			"click #tdDisplay" : "edit",
			"blur input" : "close"
		},
		initialize: function() {
	        Items.bind('add', this.addOne, this);
	        Items.bind('reset', this.addAll, this);
			start();
			//alert(Items.toSource());
	    },
		edit : function(e){
			$(e.currentTarget).find("input").val($(e.currentTarget).find(".display").html());
			$(e.currentTarget).addClass('editing').find('input').select();
		},
		close: function(e) {
			$(e.currentTarget).parent().parent().removeClass("editing");
			$(e.currentTarget).parent().parent().find("#divTopTitleEdit").html($(e.currentTarget).val());			
	    },
	    addAShowWindow : function(e) {
			targetIndex = getStringNumberId(e.currentTarget.id);
			var item = new Item();
			Items.create(item);
			styleElement($(this.el),1);
			$("div.nu").button();
			initNyro($);
	    },
        addOne : function(item){
			showBlockCount++;
        	var view = new ItemView({model:item});
			if(targetIndex >0){
				$("#showHr_"+targetIndex).after(view.render().el);
			}
			else{
				$("#blackBlocks").append(view.render().el);	
			}
			
			var displayView = new DisplayView({model:item});
			$("#oembedDiv_"+showBlockCount).append(displayView.render().el);	
			
			item.bind('error',function(model,error){
        		alert(error);
        	});
        },
        addAll : function(){
        	Items.each(this.addOne);			
        }
	});
	window.App = new AppView();
}

$(document).ready(function(){	
	InitStyle();
	//InitData(jsonData);
	
	//for test
	start();
});

function start(){
	var result = "";
	var paraStartIndex = this.location.toString().lastIndexOf("?nodeid="); 
	if(paraStartIndex>0){
		nodeId = this.location.toString().substr(paraStartIndex+8);
		if(nodeId == ""){
			nodeId="1973";
		}
	}else{
		nodeId="1973";
	}
	
	//$.ajax( {
    //    type: 'GET',
    //    url: neo4jAPIBaseURL + nodeId,
    //    success: function(data) {
	//		var jsonData = JSON.parse(data.data.stub);
	//		InitData(jsonData);
			Items.fetch();
    //    },
    //    dataType: "json",
    //    async: false,
    //    complete: function(jqHXR, status ) {
    //    }
    //});
}

function InitStyle(){
	//init style
	$("#addAShowWindow").button();
	$("#saveAllData").button();
	$("#editData").button();
	$("#frametab" ).tabs();
	$("#content").hide();
	$("#displaytab").show();
	Array.prototype.S=String.fromCharCode(2);  
	Array.prototype.in_array=function(e){  
		var r=new RegExp(this.S+e+this.S);  
		return (r.test(this.S+this.join(this.S)+this.S));  
	}
	
	$("#edit").click(function() {
		$("#displaytab").hide();
		$("#content").show();		
		$(".oembedDiv").show();
		$(".editbtn").show();
		$(".dialog-createNew").hide();
		$("#commitbtn").hide();
	});
	
	$("#view").click(function() {
		$("#displaytab").show();
		$("#content").hide();
		$("#displayblocks").html("");
		Items.each(function(item){
			if(item != undefined){
				var displayBlockView = new DisplayBlockView({model:item});
				$("#displayblocks").append(displayBlockView.render().el);
			}
		});
	});
}

function InitData(jsonData){
	if(jsonData.flexEmbeds==undefined || jsonData.flexEmbeds.length<=0){
		return;
	}
	var strTemp = "";
	var temp = {};
	for(var i=0;i<jsonData.flexEmbeds.length;i++){
		var id=guid();
		var subTemp = {};
		subTemp.type = jsonData.flexEmbeds[i].type;
		subTemp.title = jsonData.flexEmbeds[i].title;
		subTemp.resourceContent = jsonData.flexEmbeds[i].resourceContent;
		subTemp.noteContent = jsonData.flexEmbeds[i].noteContent;
		subTemp.embed = jsonData.flexEmbeds[i].embed;
		subTemp.description = jsonData.flexEmbeds[i].description;
		subTemp.id = id;
		temp[id] = subTemp;
	}
	localStorage.setItem("items",JSON.stringify(temp));
	
	
	if(jsonData == null || jsonData == undefined){
		return;
	}
	if(typeof(jsonData.title) != "undefined" && jsonData.title != ""){
		$("#divTitleEdit").html(jsonData.title);
		title = jsonData.title;
	}

	$("#content").hide();
	$("#displaytab").show();
	$("#displayblocks").empty();

}

function Sub_TempJsonArray(obj,model){
alert("Sub_TempJsonArray");
	var type = "";
	var resourceContent = "";
	var embedHtmlContent = "";
	var noteContent = "";
	var embed = "";
	var tabsNewId = $(obj).parent().find("#dialog-createNew #tabsNew");
	var oembedDivId = $(obj).parent().find(".oembedDiv")[0];
	var selected = $(tabsNewId).tabs('option', 'selected'); 
	$(oembedDivId)[0].scrollIntoView(true);
	if(selected==0){
		var resourceURL = $(tabsNewId).find("#resourceURL");
		if(resourceURL.attr("value")==sourceInputNotice){
			alert("please give your URL ");
			return;
		}		
		type = "Resource";		
		var orgiURL=resourceURL.attr("value");
		resourceContent = orgiURL;
		var URL=resourceURL.attr("value");
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
				var subdata = $("#tpl-youtubeEmbed").html().replace("#vId",vId);
				type = "Resource";
				embed = subdata;
				saveChange(obj,model,type,resourceContent,embedHtmlContent,noteContent,embed);
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
						var subdata = data.html;						
						type = "Resource";
						embed = subdata;
						saveChange(obj,model,type,resourceContent,embedHtmlContent,noteContent,embed);
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
					var subdata="";
					if(reviewType=='review'){
						var subdata = data.slide[0].swf.embled;
						
					}else if(reviewType=='slideshare'){
						var subdata = getSubData(data.html);
						
					}
					type = "Resource";
					
					
					embed = subdata;
					saveChange(obj,model,type,resourceContent,embedHtmlContent,noteContent,embed);
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
					var subdata = "";
					imgReady(data.url, function () {
						subdata = $('#tpl-imageEmbed').html().replace("#URL",URL);					
						type = "Resource";
						embed = subdata;
						saveChange(obj,model,type,resourceContent,embedHtmlContent,noteContent,embed);
					});
				},
				error:function(data){
					alert("error!");
				}
			});
		}
		///////////////////////////image////////////////
		else if(imageType.in_array(URL.substr(URL.lastIndexOf(".")))){
			var subdata = "";
			imgReady(URL, function () {			
				subdata = $('#tpl-imageEmbed').html().replace("#URL",URL);
				type = "Resource";
				
				
				embed = subdata;
				saveChange(obj,model,type,resourceContent,embedHtmlContent,noteContent,embed);
			});
		}
		else{
			var subdata = "";
			subdata = $('#tpl-resourceEmbed').html().replace("#URL",URL);		
			type = "Resource";
			embed = subdata;
			saveChange(obj,model,type,resourceContent,embedHtmlContent,noteContent,embed);
		}
	}
	else if(selected==1){
		var sourceContent = $(obj).parent().find(".HtmlSourceContent")[0].value;//$("#HtmlSourceContent_" + numberId).val();
		if(sourceContent == undefined || sourceContent==""){
			alert("please give your html source ");
			return;
		}			
		type = "Embed HTML";
		
		embedHtmlContent = sourceContent;
		embed = sourceContent;
		saveChange(obj,model,type,resourceContent,embedHtmlContent,noteContent,embed);
		
	}else if(selected==2){
		var content=$(tabsNewId).find("#Textcontent").attr("value");
		if(content==""){
			alert("please enter your Textcontent");
			return;
		}		
		type = "Note";
		noteContent = content;
		embed = $('#tpl-noteEmbed').html().replace("#content",content);
		saveChange(obj,model,type,resourceContent,embedHtmlContent,noteContent,embed);
	}
}

function saveChange(obj,model,type,resourceContent,embedHtmlContent,noteContent,embed){
alert("saveChange");
	var item = new Item();
	var attribute = {};
	attribute.type = type;
	attribute.resourceContent = resourceContent;
	attribute.embedHtmlContent = embedHtmlContent;
	attribute.noteContent = noteContent;
	attribute.embed = embed;
	model.save(attribute);
	$(obj).parent().find(".oembedDiv").show();
	$(obj).parent().find("#editbtn").show();
	$(obj).parent().find("#dialog-createNew").hide();
	$(obj).parent().find("#commitbtn").hide();
}

//jwang
function Sub_AllJsonArray(){
	var pathTitle = title == inputPathTitleNotice ? "":title; 
    var json_model = {"title": title, "flexEmbeds": [ ]};
	$("[id^='oembedDiv_']").each(function(index){
		var cur_item = {};
		var embe=$(this).attr("embed");
		if(embe != undefined && embe.length>0){
		    cur_item["embed"] = embe;
			cur_item["id"] = $(this).attr("id").replace("oembedDiv_","");
			cur_item["type"] = $(this).attr("type");
			cur_item["url"] = $(this).attr("url");
			cur_item["title"] = $(this).attr("title")==inputContentTitleNotice ? "":$(this).attr("title");
			cur_item["description"] = $(this).attr("description")==inputContentDescriptionNotice ? "":$(this).attr("description");
			cur_item["json"] = $(this).attr("json");
			
			json_model["flexEmbeds"].push(cur_item);
		}
    });
	jsonDemon = JSON.stringify(json_model);
	//jsonDemon = str.replace(/</g,'&lt;').replace(/>/g,'&gt;');	
	//$("#testContent").html(jsonDemon);
}		

function saveAllData(){
	//Items.add({"title","testTopTitle"});
	alert(localStorage.getItem("items"));
	alert(Items);
    //jwang
	//var tempJsonData=JSON.parse(jsonDemon);
	//if(tempJsonData.flexEmbeds==undefined || tempJsonData.flexEmbeds.length<=0){
	//	return;
	//}
	//$("#noticeInfo").html("saving...");
	//$.ajax( {
    //    type: 'POST',
    //    url: neo4jAPIBaseURL,
    //    data: { "stub" : jsonDemon, "ctitle" : "ctitle", "tropt" : "tropt","tiopt" : "tiopt", "encom" : "encom" },
    //    success: function(data) {
	//		alert(data.self);
	//		$("#noticeInfo").html("save complete.");
    //    },
    //    dataType: "json",
    //    complete: function(jqHXR, status ) {
    //    }
    //});
}

function editData(){
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
        complete: function(jqHXR, status ) {
			$("#noticeInfo").html("update complete.");
        }
    });
	$("#noticeInfo").html("update complete.");
}


function styleElement(obj,isAdd){
	alert("style");
	if(isAdd){
		//alert($(obj).find("#Textcontent").length);
		$(obj).find("#Textcontent").wysiwyg();
	}
	$(obj).find("#tabsNew").tabs();
	$(obj).find("#deletebtn").button();
	$(obj).find("#commitbtn").button();
	$(obj).find("#editbtn").button();
	$(obj).find("#searchBtn").button();
}

function getSubData(data){
	var start = data.indexOf("\u003Ciframe");
	var end = data.indexOf("\u003E\u003C/iframe\u003E") + 10;
	return data.substring(start,end);
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
				if(data.response.numFound == 0){
					$("#searchContent").html("<div style='position:absolute;font-size:14pt;margin-top:250px;width:100%;text-align:center;'>"+emptyResultNotice+"</div>");
					return;
				}
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
		if(jsonData.feed.openSearch$totalResults.$t == 0){
			$("#searchContent").html("<div style='position:absolute;font-size:14pt;margin-top:250px;width:100%;text-align:center;'>"+emptyResultNotice+"</div>");
			return;
		}
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
				imgTable += "<td style='width:20%;height:100px;'><div style='height:100px;position:relative;'><div style='position:absolute;bottom:2px;right:5px;background-color:black;color:snow;'>"+duration+"</div><img alt='"+uri+"' title='click to insert the video' src='"+thumbnail+"' style='height:100px; width:150px;' class='nyroModalClose' onclick='Selected(this)' onmouseover='HighLightShow(this)' onmouseout='CancelHighLightShow(this)'/></div></td>";
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
	obj.style.cursor='pointer';
}
function CancelHighLightShow(obj){
	obj.style.border='0';
	obj.style.cursor='default';
}
function htmlSourceClick(obj){
	obj.style.backgroundColor="white";
	obj.style.color="black"; 
	if(obj.value==htmlSourceInputNotice){
		obj.value="";
	}
}
function htmlSourceBlur(obj){
	if(obj.value==""){
		obj.style.backgroundColor="silver";
		obj.style.color="gray"; 
		obj.value=htmlSourceInputNotice;
	}
}

function initPageNation(){
    var initPagination = function() {
        var num_entries = $("#hiddenresult div.result").length;
        $("#Pagination_top").pagination(num_entries, {
            num_edge_entries: 1, 
            num_display_entries: 4, 
            items_per_page:1 
        });
		$("#Pagination_bottom").pagination(num_entries, {
            num_edge_entries: 1, 
            num_display_entries: 4, 
            items_per_page:1 
        });
    }();
}

function getStringNumberId(path){
	if(typeof(path) == "undefined" || path.lastIndexOf("_")==-1){
		return -1;
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

function listProperties(obj) {
   var propList = "";
   for(var propName in obj) {
      if(typeof(obj[propName]) != "undefined") {
         propList += (propName + ", ");
      }
   }
   alert(propList);
}
