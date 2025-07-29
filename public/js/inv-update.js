document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector("#updateForm");
  const submitBtn = form.querySelector("button[type='submit']");
  let formChanged = false;

  // Store initial form values
  const initialValues = {};
  Array.from(form.elements).forEach(element => {
    if (element.name) {
      initialValues[element.name] = element.value;
    }
  });

  // Enable submit button only when changes are detected
  form.addEventListener("change", function() {
    formChanged = Array.from(form.elements).some(element => {
      return element.name && element.value !== initialValues[element.name];
    });
    
    submitBtn.disabled = !formChanged;
  });

  // Additional check on input events for better responsiveness
  form.addEventListener("input", function() {
    formChanged = Array.from(form.elements).some(element => {
      return element.name && element.value !== initialValues[element.name];
    });
    submitBtn.disabled = !formChanged;
  });
});

// Function to handle form submission
// In inv-update.js
function checkFormChanges() {
  return Array.from(form.elements).some(element => {
    if (!element.name || element.disabled) return false;
    if (element.type === 'checkbox' || element.type === 'radio') {
      return element.checked !== initialCheckedState[element.name];
    }
    return element.value !== initialValues[element.name];
  });
}