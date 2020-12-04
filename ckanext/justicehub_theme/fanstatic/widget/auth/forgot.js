$(document).ready(function(){
    forgotPasswordFormOnSubmit = function() {
        var user = $("#forgot-password-user").val();
        $.post("/user/reset", {user: user}, function (result_data) {
            var result = JSON.parse(result_data);
            console.log(result);
            if (result.success) {
                console.log("Success");
                showModal("#feedbackModal");
            } else {
                console.log(result.error.message);
                $("#error-forgotPasswordModal").html(result.error.message);
            }
        });
        return false;
    };
});