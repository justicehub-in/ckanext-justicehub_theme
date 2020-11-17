$(document).ready(function(){
    signupFormOnSubmit = function(){
        console.log("Signup form submitted");
        var $this = $(this);
        var fullname = $("#signup-fullname").val();
        var email = $("#signup-email").val();
        var password = $("#signup-password").val();
        if (email){
            var url = "/user/register_email";
            var data = {
                fullname: fullname,
                email: email,
                password: password
            };

            $.post(url, data, function(result_data){
                var result = JSON.parse(result_data);
                console.log(result);
                if (result.success){
                   console.log("Success");
                   console.log(result);
                } else {
                    console.log("Error");
                    console.log(result.error.message);
                }
            });
        }
        return false;
    };
});