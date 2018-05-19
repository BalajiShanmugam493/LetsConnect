var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');


var UserSchema = mongoose.Schema({
	email: String,
	username: String,
	password: String,
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
	postcontent: String,
	postedby_id: mongoose.Schema.Types.ObjectId,
	postedby_name: String,
	likes: Number,
	comments:[{by:String, body:String, date: Date}],
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
			        newUser.save(function(err, user){
				      if(err) throw err;
				      console.log("created user:"+user);
				    });
			        response = { status : 200, msg : "success"};
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


module.exports.getUserByName = function(username, callback){
	var query = {username: username};
	console.log("query username:"+query.username);
	User.findOne(query, callback);
};


module.exports.getUserByEmail = function(username, callback){
	var query = {email: email};
	console.log("query email:"+query.email);
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


module.exports.findFriends = function(query, req, res, callback){
	User.find({}, function(err, docs){
		console.log("search result : "+docs);
		if(err)throw err;
		var resultArr = [];
		for(doc of docs){
			if(doc.username.match(query.key) && doc._id != req.session.passport.user && doc.friends.indexOf(req.session.passport.user)<0 && doc.friendreq.indexOf(req.session.passport.user)<0){
				console.log("check:"+!doc.friendreq.includes(req.session.passport.user));
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
				newArr.push(req.session.passport.user);
			}
			else{
				newArr.push(req.session.passport.user);
			}
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
	console.log(req+res);
	User.find({_id:req.session.passport.user}, function(err, doc){
		console.log("friend requests for: "+doc);
		console.log("friend requests: "+doc.friendreq);
		if(err)throw err;
		var reqs=[];
		reqs=doc.friendreq;
		console.log("new friend requests : "+reqs);
		var resultArr = []; 
		for(req in reqs){
			User.find({_id:req},function(err,res){
				resultArr.push(res);
			});
		}
		callback(res, resultArr);
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
	User.findOne({_id:req.session.passport.user},function(err,doc){ 
		console.log("friendlist for: "+doc._id);
		if(err) throw err;
		var friends=[];
		friends=doc.friends;
		console.log("friends : ");
		console.log(friends);
		if(friends.length==0) callback(res,friends);
		var resultArr = []; 
		console.log("friends length:"+friends.length);
		for(friend of friends){
			//console.log(friend);
			User.findOne({_id:friend},function(err,doc1){				
				resultArr.push(doc1.username);
				if(resultArr.length == friends.length) callback(res,resultArr);
			});
		}
	});
}

module.exports.postMessage = function(data,req,res,callback){
	console.log("in post message function---");
	console.log(data);
	User.findOne({_id: req.session.passport.user},function(err,doc){
		if(err){
			console.log("post failed");
			response = {status: 406, msg: "post failed"};
			callback(res, response);
		}
		else {
			var postmsg={postcontent: data.postcontent, postedby_id:doc._id, postedby_name:doc.username, likes:data.likes};
			Post.create(postmsg,function(err,record){
				console.log("post added as:");
				console.log(typeof  record);
				console.log(record);
				insertPost(doc,record._id,req,res,callback);
			});
		}
	});	

	var insertPost=function(userdoc,record_id,req,res,callback){
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
}

module.exports.getPosts = function(req,res,callback){
	var friendlist = new Array();
	User.findOne({_id:req.session.passport.user},function(err,doc){
		if(err){
			console.log("getposts failed");
			response = {status: 406, msg: "cannot fetch posts"};
			callback(res, response);
		}
		else friendlist=doc.friends;
		console.log("posts from ");
		console.log(friendlist);
		console.log("friendlist length:"+friendlist.length);
		var resultArr=new Array();
		var count=0;
		for(friend of friendlist){
			Post.find({postedby_id:friend},function(err,docs){
				count++;
				if(err){
					console.log("getposts failed");
					response = {status: 406, msg: "cannot fetch posts"};
					callback(res, response);
				}
				else {
					for(doc of docs) resultArr.push(doc);
					if(count==friendlist.length) callback(res,resultArr);
				}
			});	
		}
	});
}
