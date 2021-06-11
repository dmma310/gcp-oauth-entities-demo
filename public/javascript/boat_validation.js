// Disable form submissions if there are invalid fields.
// Allows custom message.
(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', event => {
          if (!form.checkValidity()) {
            event.preventDefault(); // Prevent default behavior (i.e. redirect)
            event.stopPropagation(); // Prevent propogating/bubbling up event
          }
  
          form.classList.add('was-validated');
        }, false)
      })
  })()