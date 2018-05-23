function searchPeople(){
	console.log("in searchPeople function");
	data = {key: document.getElementById('searchpeopleinput').value};
	console.log("data:"+JSON.stringify(data));
	$.ajax({
		url: 'searchpeople',
		headers: {"Content-Type" : "application/json"},
		type: "GET",
		data: data,
		success : function(result){
			console.log("return to signup ajax success:"+result);
			var data = result;
			if(data.length == 0){
					document.getElementById('searchresult').innerHTML = "No results found";
			}
			else{
				var html = '';
				for(doc of result){
					console.log(JSON.stringify(doc));
					html += "<div id='"+doc.email+ "'>"+doc.username
							+"<button id='"+doc.email + `btn' class='btn btn-lg' type='button' onclick='javascript:sendRequest("`+doc.email+`");'>\
							Add Friend</button><br></div>`;
				}
				document.getElementById('searchresult').innerHTML = html;
				
			}
			
		},
		error : function(result){
			console.log("return to signup ajax failure");
			//window.location = "/signup";
		}
 	});
}


var sendRequest = function(email){
	console.log("in sendRequest function -- id:"+email);
	data = {email: email};
	console.log("data:"+JSON.stringify(data));
	$.ajax({
		url: 'sendrequest',
		headers: {"Content-Type" : "application/json"},
		type: "GET",
		data: data,
		success : function(result){
			console.log("return to signup ajax success:"+result);
			if(result.status == 200){
				console.log("email:"+email);
				document.getElementById(email+"btn").style.display = "none";
				var textNode = document.createTextNode('request sent!');
				document.getElementById(email).appendChild(textNode);
			}
		},
		error : function(result){
			console.log("return to signup ajax failure");
			//window.location = "/signup";
		}
 	});	
}


var showRequests = function(){
	console.log("in showRequests function--");
	$.ajax({
		url:'showrequests',
		headers: {"Content-Type" : "application/json"},
		type: "GET",
		data:{},
		success : function(result){
			console.log("return to signup ajax success:"+result);
			var data = result;
			if(data.length == 0){
					document.getElementById('newrequests').innerHTML = "No new requests";
			}
			else{
				var html = '';
				for(doc of result){
					console.log(JSON.stringify(doc));
					html += "<div id='"+doc.email+ "'>"+doc.username
							+"<button id='"+doc.email + `btn' class='btn btn-lg' type='button' onclick='javascript:acceptRequest("`+doc.email+`");'>
							Confirm</button><br></div>`;
				}
				document.getElementById('newrequests').innerHTML = html;
				
			}
			
		},
		error : function(result){
			console.log("return to signup ajax failure");
			//window.location = "/signup";
		}
	})	
}

var acceptRequest = function(email){
	console.log("in acceptRequest function -- id:"+email);
	data = {email: email};
	//console.log("data:"+JSON.stringify(data));
	$.ajax({
		url: 'acceptrequest',
		headers: {"Content-Type" : "application/json"},
		type: "GET",
		data: data,
		success : function(result){
			console.log("return to signup ajax success:"+result);
			if(result.status == 200){
				//console.log("email:"+email);
				document.getElementById(email+"btn").style.display = "none";
				var textNode = document.createTextNode('request accepted!');
				document.getElementById(email).appendChild(textNode);
			}
		},
		error : function(result){
			console.log("return to signup ajax failure");
			//window.location = "/signup";
		}
 	});	
}


var showFriends = function(){
	console.log("in showFriends function--");
	$.ajax({
		url:'showfriends',
		headers: {"Content-Type" : "application/json"},
		type: "GET",
		data:{},
		success : function(result){
			console.log("return to signup ajax success: "+result.length+" results found.");
			var data = result;
			if(data.length == 0){
					document.getElementById('friendlist').innerHTML = "Sorry! You don't have any friends";
			}
			else{
				var html = '';
				for(name of result){
					//console.log(name);
				html += "<div id='"+name+ "'>"+name+"<br></div>";
				}
				document.getElementById('friendlist').innerHTML = html;
			}
		},
		error : function(result){
			console.log("return to signup ajax failure");
			//window.location = "/signup";
		}
	});	
}

var postStatus = function(){
	console.log("In post ajax");
	var postcontent = document.getElementById("message").value;
	msg = {postcontent:postcontent , likes:0};
	//console.log(JSON.stringify(msg));
    $.ajax({
    	url: "postmessage",
    	headers:{ 
       	 "Content-Type":"application/json"
    	},
		type: "GET",
    	data: msg,
		success: function (result) {
			//check if the response is success then 
			//window.location = "login";
			console.log("success in post ajax");
			alert("posted successfully");
			document.getElementById("message").value="";
			//location.reload();
		},
		error: function(result){
			console.log("failure in post ajax");
			alert("sorry,failed to post");
    	}
	});
	//return false;
}

var startfetch = function(){
	console.log("in startfetch ajax--");
	$.ajax({
		url: "getposts",
		headers:{
			"content-Type":"application/json"
		},
		type: "GET",
		success: function(result){
			console.log("getpost success :"+result.length+" results found.");
			if(result.length == 0){
					document.getElementById('postnow').innerHTML = "No posts to show";
			}
			else{
				var photoPattern = /.jpeg|.jpg|.png|.gif/;
				for(p of result){
					if(photoPattern.test(p.postcontent)){
						var newPost = "<section class='postItem'>\
						<div ><b><i>"+p.postedby_name+"</b></i>  on "+p.updatedAt.toLocaleString()+"</div><br>\
						<img src=/images/"+p.postcontent+" class='image' alt='Photo'><br>\
						</section>";		
					}
					else{
						var newPost = "<section class='postItem'>\
						<div ><b><i>"+p.postedby_name+"</b></i>  on "+p.updatedAt.toLocaleString()+"</div><br>\
						<div style='font-size:25px'><i>"+p.postcontent+"</i></div><br>\
						</section>";		
					}
							
					//console.log("newpost"+newPost);
					$("#postnow").append(newPost);
				}
			}
		},
		error: function(result){
			console.log("getpost failure");
			alert("error occured while fetching posts");
		}
	});
}
