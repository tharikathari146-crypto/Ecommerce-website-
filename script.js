const packages = [
  { id: 1, title: 'Bali Adventure Escape', days: 6, type: 'adventure', budget: 'mid', price: 1499, rating: 4.8, image: 'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=1200&q=80' },
  { id: 2, title: 'Paris Luxury Retreat', days: 5, type: 'luxury', budget: 'high', price: 2899, rating: 4.9, image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80' },
  { id: 3, title: 'Dubai Family Fun', days: 4, type: 'family', budget: 'mid', price: 1899, rating: 4.7, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' },
  { id: 4, title: 'Maldives Honeymoon Bliss', days: 7, type: 'honeymoon', budget: 'high', price: 3599, rating: 5.0, image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80' },
  { id: 5, title: 'Nepal Trekking Trails', days: 8, type: 'adventure', budget: 'low', price: 899, rating: 4.6, image: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1200&q=80' },
  { id: 6, title: 'Singapore Family Explorer', days: 5, type: 'family', budget: 'mid', price: 1699, rating: 4.7, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80' }
];

const byId = (id) => document.getElementById(id);
const packageGrid = byId('packageGrid');
const packageCount = byId('packageCount');
const tripSearchForm = byId('tripSearchForm');
const toast = byId('toast');
const authBtn = byId('authBtn');
const authModal = byId('authModal');
const authForm = byId('authForm');
const authTitle = byId('authTitle');
const authSubmit = byId('authSubmit');
const toggleMode = byId('toggleMode');
const nameField = byId('nameField');
const emailField = byId('emailField');
const passwordField = byId('passwordField');
const authState = byId('authState');
const themeToggle = byId('themeToggle');
const bookingModal = byId('bookingModal');
const bookingForm = byId('bookingForm');
const bookingPackage = byId('bookingPackage');
const bookingTotal = byId('bookingTotal');
const year = byId('year');
const savedTrips = byId('savedTrips');
const menuBtn = byId('menuBtn');
const navLinks = byId('navLinks');

let signupMode = false;
let selectedPackage = null;

function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function load(key, fallback) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
function getCurrentUser() { return load('roamlyCurrentUser', null); }

function showToast(message, ok = true) {
  toast.textContent = message;
  toast.style.background = ok ? '#0b8039' : '#b32534';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function updateAuthUI() {
  const user = getCurrentUser();
  authBtn.textContent = user ? `Hi, ${user.name.split(' ')[0]} (Logout)` : 'Login / Sign Up';
  authState.textContent = user ? `Logged in as ${user.email}` : 'Not logged in';
}

function renderSavedTrips() {
  const saved = load('roamlySavedTrips', []);
  savedTrips.innerHTML = saved.length ? saved.map((name) => `<li>${name}</li>`).join('') : '<li>No saved trips yet.</li>';
}

function renderPackages(list = packages) {
  packageGrid.innerHTML = list.map((pkg) => `
    <article class="package">
      <img src="${pkg.image}" alt="${pkg.title}" />
      <h3>${pkg.title}</h3>
      <p class="meta"><span>${pkg.days} days · ${pkg.type}</span><span>⭐ ${pkg.rating}</span></p>
      <p>Flights + hotels + transfers + guided tours included.</p>
      <div class="package-actions">
        <span class="price">$${pkg.price}</span>
        <div>
          <button class="btn btn-outline" data-save="${pkg.id}">♡</button>
          <button class="btn btn-primary" data-book="${pkg.id}">Book</button>
        </div>
      </div>
    </article>
  `).join('');
  packageCount.textContent = `${list.length} package(s)`;
}

tripSearchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const destination = byId('searchDestination').value.toLowerCase();
  const budget = byId('searchBudget').value;
  const type = byId('searchType').value;
  const sort = byId('searchSort').value;

  const filtered = packages.filter((pkg) => pkg.title.toLowerCase().includes(destination)
    && (budget === 'all' || pkg.budget === budget)
    && (type === 'all' || pkg.type === type));

  filtered.sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'rating-desc') return b.rating - a.rating;
    return b.rating - a.rating;
  });

  renderPackages(filtered);
  showToast(`${filtered.length} trip(s) found`);
  byId('packages').scrollIntoView({ behavior: 'smooth' });
});

packageGrid.addEventListener('click', (e) => {
  const saveBtn = e.target.closest('[data-save]');
  const bookBtn = e.target.closest('[data-book]');

  if (saveBtn) {
    const pkg = packages.find((x) => x.id === Number(saveBtn.dataset.save));
    const saved = load('roamlySavedTrips', []);
    if (!saved.includes(pkg.title)) saved.push(pkg.title);
    save('roamlySavedTrips', saved);
    renderSavedTrips();
    showToast('Trip saved to favorites');
    return;
  }

  if (!bookBtn) return;
  if (!getCurrentUser()) {
    showToast('Please login to book a package.', false);
    authModal.showModal();
    return;
  }

  selectedPackage = packages.find((pkg) => pkg.id === Number(bookBtn.dataset.book));
  bookingPackage.textContent = `${selectedPackage.title} • Base $${selectedPackage.price}`;
  bookingTotal.textContent = `Estimated total: $${selectedPackage.price * Number(byId('travelerCount').value)}`;
  bookingModal.showModal();
});

byId('travelerCount').addEventListener('input', () => {
  if (!selectedPackage) return;
  const count = Number(byId('travelerCount').value);
  bookingTotal.textContent = `Estimated total: $${selectedPackage.price * count}`;
});

authBtn.addEventListener('click', () => {
  if (getCurrentUser()) {
    localStorage.removeItem('roamlyCurrentUser');
    updateAuthUI();
    showToast('Logged out successfully');
  } else authModal.showModal();
});

toggleMode.addEventListener('click', () => {
  signupMode = !signupMode;
  authTitle.textContent = signupMode ? 'Sign Up' : 'Login';
  authSubmit.textContent = signupMode ? 'Create Account' : 'Login';
  toggleMode.textContent = signupMode ? 'Switch to Login' : 'Switch to Sign Up';
  nameField.required = signupMode;
  nameField.parentElement.style.display = signupMode ? 'grid' : 'none';
});

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const users = load('roamlyUsers', []);
  const email = emailField.value.trim().toLowerCase();
  const password = passwordField.value;

  if (signupMode) {
    if (users.some((u) => u.email === email)) return showToast('Account already exists.', false);
    const user = { name: nameField.value.trim(), email, password };
    users.push(user);
    save('roamlyUsers', users);
    save('roamlyCurrentUser', user);
    showToast('Account created and logged in!');
  } else {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return showToast('Invalid email or password.', false);
    save('roamlyCurrentUser', user);
    showToast('Login successful!');
  }

  authModal.close();
  authForm.reset();
  updateAuthUI();
});

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const promo = byId('promoCode').value.trim().toUpperCase();
  const travelers = Number(byId('travelerCount').value);
  const discount = promo === 'ROAM10' ? 0.9 : 1;
  const total = Math.round(selectedPackage.price * travelers * discount);

  const bookings = load('roamlyBookings', []);
  bookings.push({
    package: selectedPackage.title,
    travelers,
    date: byId('travelDate').value,
    user: getCurrentUser().email,
    promo,
    total,
  });
  save('roamlyBookings', bookings);
  bookingModal.close();
  bookingForm.reset();
  showToast(`Booking confirmed! Total: $${total}`);
});

byId('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = byId('newsletterEmail').value;
  const subscribers = load('roamlySubscribers', []);
  subscribers.push({ email, date: new Date().toISOString() });
  save('roamlySubscribers', subscribers);
  e.target.reset();
  showToast('Subscribed successfully!');
});

byId('plannerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const theme = byId('planTheme').value;
  const days = Number(byId('planDays').value);
  const items = Array.from({ length: days }, (_, i) => `<li>Day ${i + 1}: ${theme} activity + local dining + rest.</li>`).join('');
  byId('plannerOutput').innerHTML = `<h4>${days}-Day ${theme} Plan</h4><ul>${items}</ul>`;
  showToast('Itinerary generated!');
});

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  save('roamlyDarkMode', isDark);
});

menuBtn.addEventListener('click', () => navLinks.classList.toggle('show'));

(function init() {
  const darkMode = load('roamlyDarkMode', false);
  if (darkMode) {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }
  nameField.parentElement.style.display = 'none';
  renderPackages();
  renderSavedTrips();
  updateAuthUI();
  year.textContent = new Date().getFullYear();
})();
