var showElement = function(id){
	document.getElementById(id).style.display = "block";
}

var hideElement = function(id){
	document.getElementById(id).style.display = "none";
}

function populateCountries(countryElementId) {
    // given the id of the <select> tag as function argument, it inserts <option> tags
    var country_arr = new Array("Afghanistan", "Albania", "Algeria", "American Samoa", "Angola", "Anguilla",
    "Antartica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Ashmore and Cartier Island", "Australia",
    "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
	"Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", 
	"Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands",
	"Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Clipperton Island",
	"Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the",
	"Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czeck Republic", "Denmark", 
	"Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
	"Estonia", "Ethiopia", "Europa Island", "Falkland Islands (Islas Malvinas)", "Faroe Islands", "Fiji", "Finland",
	"France", "French Guiana", "French Polynesia", "French Southern and Antarctic Lands", "Gabon", "Gambia, The", 
	"Gaza Strip", "Georgia", "Germany", "Ghana", "Gibraltar", "Glorioso Islands", "Greece", "Greenland", "Grenada",
	"Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", 
	"Heard Island and McDonald Islands", "Holy See (Vatican City)", "Honduras", "Hong Kong", "Howland Island", 
	"Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Ireland, Northern", "Israel", "Italy",
	"Jamaica", "Jan Mayen", "Japan", "Jarvis Island", "Jersey", "Johnston Atoll", "Jordan", "Juan de Nova Island",
	"Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", 
	"Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia",
	"Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Man, Isle of", "Marshall Islands", 
	"Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of",
	"Midway Islands", "Moldova", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nauru",
	"Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria",
	"Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama",
	"Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcaim Islands", "Poland", "Portugal", "Puerto Rico",
	"Qatar", "Reunion", "Romainia", "Russia", "Rwanda", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", 
	"Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
	"Saudi Arabia", "Scotland", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", 
	"Solomon Islands", "Somalia", "South Africa", "South Georgia and South Sandwich Islands", "Spain", 
	"Spratly Islands", "Sri Lanka", "Sudan", "Suriname", "Svalbard", "Swaziland", "Sweden", "Switzerland", "Syria",
	"Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tobago", "Toga", "Tokelau", "Tonga", "Trinidad", "Tunisia",
	"Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay",
	"USA", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands", "Wales", "Wallis and Futuna", 
	"West Bank", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe");

    var countryElement = document.getElementById(countryElementId);
    countryElement.length = 0;
    countryElement.options[0] = new Option('Select Country', '-1');
    countryElement.selectedIndex = 0;
    for (var i = 0; i < country_arr.length; i++) {
        countryElement.options[countryElement.length] = new Option(country_arr[i], country_arr[i]);
    }
}

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
							+"<button id='"+doc.email + "btn' class='btn btn-primary' type='button' onclick='javascript:sendRequest(\""+doc.email+"\");'>\
							Add Friend</button><br></div>";
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
	console.log("in showRequests ajax");
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
					html += "<div id='"+doc.email+ "'>"+doc.username +"\
							<button id='"+doc.email + "btn' class='btn btn-primary' type='button' onclick='javascript:acceptRequest(\""+doc.email+"\");'>\
							Confirm</button><br></div>";
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
				html += "<div><span>"+f.username+"</span><button id='"+f._id+ "'class='btn btn-primary' onclick=\"location.href='friendprofile-"+f._id+"'\">View Profile</button>";
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
				console.log(response.result);
				var photoPattern = /.jpeg|.jpg|.png|.gif/;
				$("#userPosts").html('');
				for(p of result){
					var newPost = "<section class='postItem'>\
					<div><a href='./friendprofile-"+p.postedby_id+"'>"+p.postedby_name+"</a>  on "+p.updatedAt.toLocaleString()+"</div><br>"+p.postcontent.posttext;
					if(p.postcontent.postimage != ""){
						console.log("post contains image");
						newPost += "<br><img src=/images/"+p.postcontent.postimage+" class='image' alt='Photo'><br>";
					}
					newPost += "<button type='button' class='btn btn-primary' onclick=\"javascript:likePost('"+p._id+"');\">Like</button>\
					<span id='"+p._id+"likecount'>"+p.likes.length+"Likes</span> \
					Comment:<input type='text' id='"+p._id+"commentInput' placeholder='Type your comment here'>\
					<button type='button' class='btn btn-primary' onclick=\"javascript:commentPost('"+p._id+"');\">Comment</button>\
					<div id='"+p._id+"comments'>";
					for(comment of p.comments){
						newPost += "<div>"+comment.by.username+" : "+comment.body+"</div>";
					}
					newPost += "</div></section>";	
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


var startfetch = function(){
	console.log("in startfetch ajax--");
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
				console.log(response.result);
				for(p of result){
					var newPost = "<section class='postItem'>\
					<div><a href='./friendprofile-"+p.postedby_id+"'>"+p.postedby_name+"</a>  on "+p.updatedAt.toLocaleString()+"</div><br>"+p.postcontent.posttext;
					if(p.postcontent.postimage != ""){
						console.log("post contains image");
						newPost += "<br><img src=/images/"+p.postcontent.postimage+" class='image' alt='Photo'><br>";
					}
					newPost += "<button type='button' class='btn btn-primary' onclick=\"javascript:likePost('"+p._id+"');\">Like</button>\
					<span id='"+p._id+"likecount'>"+p.likes.length+"Likes</span> \
					Comment:<input type='text' id='"+p._id+"commentInput' placeholder='Type your comment here'>\
					<button type='button' class='btn btn-primary' onclick=\"javascript:commentPost('"+p._id+"');\">Comment</button>\
					<div id='"+p._id+"comments'>";
					for(comment of p.comments){
						newPost += "<div>"+comment.by.username+" : "+comment.body+"</div>";
					}
					newPost += "</div></section>";
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
			document.getElementById(id+'likecount').innerHTML = result.likes.length + "Likes";
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


/*var postImage = function(){
	console.log("in postImage ajax");
	var data = new FormData();
	var img = document.getElementById('inputPhoto').value;
	data.append('image', img);
	$.ajax({
		url: "postPhoto",
		//headers:{
		//	"content-Type":"multipart/form-data"
		//},
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
}*/


/*var postStatus = function(){
	console.log("In post ajax");
	var postcontent = document.getElementById("posText").value;
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
			console.log("success in post ajax");
			document.getElementById("postText").value="";
			//location.reload();
		},
		error: function(result){
			console.log("failure in post ajax");
			alert("sorry,failed to post");
    	}
	});
	//return false;
}
*/