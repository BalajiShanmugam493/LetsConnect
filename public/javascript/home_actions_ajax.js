var searchPeople = function(){
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
		success : function(result){
			console.log("return to showRequests ajax success:"+result);
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
		success : function(result){
			console.log("return to signup ajax success: "+result.length+" results found.");
			var friends = result;
			if(friends.length == 0){
					document.getElementById('friendlist').innerHTML = "Sorry! You don't have any friends yet!";
			}
			else{
				var html = '';
				for(f of friends){
					//console.log(name);
				html += "<div><span>"+f.username+"</span><button id='"+f._id+ "'onclick=\"location.href='friendprofile-"+f._id+"'\">View Profile</button>";
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


var userPosts = function(id){// id 0 for currentuser and id _id for friends
	console.log("in profile page ajax:");
	$.ajax({
		url: "userposts",
		headers:{
			"content-Type":"application/json"
		},
		type: "GET",
		data: {"id": id},
		success: function(response){
			console.log("profilepage success :"+response.result.length+" results found.");
			var result = response.result;
			if(result.length == 0){
					document.getElementById('userPosts').innerHTML = "No posts to show";
			}
			else{
				var photoPattern = /.jpeg|.jpg|.png|.gif/;
				$("#userPosts").html('');
				for(p of result){
					if(photoPattern.test(p.postcontent)){
						var newPost = "<section class='postItem'>\
						<div ><b><i>"+p.postedby_name+"</b></i>  on "+p.updatedAt.toLocaleString()+"</div><br>\
						<img src=/images/"+p.postcontent+" class='image' alt='Photo'><br>\
						<button type='button' onclick=\"javascript:likePost('"+p._id+"');\">Like</button>\
						<span id='"+p._id+"likecount'>"+p.likes.length+"</span>\
						Comment:<input type='text' id='"+p._id+"commentInput' placeholder='Type your comment here'>\
						<button type='button' onclick=\"javascript:commentPost('"+p._id+"');\">Comment</button>\
						<div id='"+p._id+"comments'>";
						for(comment of p.comments){
							newPost += "<div>"+comment.by.username+" : "+comment.body+"</div>";
						}
						newPost += "</div></section>";	
					}
					else{
						var newPost = "<section class='postItem'>\
						<div ><b><i>"+p.postedby_name+"</b></i>  on "+p.updatedAt.toLocaleString()+"</div><br>\
						<div style='font-size:25px'><i>"+p.postcontent+"</i></div><br>\
						<button type='button' onclick=\"javascript:likePost('"+p._id+"');\">Like</button>\
						<span id='"+p._id+"likecount'>"+p.likes.length+"</span>\
						Comment:<input type='text' id='"+p._id+"commentInput' placeholder='Type your comment here'>\
						<button type='button' onclick=\"javascript:commentPost('"+p._id+"');\">Comment</button>\
						<div id='"+p._id+"comments'>";
						for(comment of p.comments){
							html += "<div>"+comment.by.username+" : "+comment.body+"</div>";
						}
						html += "</div></section>";	
					}
							
					//console.log("newpost"+newPost);
					$("#userPosts").append(newPost);
				}
			}
		},
		error: function(result){
			console.log("profilepage failure");
			alert("error occured while fetching your posts");
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
	hideElement('changeDp');
	$.ajax({
		url: "getposts",
		headers:{
			"content-Type":"application/json"
		},
		type: "GET",
		success: function(response){
			console.log("getpost success :"+response.result.length+" results found.");
			console.log(response);
			var result = response.result;
			if(result.length == 0){
					document.getElementById('postnow').innerHTML = "No posts to show";
			}
			else{
				var photoPattern = /.jpeg|.jpg|.png|.gif/;
				for(p of result){
					if(photoPattern.test(p.postcontent)){
						var newPost = "<section class='postItem'>\
						<div ><a href='./friendprofile-"+p.postedby_id+"'>"+p.postedby_name+"</a>  on "+p.updatedAt.toLocaleString()+"</div><br>\
						<img src=/images/"+p.postcontent+" class='image' alt='Photo'><br>\
						<button type='button' onclick=\"javascript:likePost('"+p._id+"');\">Like</button>\
						<span id='"+p._id+"likecount'>"+p.likes.length+"</span> \
						Comment:<input type='text' id='"+p._id+"commentInput' placeholder='Type your comment here'>\
						<button type='button' onclick=\"javascript:commentPost('"+p._id+"');\">Comment</button>\
						<div id='"+p._id+"comments'>";
						for(comment of p.comments){
							newPost += "<div>"+comment.by.username+" : "+comment.body+"</div>";
						}
						newPost += "</div></section>";	
					}
					else{
						var newPost = "<section class='postItem'>\
						<div ><a href='./friendprofile-"+p.postedby_id+"'>"+p.postedby_name+"</a>  on "+p.updatedAt.toLocaleString()+"</div><br>\
						<div style='font-size:25px'><i>"+p.postcontent+"</i></div><br>\
						<button type='button' onclick=\"javascript:likePost('"+p._id+"');\">Like</button>\
						<span id='"+p._id+"likecount'>"+p.likes.length+"</span>\
						Comment:<input type='text' id='"+p._id+"commentInput' placeholder='Type your comment here'>\
						<button type='button' onclick=\"javascript:commentPost('"+p._id+"');\">Comment</button>\
						<div id='"+p._id+"comments'>";
						for(comment of p.comments){
							newPost += "<div>"+comment.by.username+" : "+comment.body+"</div>";
						}
						newPost += "</div></section>";	
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


var likePost = function(id){
	console.log("in like post ajax")
	$.ajax({
		url:'likepost',
		headers: {"Content-Type" : "application/json"},
		type: "GET",
		data: {"id": id},
		success : function(result){
			console.log("return to likeposts ajax success: "+result.likes.length+" results found.");
			document.getElementById(id+'likecount').innerHTML = result.likes.length;
		},
		error : function(result){
			console.log("return to likeposts ajax failure");
			//window.location = "/signup";
		}
	});	
}


var commentPost = function(id){
	console.log("in comment post ajax")
	$.ajax({
		url:'commentpost',
		headers: {"Content-Type" : "application/json"},
		type: "POST",
		data: JSON.stringify({"id": id, "comment": document.getElementById(id+"commentInput").value}),
		success : function(result){
			console.log("return to commentposts ajax success: "+result.length+" results found.");
			var html = "<div>"+result.comment.by.username+" : "+result.comment.body+"</div>";
			$('#'+id+'comments').append(html);			
		},
		error : function(result){
			console.log("return to commentposts ajax failure");
			//window.location = "/signup";
		}
	});	
}


var postImage = function(){
	console.log("in postImage ajax");
	var data = new FormData();
	var img = document.getElementById('inputPhoto').value;
	data.append('image', img);
	$.ajax({
		url: "postPhoto",
		/*headers:{
			"content-Type":"multipart/form-data"
		},*/
		data:data,
	    cache:false,
	    processData:false,
	    contentType:false,
		type: "POST",
		data: data,
		success: function(response){
			console.log("getpost success :"+response.result.length+" results found.");
		},
		error: function(response){
			console.log("getpost failure");
			alert("error occured while fetching posts");
		}
	});
}

var showElement = function(id){
	document.getElementById(id).style.display = "block";
}

var hideElement = function(id){
	document.getElementById(id).style.display = "none";
}