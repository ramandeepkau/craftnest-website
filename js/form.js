document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var endpoint = form.getAttribute('action');
  var submitBtn = form.querySelector('button[type="submit"]');
  var statusEl = document.getElementById('formStatus');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }
    showMessage('Sending your message...', 'success');

    var formData = new FormData(form);

    fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function (res) {
      if (res.ok) {
        form.reset();
        showMessage('Message sent — thank you!', 'success');
      } else {
        res.json().then(function (data) {
          var msg = 'Failed to send. Please check the form settings.';
          if (data && data.error) msg = data.error;
          showMessage(msg, 'error');
        }).catch(function () {
          showMessage('Failed to send. Please check the form endpoint.', 'error');
        });
      }
    }).catch(function () {
      showMessage('Network error — check your form endpoint.', 'error');
    }).finally(function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  });

  function showMessage(text, type) {
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = 'form-status is-visible ' + type;
    }

    // Also announce to screen readers via an ARIA live region if present
    var live = document.getElementById('ariaLive');
    if (live) live.textContent = text;

    if (statusEl && type === 'success') {
      setTimeout(function () {
        statusEl.className = 'form-status';
        statusEl.textContent = '';
      }, 5000);
    }
  }

  // (copy button removed) 
});
