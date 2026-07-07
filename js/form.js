document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var endpoint = form.getAttribute('action');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

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
      if (submitBtn) submitBtn.disabled = false;
    });
  });

  function showMessage(text, type) {
    var el = document.getElementById('formMessage');
    if (!el) {
      el = document.createElement('div');
      el.id = 'formMessage';
      el.style.position = 'fixed';
      el.style.right = '20px';
      el.style.bottom = '20px';
      el.style.padding = '12px 16px';
      el.style.borderRadius = '6px';
      el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
      el.style.zIndex = 9999;
      el.style.fontFamily = 'Poppins, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
      el.style.fontSize = '0.95rem';
      document.body.appendChild(el);
    }
    el.textContent = text;
    // Also announce to screen readers via an ARIA live region if present
    var live = document.getElementById('ariaLive');
    if (live) live.textContent = text;
    el.style.background = type === 'success' ? '#e6ffef' : '#fff0f0';
    el.style.color = type === 'success' ? '#056937' : '#7a0010';
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 5000);
  }

  // (copy button removed) 
});
