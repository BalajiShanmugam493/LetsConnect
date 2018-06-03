var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
//var Post = require('./post');


var UserSchema = mongoose.Schema({
	email: String,
	username: String,
	password: String,
	dob: Date,
	firstname: String,
	lastname: String,
	gender: String,
	country: String,
	profilepic: String,
	friends: {
		type: [mongoose.Schema.Types.ObjectId],
		//default: new Array()
	},
	friendreq:{
		type: [mongoose.Schema.Types.ObjectId],
		//default: new Array()
	},
	posts:{
		type: [mongoose.Schema.Types.ObjectId],
		//default: new Array()
	}
});


var PostSchema = mongoose.Schema({
	postcontent: {
		posttext: String,
		postimage: String
	},
	postedby_id: mongoose.Schema.Types.ObjectId,
	postedby_name: String,
	likes: [new mongoose.Schema({ userid: mongoose.Schema.Types.ObjectId, username: String},{_id: false})],
	comments:[{
		by:{ userid: mongoose.Schema.Types.ObjectId, username: String}, 
		body:String, 
		date: Date
	}],
}, {
	timestamps:true
});

	
var Post = module.exports = mongoose.model('Post', PostSchema);
var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser,req, res, callback){
	console.log("current email:"+newUser.email);
	var query = {email: newUser.email};
	User.find(query,function(err, result){
		console.log(result);
		//response = {status: 0, msg: ''};
		if(result.length == 0){
			console.log("account valid");
			var bcrypt = require('bcryptjs');
			bcrypt.genSalt(10, function(err, salt) {
			    bcrypt.hash(newUser.password, salt, function(err, hash) {
			        // Store hash in your password DB. 
			        newUser.password = hash;
			        User.create(newUser, function(err, user){
				      if(err) throw err;
				      console.log("created user:"+user);
				    });
			        response = { status : 200, msg : "Account created successfully!"};
			        console.log("response:"+response+" type:"+ typeof response);
     				callback(res, response);
			    });
			});
		}
		else{
			console.log("account invalid!");
			response = { status : 400, msg : "Account already exists!"};
			console.log("response:"+response+" type:"+ typeof response);
     		callback(res, response);
      	}
      	
	});
	
	
};


module.exports.getUserByEmail = function(username, callback){
	var query = {email: email};
	console.log("query email:"+query.email);
	User.findOne(query, callback);
};


module.exports.getUserByName = function(username, callback){
	var query = {"username": username};
	console.log("query username:"+query.username);
	User.findOne(query, callback);
};


module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
};


module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch){
		if(err) throw err;
		callback(null, isMatch);
	});
	//return passwordHash.verify(candidatePassword, this.password);
};

var isMatch = function(str1, str2){
	if(str1.length > str2.length){
		var temp = str1;
		str1 = str2;
		str2 = temp;
	}
	for(var i=0; i<str1.length-2; i++){
		if(str2.indexOf(str1.substring(i,i+3))>=0)return true; 
	}
	return false;
}
module.exports.findFriends = function(query, req, res, callback){
	User.find({}, function(err, docs){
		if(err)throw err;
		var resultArr = [];
		for(doc of docs){
			console.log("userid:"+req.user._id+" current id:"+doc._id);	
			if(!doc._id.equals(req.user._id) && isMatch(doc.username, query.key)){//&& doc.friends.indexOf(req.user._id)<0 && doc.friendreq.indexOf(req.session.passport.user)<0
				//console.log("check:"+doc.friendreq.includes(req.session.passport.user));
				resultArr.push(doc);
			}	
		}
		callback(res, resultArr);
	});
};


module.exports.sendRequest = function(query, req, res, callback){
	User.find(query, function(err, doc){
		console.log("search result : "+doc);
		if(err){
			console.log("request failed");
			response = {status: 406, msg: "request failed"};
			callback(res, response);
		}
		else{
			var newArr = doc.friendreq;
			if(newArr === undefined){
				newArr = new Array();
			}
			newArr.push(req.session.passport.user);
			console.log("typeof newArr "+ typeof newArr+" "+newArr);
			//doc.friendreq.push(req.session.passport.user);
			doc.friendreq = newArr;
			console.log("added new request:"+JSON.stringify(doc));
			User.findOneAndUpdate(query, {$set:{friendreq:newArr}}, function(err, doc){
				console.log("updated doc:"+doc);
    			response = {status: 200, msg: "request sent"};
				callback(res, response);	
			});
			//console.log("updated user:"+JSON.stringify());
		}
	});
}

