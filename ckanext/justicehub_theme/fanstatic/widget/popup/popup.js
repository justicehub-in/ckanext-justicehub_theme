var activeModalId = false;

function showModal(id, elid, val) {
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