$(document)
	.ready(
	function () {

		var user, selectedFriend, friendId, friends;

		$.ajaxSetup({ "cache": false });

		// id verification by token it's important

		// show more message button

		//*************************************************************************************************************
		//*																											  *
		//*										asyncronous process													  *
		//*																											  *
		//*                                                                                                           *
		//*************************************************************************************************************


		// ==================================
		// socket messages :
		// ==================================

		var webSocket = new WebSocket("ws://localhost:8081/socialMedia/severChat");


		if (window.WebSocket) {
			// On Open :
			webSocket.onopen = function () {
				var username = getParameterByName('username');
				webSocket.send("_authentication:" + username);
			}
			//On Message :
			webSocket.onmessage = function (message) {
				var user_id = localStorage.getItem("user_id");

				if (typeof message.data === 'string') {
					console.log(message.data)
				} else {
					var result = JSON.parse(message.data);
					switch (result.type) {
						case "message":
							$("#conversation").append('<li class="left clearfix"><span class="chat-img1 pull-left"> <img src="' + selectedFriend.picture_URL + '" alt="' + selectedFriend.username + '" class="img-circle"></span><div class="chat-body1 clearfix"><p style="background: #ffe6cb none repeat scroll 0 0;border-radius: 5px;padding: 10px;overflow: hidden;color:rgb(212, 147, 67);"> ' + result.messageContent + '</p><div class="chat_time pull-right"><i class="fa fa-clock-o"></i>' + formatAMPM(new Date(result.date)) + '</div></div></li>');
							$(".chat_area").animate({ scrollTop: $("#conversation").height() }, 0);
							break;
						case "invitation":
							var userProposer = getUserById(result.idUser);

							STR += '<li style="border-bottom: #8081/socialMedia80 solid 1px;padding: 12px;margin: 4px;box-shadow: 2px 2px 20px #8081/socialMedia80;background-color: #e6dcdc;"><img class="img-circle pull-left" height="50" width="50" src="' + userProposer.picture_URL + '" /><div class="pull-left" style="margin-left: 20px;"><strong>' + userProposer.username + '</strong></div><p class="pull-right"><i class="fa fa-check check" data-user-notification="' + userProposer.idUser + '" title="accept "></i><i class="fa fa-times delete" data-user-notification="' + userProposer.idUser + '" title="remove "></i></p><div class="clearfix"></div></li>';
							break;
					}
				}

			}
			// On Close :
			webSocket.onclose = function () {
				console.log("closed webSocket");
			};
			// On Error :
			webSocket.onerror = function (error) {
				console.log("error webSocket");
			};
		} else {
			console.log("browser not support web seocket ....");
		}

		// ==================================
		// message sender :
		// ==================================

		function sendMessage(friendID, message) {
			var user_id = localStorage.getItem("user_id");

			webSocket.send(JSON.stringify({ "type": "message", "to": selectedFriend.username, "message": { "idUser": parseInt(user_id), "idFriend": parseInt(friendID), "date": new Date(), "messageContent": message, "status": false } }));
			var m = addMessage(friendID, message);

		}
		$("#message_content").on('submit', function (e) {
			e.preventDefault();
			if ($('textarea[name=message]').val() != "") {
				sendMessage(friendId, $('textarea[name=message]').val())
				$('#message_content')[0].reset();
			}

		});

		// ==================================
		//  Invitations sender :
		// ==================================


		function sendInvitation(friendID) {
			var user_id = localStorage.getItem("user_id");
			var userInvited = getUserById(parseInt(friendID));
			console.log(userInvited);
			inviteFriend(friendID);
			webSocket.send(JSON.stringify({ "type": "invitation", "to": userInvited.username, "message": '{ "idUser": parseInt(user_id) }' }));

		}


		//*************************************************************************************************************
		//*																											  *
		//*										All functions														  *
		//*																											  *
		//*                                                                                                           *
		//*************************************************************************************************************


		// ==================================
		// get parameter from url
		// ==================================
		function getParameterByName(name) {
			var match = RegExp('[?&]' + name + '=([^&]*)').exec(
				window.location.search);
			return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		}


		// ==================================
		// GET All friends of User
		// ==================================



		function getAllFriends() {
			var user_id = localStorage.getItem("user_id");
			$("#user_friends").empty();
			$.ajax({
				url: "http://localhost:8081/socialMedia/user/" + user_id + "/friends",
				type: "GET",
				dataType: "json",
				contentType: 'application/json',
				success: function (data) {
					friends = data;
					var friendsSTR = "";
					for (var i = 0; i < friends.length; i++) {
						friendsSTR += '<li data-user-id="' + friends[i].friend.idUser + '" class="left clearfix"><span class="chat-img pull-left"><img src="' + friends[i].friend.picture_URL + '" alt="' + friends[i].friend.username + '" class="img-circle"></span><div class="chat-body clearfix"><div class="header_sec"><strong class="username">' + friends[i].friend.username + '</strong> <strong class="pull-right"> ' + formatAMPM(new Date(friends[i].date)) + '</strong></div><div class="contact_sec"><strong class="primary-font" style="color:gray;font-weight:lighter;">' + friends[i].lastMessageContent + '</strong> <span class="badge pull-right">' + friends[i].countMessages + '</span></div></div></li>';
					}
					$("#user_friends").html(friendsSTR);
				},
				error: function (data) {
					console.log("no friends available");
				},
				async: false
			})

		}
		// ==================================
		// GET Current User
		// ==================================
		function getCurrentUser() {
			var user_id = localStorage.getItem("user_id");
			$.ajax({
				url: "http://localhost:8081/socialMedia/user/" + user_id,
				type: "GET",
				dataType: "json",
				contentType: 'application/json',
				success: function (data) {
					user = data;
					$("#user")
						.html(
						'<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><span class="userImage pull-left"><img src="'
						+ user.picture_URL
						+ '" alt="'
						+ user.username
						+ '" class="img-circle"></span> <span>'
						+ user.username
						+ '</span> <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#">Déconnecter</a></li></ul>');

				},
				error: function (data) {
					//window.location = "index.html";
				},
				async: false
			});

		}
		$(window).on('load', getCurrentUser());
		$(window).on('load', getAllFriends());
		$(window).on('load', getNotificationMessage());
		$(window).on('load', getInvitations());

		/*setInterval(function () {
			if (friendId != undefined) {

				getNotificationMessage();
			}
		}, 6000);*/

		/*setInterval(function () {
			if (friendId != undefined) {

				getConversation(friendId);
			}
		}, 500);*/


		/*setInterval(function () {
			get();
			getAllFriends();
		}, 120000);*/

		// ============================================
		// GET User By Id 
		// ============================================

		function getUserById(user_id) {
			$.ajax({
				url: "http://localhost:8081/socialMedia/user/" + user_id,
				type: "GET",
				dataType: "json",
				contentType: 'application/json',
				success: function (data) {
					selectedFriend = data;
				},
				error: function (data) {
					window.location = "index.html";
				},
				async: false
			});
			return selectedFriend;
		}
		// ============================================
		// GET Message Between Current user and Friend
		// ============================================



		function getConversation(idFriend) {

			var user_id = localStorage.getItem("user_id");
			friendId = idFriend;
			getUserById(idFriend);

			$.ajax({
				url: "http://localhost:8081/socialMedia/user/" + user_id + "/friends/" + idFriend,
				type: "GET",
				dataType: "json",
				contentType: 'application/json',
				success: function (data) {
					var messages = data;
					var messagesSTR = "";
					messages.sort(function (a, b) {
						var dateA = new Date(a.date), dateB = new Date(b.date);
						return dateA - dateB;
					});
					for (var i = 0; i < messages.length; i++) {
						if (messages[i].idUser == friendId) {
							messagesSTR += '<li class="left clearfix"><span class="chat-img1 pull-left"> <img src="' + selectedFriend.picture_URL + '" alt="' + selectedFriend.username + '" class="img-circle"></span><div class="chat-body1 clearfix"><p style="background: #ffe6cb none repeat scroll 0 0;border-radius: 5px;padding: 10px;overflow: hidden;color:rgb(212, 147, 67);"> ' + messages[i].messageContent + '</p><div class="chat_time pull-right"><i class="fa fa-clock-o"></i>' + formatAMPM(new Date(messages[i].date)) + '</div></div></li>';
						} else {
							messagesSTR += '<li class="left clearfix"><span class="chat-img1 pull-right"> <img src="' + user.picture_URL + '" alt="' + user.username + '" class="img-circle"></span><div class="chat-body1 clearfix"><p style="background: #c7eafc none repeat scroll 0 0;border-radius: 5px;padding: 10px;overflow: hidden;color:rgb(142, 143, 167);">' + messages[i].messageContent + '</p><div class="chat_time pull-left"><i class="fa fa-clock-o"></i>' + formatAMPM(new Date(messages[i].date)) + '</div></div></li>';
						}

					}
					$("#conversation").html(messagesSTR);
					$(".chat_area").animate({ scrollTop: $("#conversation").height() }, 0);

				},
				error: function (data) {
					console.log(data);
				}
			});
		}

		// ==================================
		// GET Friends information
		// ==================================

		$("body").on("click", "#user_friends li", function () {
			friendId = $(this).data("user-id");
			console.log(friendId);
			resetChat();
			getConversation(friendId);
			$("#send").prop('disabled', false);
		});

		// ==================================
		// Reset Chat
		// ==================================
		function resetChat() {
			$("#conversation").empty();
		}
		// ==================================
		// date format
		// ==================================
		function formatAMPM(date) {
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var ampm = hours >= 12 ? 'PM' : 'AM';
			hours = hours % 12;
			hours = hours ? hours : 12;
			minutes = minutes < 10 ? '0' + minutes : minutes;
			var strTime = hours + ':' + minutes + ' ' + ampm;
			return strTime;
		}
		// ==================================
		// add message
		// ==================================

		function addMessage(friendID, message) {
			var m;
			var user_id = localStorage.getItem("user_id");
			$.ajax({
				url: "http://localhost:8081/socialMedia/user",
				type: "POST",
				dataType: "json",
				contentType: 'application/json',
				data: JSON.stringify({ "idUser": parseInt(user_id), "idFriend": parseInt(friendID), "date": new Date(), "messageContent": message, "status": false }),
				success: function (data) {
					var m = data;

					$("#conversation").append('<li class="left clearfix"><span class="chat-img1 pull-right"> <img src="' + user.picture_URL + '" alt="' + user.username + '" class="img-circle"></span><div class="chat-body1 clearfix"><p style="background: #c7eafc none repeat scroll 0 0;border-radius: 5px;padding: 10px;overflow: hidden;color:rgb(142, 143, 167);">' + m.messageContent + '</p><div class="chat_time pull-left"><i class="fa fa-clock-o"></i>' + formatAMPM(new Date(m.date)) + '</div></div></li>');
					$(".chat_area").animate({ scrollTop: $("#conversation").height() }, 0);

				},
				error: function (data) {
					console.log(data);
				}
			});
		}

		// ==================================
		// GET LAST message
		// ==================================

		/*function getLastMessage(friendID) {
			var user_id = localStorage.getItem("user_id");

			$.ajax({
				url: "http://localhost:8081/socialMedia/user/lastMessage",
				type: "GET",
				dataType: "json",
				contentType: 'application/json',
				data: JSON.stringify({ "idUser": parseInt(user_id), "idFriend": parseInt(friendID) }),
				success: function (data) {
					var m = data;
					if (user.idUser == friendID) {
						$("#conversation").append('<li class="left clearfix"><span class="chat-img1 pull-left"> <img src="' + user.picture_URL + '" alt="' + user.username + '" class="img-circle"></span><div class="chat-body1 clearfix"><p style="background: #ffe6cb none repeat scroll 0 0;border-radius: 5px;padding: 10px;overflow: hidden;color:rgb(212, 147, 67);"> ' + m.messageContent + '</p><div class="chat_time pull-right"><i class="fa fa-clock-o"></i>' + formatAMPM(new Date(m.date)) + '</div></div></li>')
						$(".chat_area").animate({ scrollTop: $("#conversation").height() }, 0);
					}

				},
				error: function (data) {
					cpnsole.log(data);
				}
			})
		}*/

		// ==================================
		// Notification Messages
		// ==================================
		function getNotificationMessage() {
			var user_id = localStorage.getItem("user_id");
			$.ajax({
				url: "http://localhost:8081/socialMedia/user/" + user_id + "/notifications",
				type: "GET",
				dataType: "json",
				contentType: 'application/json',
				success: function (data) {
					var notification = data;
					var notificationSTR = "";
					for (var i = 0; i < notification.length; i++) {

						notificationSTR += '<li style="border-bottom: #8081/socialMedia80 solid 1px;padding: 12px;margin: 4px;box-shadow: 2px 2px 20px #8081/socialMedia80;background-color: #e6dcdc;"><img class="img-circle pull-left" height="50" width="50" src="' + notification[i].user.picture_URL + '" /><div class="pull-left" style="margin-left: 20px;"><strong>' + notification[i].user.username + '</strong><br/><small><em>' + notification[i].lastmessageContent + '</small></div><p class="pull-right">' + formatAMPM(new Date(notification[i].date)) + '</p><div class="clearfix"></div></li>';
					}
					$('#notification_message').html(notificationSTR);
					if (notification.length != 0) {
						$("#message_count").html(notification.length);
						$("#message_count").addClass("_count");
						$(".fa-comments").attr('style', 'color: cornflowerblue;');
					}

				},
				error: function (data) {
					console.log(data);
				}
			})
		}
		$(".message_toggle").on('click', function () {
			$("#message_count").removeClass("_count");
			$("#message_count").html("");
			$(".fa-comments").removeAttr('style');
		})

		// ==================================
		// Notification Invitations
		// ==================================
		function getInvitations() {
			var user_id = localStorage.getItem("user_id");
			$.ajax({
				url: "http://localhost:8081/socialMedia/user/" + user_id + "/invitations",
				type: "GET",
				dataType: "json",
				contentType: 'application/json',
				success: function (data) {
					var invitations = data;
					console.log(invitations);
					var STR = "";
					for (var i = 0; i < invitations.length; i++) {
						var userProposer = getUserById(invitations[i].idUser);

						STR += '<li style="border-bottom:  solid 1px;padding: 12px;margin: 4px;box-shadow: 2px 2px 20px ;background-color: #e6dcdc;"><img class="img-circle pull-left" height="50" width="50" src="' + userProposer.picture_URL + '" /><div class="pull-left" style="margin-left: 20px;"><strong>' + userProposer.username + '</strong></div><p class="pull-right"><i class="fa fa-check check" data-user-notification="' + userProposer.idUser + '" title="accept "></i><i class="fa fa-times delete" data-user-notification="' + userProposer.idUser + '" title="remove "></i></p><div class="clearfix"></div></li>';
					}
					$("#notification_").html(STR);
					if (invitations.length != 0) {
						$("#_count").html(invitations.length);
						$("#_count").addClass("_count");
						$(".fa-users").attr('style', 'color: cornflowerblue;');
					}

				},
				error: function (data) {
					console.log(data);
				}
			})
		}

		$("._toggle").on('click', function () {
			$("#_count").removeClass("_count");
			$("#_count").html("");
			$(".fa-users").removeAttr('style');
		})

		// ==================================
		// search friends
		// ==================================
		$("#inputSearch").on('keyup', function () {
			var query = $(this).val();
			if (query != '') {
				$.ajax({
					url: "http://localhost:8081/socialMedia/user",
					data: "string=" + query + "&idUser=" + parseInt(localStorage.getItem("user_id")),
					dataType: "json",
					type: "GET",
					success: function (data) {
						var users = data;
						$('#result').empty();
						$('#result').fadeIn();
						var resultSTR = "";
						for (var i = 0; i < users.length; i++) {
							resultSTR += '<li class="list-group-item" style="text-align:left;" ><div class="pull-left" ><img src="' + users[i].picture_URL + '" height=40 width=40 class="img-thumbnail"/>' + users[i].username + ' | <span class="text-muted">' + users[i].adresse + ' </span></div><div class="pull-right"><i class="fa fa-paper-plane send-invitation" title="send " data-invite=' + users[i].idUser + '></i></div><div class="clearfix"></div></li>';
						}
						$('#result').html(resultSTR);
					}
				})

			} else {
				$('#result').empty();
				$('#result').fadeOut();
			}


		});

		/*$('#inputSearch').on('blur', function () {
			$('#result').empty();
			$('#result').fadeOut();
		});*/

		// overlay
		$("body").on("click", "#result .send-invitation", function () {
			var friendIdInvite = $(this).data("invite");
			sendInvitation(parseInt(friendIdInvite));
			$('#result').empty();
			$('#result').fadeOut();
		});
		/* Open */
		function openNav() {
			$("#myNav").attr('style', 'height: 100%;');
		}

		/* Close */
		function closeNav() {
			$("#myNav").attr('style', 'height: 0%;');

			$('#inputSearch').val('');
			$('#result').empty();
		}

		$(".closebtn").on('click', function () {
			closeNav();
		});
		$("#open").on('click', function () {
			openNav();
		});
		// ==================================
		// invite Friend send-invitation
		// ==================================

		// you must add if friend delete send 
		function inviteFriend(friendID) {
			var user_id = localStorage.getItem("user_id");
			$.ajax({
				url: "http://localhost:8081/socialMedia/user/friends/invitation",
				type: "POST",
				data: JSON.stringify({ "idUser": parseInt(friendID), "idMembre": parseInt(user_id) }),
				dataType: "json",
				contentType: 'application/json',
				success: function (data) {
					$("body").append('<div class="modal fade" id="myModal" role="dialog"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-body"><p><i class="fa fa-check " style="font-size:18px;color:green;"></i> sended successfuly</p></div></div></div></div>');
					$('#myModal').modal('show');
				},
				error: function (data) {
					console.log(data);
				}
			});
		}

		// ==================================
		// accept and refuse 
		// ==================================
		function accept(friendID) {
			var user_id = localStorage.getItem("user_id");
			$.ajax({
				url: "http://localhost:8081/socialMedia/user/friends/decision?decision=accept",
				type: "PUT",
				data: JSON.stringify({ "idUser": parseInt(user_id), "idFriend": parseInt(friendID) }),
				dataType: "json",
				contentType: 'application/json',
				success: function (data) {

					getInvitations();
					$("#user_friends").append('<li data-user-id="' + data.idUser + '" class="left clearfix"><span class="chat-img pull-left"><img src="' + data.picture_URL + '" alt="' + data.username + '" class="img-circle"></span><div class="chat-body clearfix"><div class="header_sec"><strong class="username">' + data.username + '</strong> <strong class="pull-right"> 09:45AM</strong></div><div class="contact_sec"><strong class="primary-font">(123) 123-456</strong> <span class="badge pull-right">3</span></div></div></li>');
				},
				error: function (data) {
					console.log(data);
				}
			})
		}

		function refuse(friendID) {
			var user_id = localStorage.getItem("user_id");
			$.ajax({
				url: "http://localhost:8081/socialMedia/user/friends/decision?decision=refuse",
				type: "PUT",
				data: JSON.stringify({ "idUser": parseInt(user_id), "idFriend": parseInt(friendID) }),
				dataType: "json",
				contentType: 'application/json',
				success: function (data) {
					getInvitations();
				},
				error: function (data) {
					console.log(data);
				}
			});
		}

		$("body").on("click", ".check", function () {
			var friendChecked = $(this).data("user-notification");
			console.log("accept friend id : " + friendChecked);
			accept(friendChecked);
		});

		$("body").on("click", ".delete", function () {
			var friendRemoved = $(this).data("user-notification");
			console.log("delete friend id : " + friendRemoved);
			refuse(friendRemoved);
		});

	});