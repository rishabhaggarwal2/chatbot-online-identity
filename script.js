angular.module('identityApp', ['ngAnimate'])
  .controller('IdentityController', ($scope, $interval, $timeout, $http) => {

  	//if you want to reuse anything multiple times for questions and answers, add it here
  	$scope.variables = {
    	name: '',
    	location: '',
    	fullLocation: '',
    	photo: '',
    	person: {},
    	events: [],
    	likes: [],
    	photos: [],
    	photoLinks: [],
    	showcase: {
    		interests: "I am interested in movies, music and travel! I also love meeting new people.",
    		work: "I do a lot of digital design and development work. You can find some at http://rishabhaggarwal.net",
    		about: "I grew up in New Delhi, India and moved to LA when I was 18 to go to UCLA."
    	}
    };

    // This is to get data from Facebook and can be ignored for a custom bot
  	function fetchFacebook() {
  		updateNext();
		FB.api("/me?fields=id,name,picture,location,hometown,birthday,about,context", function (response) {
  			if (response && !response.error) {
  				console.log(response);
  				$scope.variables.photo = response.picture.data.url;
  				document.styleSheets[0].insertRule('.chat__bubble.chat__bubble__to:last-child::after { background: url(' + response.picture.data.url + ') center center; }', 0);
    		}
  		});

  		FB.api(
  		    "/me/events?type=attending",
  		    function (response) {
  		      if (response && !response.error) {
  		        console.log(response);
  		        $scope.variables.events = response.data;
  		      }
  		    }
  		);

  		FB.api(
  		    "/me/likes",
  		    function (response) {
  		      if (response && !response.error) {
  		        console.log(response);
  		        $scope.variables.likes = response.data;
  		      }
  		    }
  		);

  		FB.api(
  		    "/me/photos",
  		    function (response) {
  		      if (response && !response.error) {
  		        console.log(response);
  		        $scope.variables.photos = response.data;
  		        $scope.variables.photos.map((photo) => {
  		        	FB.api(
  		        	    "/" + photo.id +"?fields=images",
  		        	    function (response) {
  		        	      if (response && !response.error) {
  		        	        $scope.variables.photoLinks.push(response.images[0].source);
  		        	      }
  		        	    }
  		        	);
  		        });
  		      }
  		    }
  		);
  	};

  	// This is to login using OAuth with Facebook and can be ignored for a custom bot
  	function facebookLogin() {
  		$.ajaxSetup({ cache: true });
	  	$.getScript('//connect.facebook.net/en_US/sdk.js', function(){
	  	   
	  	   	FB.init({
	  	     	appId: '629036014153864',
	  	     	version: 'v2.7' // or v2.1, v2.2, v2.3, ...
	  	   	});     
	  	   
	  	   	FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					console.log('Logged in.');
					fetchFacebook();
				}
				else {
					FB.login(function(response){
						if (response.authResponse) {
							fetchFacebook();
							console.log("Gotchu");
						} else {
							console.log('User cancelled login or did not fully authorize.');
							$scope.activeConversation.question.text[0] = "Sorry I can't trust you if you can't trust me! Click to try again.";
							$('.chat__input__text').on('click', $scope.activeConversation.question.action);
						}
					}, 
					{scope: 'public_profile,email,user_likes,user_location,user_about_me,user_events,user_hometown,user_photos'});
				}

			});
	  	});
  	};

  	/*
  	EDITABLE: This is the main customizable conversation that you would add to or modify
  	The structure is:
  	{
  		sender: 'rishabh' | 'other' | 'none',
	  	messages: [string] | [],
	  	media : [urls] : null,
	  	question: {
	  		exists: boolean,
	  		input: string - placheholder text,
	  		variable: string - corresponsing to $scope.variables,
	  		text: [string - options for buttons],
	  		action: function - more on this later - find customFunction,
	  		listener: "enter" | "click",
  		},
  		writing: boolean - set to true if you want to show the typing dots,
  	}
  	*/
  	
    $scope.fullConversation = [
    	{
    		sender: 'rishabh',
    		messages: ['Hello!', 'My name is Rishabh!', 'Thanks for visiting my website.', 'What\'s your name?'],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: true,
    	},
    	{
    		sender: 'none',
    		messages: [],
    		media : null,
    		question: {
    			exists: true,
    			input: 'What is your name?',
    			variable: 'name',
    			text: [],
    			action: updateName,
    			listener: "enter",
    		},
    		writing: false,
    	},
    	{
    		sender: 'other',
    		messages: [$scope.variables.name],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: false,
    	},
    	{
    		sender: 'rishabh',
    		messages: ['Hi !', 'Very nice to meet you.', 'I am a digital designer based in Los Angeles', 'Where are you based?'],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: true,
    	},
    	{
    		sender: 'none',
    		messages: [],
    		media : null,
    		question: {
    			exists: true,
    			input: null,
    			variable: 'location',
    			text: ["Share Location"],
    			action: updateLocation,
    			listener: "click",
    		},
    		writing: false,
    	},
    	{
    		sender: 'other',
    		messages: [$scope.variables.location],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: false,
    	},
    	{
    		sender: 'rishabh',
    		messages: ['Oh I see, you are in ', 'What would you like to know about me?'],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: true,
    	},
    	{
    		sender: 'none',
    		messages: [],
    		media : null,
    		question: {
    			exists: true,
    			input: null,
    			variable: 'location',
    			text: ["Your Interests", "Your Work", "More about you"],
    			action: updateShowcase,
    			listener: "click",
    		},
    		writing: false,
    	},
    	{
    		sender: 'other',
    		messages: ["Tell me about your interests"],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: false,
    	},
    	{
    		sender: 'rishabh',
    		messages: ['Oh I see, you are in ', 'What would you like to know about me?', 'Wait, Aren\'t you curious about how I am talking to you right now?'],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: true,
    	},
    	{
    		sender: 'none',
    		messages: [],
    		media : null,
    		question: {
    			exists: true,
    			input: null,
    			variable: 'location',
    			text: ["Yes I am!", "Yeah this is crazy!", "A little bit"],
    			action: updateYes,
    			listener: "click",
    		},
    		writing: false,
    	},
    	{
    		sender: 'other',
    		messages: ["Woooo"],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: false,
    	},
    	{
    		sender: 'rishabh',
    		messages: ['Haha I figured! Let me explain!', 'But let\'s give a face to your name first (literally) so I know I can trust you :p'],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: true,
    	},
    	{
    		sender: 'none',
    		messages: [],
    		media : null,
    		question: {
    			exists: true,
    			input: null,
    			variable: 'location',
    			text: ["Add my profile picture from Facebook"],
    			action: updateFacebook,
    			listener: "click",
    		},
    		writing: false,
    	},
    	{
    		sender: 'other',
    		messages: ["Add my profile picture from Facebook"],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: false,
    	},
    	{
    		sender: 'rishabh',
    		messages: ["Sweet! It's so much better now with your photo in the conversation", "Now can I trust you to keep my secret?"],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: true,
    	},
    	{
    		sender: 'none',
    		messages: [],
    		media : null,
    		question: {
    			exists: true,
    			input: null,
    			variable: 'location',
    			text: ["Yes you can trust me!"],
    			action: updateHack,
    			listener: "click",
    		},
    		writing: false,
    	},
    	{
    		sender: 'other',
    		messages: [],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: true,
    	},
    	{
    		sender: 'other',
    		messages: [],
    		media : [],
    		question: {
    			exists: false,
    		},
    		writing: true,
    	},
    	{
    		sender: 'rishabh',
    		messages: ["Wow that's a lot of trust for someone you just met online!"],
    		media : null,
    		question: {
    			exists: false,
    		},
    		writing: true,
    	},
    ];

    /*
	This function is needed for the bot to procees to the next question automatically
    */
    const updateNext = () => {
    	let index = $scope.conversation.length - 1;
    	if(index + 1 < $scope.fullConversation.length) {
    		// $scope.conversation.push({...$scope.fullConversation[index+1], messages: []})
    		let convo = clone($scope.fullConversation[index + 1]);
    		convo.messages = [];
    		$scope.conversation.push(convo);
    		$scope.activeConversation = $scope.conversation[index + 1];
    		if(index > 4 && index < 15) {
    			intervals = $interval(updateConversation, 2500);
    		} else {
    			intervals = $interval(updateConversation, 1500);
    		}
    	} else {
    		fini();
    	}
    }


    /*
	Your customFunction functions will be of the format below
	These are needed when you ask the user a question
	If you don't want to care about the answer and don't want user to 'type' it, you can just call function goNext
    */

    function goNext() {
    	$('.chat__input__text').off('click', $scope.activeConversation.question.action);
    	$('.chat__input__icon').off('click', $scope.activeConversation.question.action);
    	updateNext();
    }

    /*
	Otherwise you can create a simple function like below
	where you change some part of the conversation and call goNext()
    */

    function sampleFunction() {
    	$scope.fullConversation[2].messages[0] = $scope.variables.name;
    	goNext();
    }


    //Everything below is only pertinent to the original program and not needed for customization

    function updateName(){
    	$('.chat__input__icon').off('click', $scope.activeConversation.question.action);
    	$scope.fullConversation[2].messages[0] = $scope.variables.name;
    	$scope.fullConversation[3].messages[0] = "Hi " + $scope.variables.name + "!";
    	updateNext();
    };

    function updateLocation(){
    	console.log("Location sharing begin");
    	$scope.activeConversation.question.text[0] = "Locating...";
    	$scope.$apply();
    	$('.chat__input__text').off('click', $scope.activeConversation.question.action);
    	navigator.geolocation.getCurrentPosition((position) => {
    		console.log("Location sharing received");
    	  $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&key=AIzaSyCFCqtLtn75Hbk06Wj9SwlpeTThWh213o8').then(
    	  	(result) => {
    	  		console.log("success", result);
    	  		$scope.variables.location = result.data.results[0].address_components[3].long_name;
    	  		$scope.variables.fullLocation = result.data.results[0].formatted_address;
    	  		$scope.fullConversation[5].messages[0] = "I am based in " + $scope.variables.location;
    	  		if($scope.variables.location.indexOf('Angeles') === -1) {
    	  			$scope.fullConversation[6].messages[0] = "Oh I visited " + $scope.variables.location + " last year. I really liked it there";
    	  		} else {
    	  			$scope.fullConversation[6].messages[0] = "Oh so you are from LA as well! That's awesome!";
    	  		}
    	  		updateNext();
    	  	},
    	  	() => {
    	  		console.log("failure");
    	  		$scope.activeConversation.question.text[0] = "Can't continue conversation without your location";
    		$scope.$apply();
    		$('.chat__input__text').on('click', $scope.activeConversation.question.action);
    	  	}
    	  );
    	}, () => {
    		console.log("Failed");
    		$scope.activeConversation.question.text[0] = "Can't continue conversation without your location";
    		$scope.$apply();
    		$('.chat__input__text').on('click', $scope.activeConversation.question.action);
    	});
    }

    function updateShowcase(e){
    	let option = e.target.innerText;
    	$('.chat__input__text').off('click', $scope.activeConversation.question.action);
    	if(option === "Your Interests") {
    		$scope.fullConversation[8].messages[0] = "Tell me more about your interests";
    		$scope.fullConversation[9].messages[0] = "Sure!";
    		$scope.fullConversation[9].messages[1] = $scope.variables.showcase.interests;
    	} else if(option === "Your Work") {
    		$scope.fullConversation[8].messages[0] = "Tell me more about your work";
    		$scope.fullConversation[9].messages[0] = "Right to business I see";
    		$scope.fullConversation[9].messages[1] = $scope.variables.showcase.work;
    	} else {
    		$scope.fullConversation[8].messages[0] = "Can you tell me more about yourself?";
    		$scope.fullConversation[9].messages[0] = "I would love to";
    		$scope.fullConversation[9].messages[1] = $scope.variables.showcase.about;	
    	}
    	updateNext();
    }

    function updateYes(e){
    	let option = e.target.innerText;
		$scope.fullConversation[11].messages[0] = option;
    	$scope.$apply();
    	$('.chat__input__text').off('click', $scope.activeConversation.question.action);
    	updateNext();
    }

    function updateFacebook(){
    	console.log("Facebook thing began");
    	$scope.activeConversation.question.text[0] = "Fetching profile picture...";
    	$scope.$apply();
    	$('.chat__input__text').off('click', $scope.activeConversation.question.action);
    	facebookLogin();
    }

    function updateHack(){
    	$('.chat__input__text').off('click', $scope.activeConversation.question.action);
    	let likes = "";
    	for(let i = 0; i < 4; i++) {
    		$scope.fullConversation[17].messages.push("I'm going to " + $scope.variables.events[i].name + " at " + $scope.variables.events[i].place.name + "");
    		likes += $scope.variables.likes[i].name + " ,";
    	}
    	$scope.fullConversation[17].messages.push("I like " + likes);
    	for(let i = 0; i < 10; i++) {
    		$scope.fullConversation[18].media.push($scope.variables.photoLinks[i]);
    	}
    	updateNext();
    }

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    $scope.conversation = [];
    let convo = clone($scope.fullConversation[0]);
    convo.messages = [];
    // $scope.conversation.push({...$scope.fullConversation[0], messages: []});
    $scope.conversation.push(convo);
    $scope.activeConversation = $scope.conversation[0];
    $scope.collapse = false;

    function fini() {
    	console.log("fini!");
    	$interval.cancel(intervals);
    	$timeout(()=>{
    		$("body").css("background", "#000");
    		$scope.collapse = true;
    		$timeout(()=>{
    			var typed = new Typed('#typed', {
    			  strings: ["Thanks for participating! I now have access to all your 'private' information! <br> ---------------------------------------- <br>Don't worry, I won't use it for any malicious purposes since I didn't store it anywhere. <br> ---------------------------------------- <br>Make sure you go to https://www.facebook.com/settings?tab=applications and revoke access from the hundreds of apps you have given your personal information to and keep in mind when you login using social media in the future to see what the app requires access for! Happy Browsing! <br> ---------------------------------------- <br>Made by Rishabh Aggarwal - rishabhaggarwal.net"],
    			  typeSpeed: 30
    			});
    		}, 1000);
    	}, 4000);
    };

    const updateConversation = () => {
    	let index = $scope.conversation.length - 1;
    	$scope.activeConversation = $scope.conversation[index];

    	if($scope.activeConversation.question.exists) {
    		$interval.cancel(intervals);
    		if($scope.activeConversation.question.listener === "enter") {
    			$('.chat__input__icon').on('click', $scope.activeConversation.question.action);
    		} else if($scope.activeConversation.question.listener === "click") {
    			$('.chat__input__text').on('click', $scope.activeConversation.question.action);
    		}
    		console.log("okay", $scope.activeConversation);
    		// console.log($scope.variables);
    	} else {
    		let messageIndex = $scope.conversation[index].messages.length;
    		
    		if(messageIndex !== $scope.fullConversation[index].messages.length) {
    			$scope.conversation[index].messages.push($scope.fullConversation[index].messages[messageIndex]);
    		} 

    		messageIndex = $scope.conversation[index].messages.length;

    		if(messageIndex === $scope.fullConversation[index].messages.length) {
    			$scope.conversation[index].writing = false;
    			if(index + 1 < $scope.fullConversation.length) {
    				// $scope.conversation.push({...$scope.fullConversation[index+1], messages: []})
    				let convo = clone($scope.fullConversation[index + 1]);
    				convo.messages = [];
    				$scope.conversation.push(convo);
    				$scope.activeConversation = $scope.conversation[index + 1];
    			} else {
    				fini();
    			}
    		}
    	}
    };

    
    let intervals = $interval(updateConversation, 1500);

  });