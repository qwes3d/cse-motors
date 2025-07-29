'use strict';

// Get the classification list dropdown
const classificationList = document.querySelector("#classificationList");

// Event listener for classification changes
classificationList.addEventListener("change", function() {
  const classification_id = classificationList.value;
  console.log(`classification_id is: ${classification_id}`);
  
  if (!classification_id) {
    document.getElementById("inventoryDisplay").innerHTML = "";
    return;
  }

  const classIdURL = `/inv/getInventory/${classification_id}`;
  
  fetch(classIdURL)
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      throw Error("Network response was not OK");
    })
    .then(function(data) {
      console.log(data);
      buildInventoryList(data);
    })
    .catch(function(error) {
      console.log('There was a problem: ', error.message);
      document.getElementById("inventoryDisplay").innerHTML = 
        '<p class="notice">Sorry, we could not load the inventory data.</p>';
    });
});



function buildInventoryList(data) {
  const container = document.getElementById("inventoryDisplay");
  container.innerHTML = "";

  if (!data || !data.length) {
    container.innerHTML = "<p>No vehicles found</p>";
    return;
  }

  let html = `
    <table class="inventory-table">
      <thead>
        <tr>
          <th>Year</th>
          <th>Make</th>
          <th>Model</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

  data.forEach(vehicle => {
    html += `
      <tr>
        <td>${vehicle.inv_year}</td>
        <td>${vehicle.inv_make}</td>
        <td>${vehicle.inv_model}</td>
        <td>$${vehicle.inv_price.toLocaleString()}</td>
        <td>
          <a href="/inv/edit/${vehicle.inv_id}" class="modify-btn">Modify</a>
          <a href="/inv/delete/${vehicle.inv_id}" class="delete-btn">Delete</a>
        </td>
      </tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}