module.exports.showRequests = function(req,res,callback){
	//console.log(req);
	User.findById(req.session.passport.user, function(err, doc){
		console.log("friend requests for "+doc.username+": "+doc.friendreq);
		if(err)throw err;
		var reqs=[];
		reqs=doc.friendreq;
		if(reqs == undefined || reqs.length == 0){
			callback(res, []);
		}
		var resultArr = []; 
		for(r of reqs){
			console.log("req id:"+r);
			User.findById(r, function(err,doc1){
				console.log("friendreq from :"+doc1.username);
				resultArr.push(doc1);
				if(resultArr.length==reqs.length) {
					console.log("new friend requests : "+resultArr);
					callback(res, resultArr);
				}
			});
		}		
	});
}


module.exports.acceptRequest = function(query, req, res, callback){
	User.findOne(query, function(err, doc1){
		//console.log("search result : "+doc1);
		if(err){
			console.log("accept failed");
			response = {status: 406, msg: "accept failed"};
			callback(res, response);
		}
		else{
			var newArr = doc1.friends;
			if(newArr === undefined) newArr = new Array();
			newArr.push(req.session.passport.user);
			//console.log("typeof newArr "+ typeof newArr+" "+newArr);
			//doc1.friends.push(req.session.passport.user);
			doc1.friends = newArr;
			console.log("added new friend: "+doc1._id);
			User.findOneAndUpdate(query, {$set:{friends:newArr}}, function(err, doc1){
				console.log("requestor updated:"+doc1);
    			response = {status: 200, msg: "accepted"};		
    			updateAcceptor(doc1._id,req,res,callback);
    			
			});
			//console.log("updated user:"+JSON.stringify());
		}
	});
	updateAcceptor = function(docid,req,res,callback){
		User.findOne({_id:req.session.passport.user},function(err,doc2){
			var  friendArr=doc2.friends;
			friendArr.push(docid);
			var reqArr=doc2.friendreq;
			var removed=reqArr.splice(reqArr.indexOf(docid),1);
			doc2.friendreq=reqArr;
			//console.log("removed "+removed+"from "+doc2.friendreq);
			User.update({_id:req.session.passport.user}, {$set:{friends:friendArr, friendreq:reqArr}}, function(err, doc1){
				console.log("Acceptor updated."+JSON.stringify(doc1));
    			response = {status: 200, msg: "accepted"};		
				callback(res,response);	
			});	
		});
	}
}

module.exports.showFriends = function(req,res,callback){
	//console.log(req+res);
	var friends = req.user.friends;
	if(friends.length==0) callback(res,friends);
	var resultArr = []; 
	console.log("friends length:"+friends.length);
	for(friend of friends){
		//console.log(friend);
		User.findOne({_id:friend},function(err,doc){				
			resultArr.push({username: doc.username, _id: doc._id});
			if(resultArr.length == friends.length) callback(res,resultArr);
		});
	}
}

module.exports.insertPost = function(userdoc, record_id, req, res, callback){
	var newArr = userdoc.posts;
	if(newArr === undefined) newArr = new Array();
	newArr.push(record_id);
	//console.log("typeof newArr "+ typeof newArr+" "+newArr);
	userdoc.posts = newArr;
	console.log("added new post:"+JSON.stringify(userdoc));
	User.findOneAndUpdate({_id:userdoc._id},{$set:{posts:newArr}}, function(err, doc1){
		console.log("user updated.");
		response = {status: 200, msg: "posted"};		
		callback(res,response);    			
	});
}



module.exports.postMessage = function(postdata, req, res, callback){
	console.log("in post message function:"+JSON.stringify(postdata));
	console.log(postdata);
	var postmsg={postcontent: postdata, postedby_id:req.user._id, postedby_name:req.user.username, likes:[], comments: []};
	Post.create(postmsg, function(err, record){
		console.log("post added as:");
		console.log(typeof  record);
		console.log(record);
		User.insertPost(req.user, record._id, req, res, callback);
	});

	
}


