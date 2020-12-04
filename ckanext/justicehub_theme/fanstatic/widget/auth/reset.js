$(document).ready(function(){
    const post_url = window.location.pathname + window.location.search;
    resetPasswordFormOnSubmit = function(){
        console.log("Reset form submitted");
        var $this = $(this);
        var password1 = $("#reset-password-one").val();
        var password2 = $("#reset-password-two").val();
        if (password1 && password2){
            var url = post_url;
            var data = {
                password1: password1,
                password2: password2
            };

            $.post(url, data, function(result_data){
                var result = JSON.parse(result_data);
                console.log(result);
                if (result.success){
                   console.log("Success");
                   window.location = "/"
                } else {
                    console.log("Error");
                    console.log(result.error.message);
                    $("#error-resetPasswordModal").html(result.error.message);
                }
            });
        }
        return false;
    };
});
