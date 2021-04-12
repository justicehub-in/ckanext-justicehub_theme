$(document).ready(function () {
  signupFormOnSubmit = function () {
    console.log('Signup form submitted');
    $('.input-error').remove();
    var $this = $(this);
    var fullname = $('#signup-fullname').val();
    var email = $('#signup-email').val();
    var username = $('#signup-username').val();
    var password = $('#signup-password').val();

    if(!$("#signup-form")[0].checkValidity()) {
        $("#signup-form")[0].reportValidity();
        console.log('Form validation failed');
        return false;
    }

    if (password && email) {
      var url = '/user/register_email';
      var data = {
        fullname: fullname,
        email: email,
        name: username,
        password: password
      };

      $.post(url, data, function (result_data) {
        var result = JSON.parse(result_data);
        console.log(result);
        if (result.success) {
          console.log('Success');
          console.log(result);
          window.location = '/dashboard';
        } else {
          console.log('Error');
          console.log(result.error.message);
          $("#error-signupModal").html(result.error.message);
        }
      });
    }
    return false;
  };
});
