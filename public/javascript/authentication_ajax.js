var signup = function(){
	console.log("in signup ajax");
	data = {"email" : document.getElementById("inputEmail").value, 
			"password" : document.getElementById("inputPassword").value,
			"confirmPassword" : document.getElementById("inputConfirmPassword").value,
			"username" : document.getElementById("inputName").value };
	console.log(data);
	$.ajax({
		url: 'signup',
		headers: {"Content-Type" : "application/json"},
		type: "POST",
		data: JSON.stringify(data),
		success : function(result){
			console.log("return to signup ajax success:"+result);
			var data = JSON.parse(result);
			if(data.status == 200){
				window.location = "/users/login";	
			}
			else{
				document.getElementById('error_msg').innerHTML = data.msg;
				if(data.msg == 'Account already exists!'){
					window.location = "/users/signup";
				}
			}
			
		},
		error : function(result){
			console.log("return to signup ajax failure");
			//window.location = "/signup";
		}
 	});
}


var login = function(){
	console.log("in login ajax");
	data = {
			username: document.getElementById("inputName").value,
			//email: document.getElementById("inputEmail").value, 
			password: document.getElementById("inputPassword").value};
	console.log(data);
	$.ajax({
		url: 'login',
		headers: {"Content-Type" : "application/json"},
		type: "POST",
		data: JSON.stringify(data),
		success : function(result){
			console.log("return to login ajax success");
			var data = JSON.parse(result);
			if(data.status == 200){
				window.location = "/users/homepage";
				console.log("current user: "+data.user);	
			}
			else{
				console.log("login faled in ajax");
				document.getElementById('error_msg').innerHTML = data.msg;
			}
		},
		error : function(result){
			console.log("return to login ajax failure");
			window.location = "/users/login";
		}
 	});
}