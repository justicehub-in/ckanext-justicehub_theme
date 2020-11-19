$(document).ready(function(){
    forgotPasswordFormOnSubmit = function() {
        var user = $("#forgot-password-user").val();
        $.post("/user/reset", {user: user}, function (result_data) {
            console.log(result);
            var result = JSON.parse(result_data);
            if (result.success) {
                console.log("Success");
            } else {
                console.log(result.error.message);
            }
        });
        return false;
    };
});