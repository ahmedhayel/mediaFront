$(document).ready(function () {

	// sign in

	$('#signin').on('submit', function (e) {
		e.preventDefault();
		var form = $('#signin')[0];
		// Create an FormData object
		var datas = new FormData(form);

		// dans spring boot application mais dans apache il faut effacer le nom
		// de projet

		$.ajax({
			type: "POST",
			url: "http://localhost:8081/socialMedia/signIn_SignUp?action=signin",
			data: datas,
			cache: false,
			contentType: false,
			processData: false,
			dataType: 'json',
			success: function (data) {
				$('#signin')[0].reset();
				window.location = "chat.html?username=" + data.user.username;
				localStorage.setItem("user_id", data.user.idUser);
			}
		});

	});

	// sign up
	$('#signup').on('submit', function (e) {

		e.preventDefault();

		// dans spring boot application mais dans apache il faut effacer le nom
		// de projet http://localhost:8081/socialMedia/signIn_SignUp pour apache

		var form = $('#signup')[0];

		console.log(form);

		// Create an FormData object
		var datas = new FormData(form);

		var file = $('input[name="photo"]')[0].files[0];
		console.log(file.type);

		if (file.type.indexOf('image') == -1) {
			$(".error").show();
		} else {
			console.log("is image");

			$.ajax({
				type: "POST",
				url: "http://localhost:8081/socialMedia/signIn_SignUp?action=signup",
				data: datas,
				cache: false,
				crossDomain: true,
				contentType: false,
				processData: false,
				success: function (data) {
					$('#signup')[0].reset();
					$(".bg-success").show();
					$(".error").hide();
				}
			});
		}

	});

});