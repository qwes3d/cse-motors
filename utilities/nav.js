// Sample navigation builder
function getNav() {
  return `
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/inventory">Inventory</a></li>
      <li><a href="/account/login">My Account</a></li>
    </ul>
  `;
}

module.exports = getNav;
