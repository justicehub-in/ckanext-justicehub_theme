var activeModalId = false;
const USER_STATUSES = {
    "platform_login": "#loginModal",
    "platform_register": "#signupModal",
    "platform_forgot_password": "#forgotPasswordModal",
    "platform_logout": "",
    "platform_first_login": "",
    "platform_reset": "#resetPasswordModal",
    "platform_feedback": "#feedbackModal",
    "message_dataset_success": "#datasetFeedbackModal"
}


function showModal(id, elid, val) {
    $("#error-" + id.substring(1)).html("");
    let delay = 0; // Delay for transition between different modals
    if (activeModalId && activeModalId !== id) {
        $(activeModalId).modal('hide');
        delay = 250; // If something is hiding, then delay by 250ms before showing new one
    }
    activeModalId = id;
    setTimeout(() => {
      $(id).addClass('fade').modal('show');
      $(id).find("input[type!='button']:visible:first").focus();
    }, delay);
}

$(document).ready(function(){
    const current_step = $("#current_step").attr('state');

    // Show modal based on which step user is
    if (Object.keys(USER_STATUSES).includes(current_step)) {
        showModal(USER_STATUSES[current_step]);
    }
});