module.exports.changeProfilePic = function(image,req,res,callback){
	console.log("in post message function---");
	User.findByIdAndUpdate(req.user._id,  {$set:{profilepic: image.path}}, function(err, doc){
		if(err){
			console.log("upload dp error");
			throw err;
		}
		console.log("user updated.");
		response = {status: 200, msg: "profile pic changed"};		
		callback(res,response);  
	});
}


module.exports.getPosts = function(req,res,callback){
	console.log("In getPosts model");
	var friends = req.user.friends;
	var count=0;
	var resultArr = new Array();
	if(friends == undefined || friends.length == 0){
		callback(res,[]);
	}
	Post.find({postedby_id:req.user._id},function(err,docs){
		if(err){
			console.log("getposts failed");
			response = {status: 406, msg: "cannot fetch posts"};
			callback(res, response);
		}
		else {
			for(doc of docs) resultArr.push(doc);
			console.log("fetched posts:"+resultArr);
		}
	});
	for(friend of friends){
		Post.find({postedby_id:friend},function(err,docs){
			count++;
			console.log("friend " + count);
			if(err){
				console.log("getposts failed");
				response = {status: 406, msg: "cannot fetch posts"};
				callback(res, response);
			}
			else {
				for(doc of docs) resultArr.push(doc);
				console.log("fetched posts:"+resultArr);
				if(count==friends.length) callback(res,resultArr);
			}
		});
	}
}



module.exports.likePost = function(postid, req, res, callback){
	//console.log(""+"./");
	Post.findById(postid, function(err,doc){
		if(err){
			console.log("addlikes failed 1: "+err);
			response = {status: 406, msg: "cannot fetch your posts"};
			callback(res, response);
		}
		var oldLikes = doc.likes;
		console.log("old likes:"+oldLikes);
		var newLiker = {userid: req.user._id, username: req.user.username};
		var isNew = true;
		if(oldLikes.length != 0){
			for(like of oldLikes){
				console.log("like = "+like.username+" newliker = "+newLiker);
				if(like.userid.equals(newLiker.userid)){
					isNew = false;
					break;
				}
			}
		}
		if(isNew){
			console.log("new like added");
			oldLikes.push(newLiker);
			Post.findByIdAndUpdate(postid, {$set: {"likes": oldLikes}}, function(err,doc){
				if(err){
					console.log("addlikes failed 2 : "+err);
					response = {status: 406, msg: "cannot fetch your posts"};
					callback(res, response);
				}
				console.log("after updating likes:"+doc);
				var response = {"status": 200, "msg": "post liked", "likes": oldLikes};
				callback(res, response);
			});
		}
		else {
			console.log("Already liked!");
			var response = {"status": 200, "msg": "post liked", "likes": oldLikes};
			callback(res, response);
		}
	})
	
}


module.exports.commentPost = function(req, res, callback){
	//console.log(""+"./");
	var newComment = {
		by: {userid: req.user.id, username: req.user.username},
		body: req.body.comment,
		date: new Date()
	};
	Post.findById(req.body.id, function(err,doc){
		if(err){
			console.log("addcomment failed 1: "+err);
			response = {status: 406, msg: "cannot comment this post"};
			callback(res, response);
		}
		var oldComments = doc.comments;
		console.log("old comments:");
		console.log(oldComments);
		var isNew = true;
		oldComments.push(newComment);
		Post.findByIdAndUpdate(req.body.id, {$set: {"comments": oldComments}}, function(err,doc){
			if(err){
				console.log("add comments failed 2 : "+err);
				response = {status: 406, msg: "cannot comment this post"};
				callback(res, response);
			}
			console.log("after updating likes:"+doc);
			var response = {"status": 200, "msg": "post commented", "comment": newComment, "count": oldComments.length};
			callback(res, response);
		});
	})
	
}


module.exports.getPostsByUser = function(user, req, res, callback){
	//console.log(""+"./");
	Post.find({postedby_id: user}, function(err,doc){
		if(err){
			console.log("getposts failed"+err);
			response = {status: 406, msg: "cannot fetch your posts"};
			callback(res, response);
		}
		console.log("my posts:"+doc);
		var response = {status: 200, msg: "fetch user's post successful!", result: doc, user: req.user};
		callback(res, response);
	});
}

module.exports.getFriendProfile = function(id, req, res, callback){
	User.findById(id, function(err, doc){
		if(err) throw err;
		callback(res, doc);
	});
}