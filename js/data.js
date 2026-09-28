/* ==========================================================================
   data.js
   Central product catalogue for Toy Haven.
   ========================================================================== */

const PRODUCTS = [
  { id: 1,  name: "Galaxy Ranger Action Figure", category: "figurines", price: 24.99, rating: 4.6, stock: true,  badge: "New",        image: "images/products/galaxy-ranger.jpg",     description: "A fully articulated 6-inch space ranger figure." },
  { id: 2,  name: "Iron Man Statue",             category: "figurines", price: 59.99, rating: 4.9, stock: true,  badge: "Bestseller", image: "images/products/ironman.png.webp",      description: "Hand-painted collectible figure." },
  { id: 3,  name: "Hulk Collectible",            category: "figurines", price: 44.50, rating: 4.4, stock: true,  badge: "",          image: "images/products/hulk.jpg",              description: "Detailed Hulk action figure with moveable joints." },
  { id: 4,  name: "Stitch Chibi Figure",         category: "figurines", price: 18.99, rating: 4.2, stock: false, badge: "",          image: "images/products/stitch.png.jpg",       description: "Adorable vinyl figure." },
  { id: 5,  name: "Superman Action Figure",      category: "figurines", price: 32.00, rating: 4.7, stock: true,  badge: "",          image: "images/products/superman.png.webp",     description: "Collectible Superman figure." },
  { id: 6,  name: "Trucker Vehicle Toy",         category: "toys",      price: 21.99, rating: 4.8, stock: true,  badge: "Bestseller", image: "images/products/trucker.jpg",           description: "Creative toy truck set." },
  { id: 7,  name: "Blue Bike Stunt Toy",         category: "toys",      price: 39.99, rating: 4.3, stock: true,  badge: "New",        image: "images/products/blue bike.jpg",         description: "All-terrain stunt bike." },
  { id: 8,  name: "Spider-Man Action Figure",    category: "toys",      price: 16.50, rating: 4.9, stock: true,  badge: "",          image: "images/products/spiderman.jpg.webp",    description: "Super-soft action figure." },
  { id: 9,  name: "Plush Dragon Toy",            category: "toys",      price: 8.99,  rating: 4.0, stock: true,  badge: "",          image: "images/products/glow-yoyo.jpg",         description: "Cute plush dragon for kids." },
  { id: 10, name: "Mickey Mouse Collectible",    category: "toys",      price: 12.99, rating: 4.1, stock: true,  badge: "",          image: "images/products/mickey.png.webp",       description: "Classic Mickey Mouse figure." },
  { id: 11, name: "Kingdom Quest Strategy Game", category: "boardgames", price: 34.99, rating: 4.7, stock: true,  badge: "Bestseller", image: "images/products/Labubu-The-Monsters-Fall-In-Wild-1.jpg", description: "A 2-5 player empire-building game." },
  { id: 12, name: "Buzz Lightyear Toy",          category: "boardgames",price: 19.99, rating: 4.5, stock: true,  badge: "",          image: "images/products/buzz.png.webp",         description: "Space ranger toy." },
  { id: 13, name: "Galactic Trade Routes",      category: "boardgames",price: 42.00, rating: 4.6, stock: true,  badge: "New",        image: "images/products/galactic-trade.jpg",    description: "A deep-space strategy board game." },
  { id: 14, name: "Dinosaur Toy Figurine",       category: "boardgames",price: 27.50, rating: 4.4, stock: false, badge: "",          image: "images/products/close-up-toy-white-background_1048944-3304475.jpg", description: "Detailed dinosaur figure." },
  { id: 15, name: "Gold Supercar Model",         category: "boardgames",price: 14.99, rating: 4.2, stock: true,  badge: "",          image: "images/products/dice-duel.jpg",         description: "Diecast sports car model." },
  { id: 16, name: "Airplane Diecast 1:18",       category: "diecast",   price: 49.99, rating: 4.8, stock: true,  badge: "Bestseller", image: "images/products/aero plane.jpg",        description: "1:18 scale model airplane." },
  { id: 17, name: "RC Helicopter Model",         category: "diecast",   price: 29.99, rating: 4.5, stock: true,  badge: "",          image: "images/products/helicopter rc.jpg",     description: "Replica model helicopter." },
  { id: 18, name: "Black Supercar Diecast",      category: "diecast",   price: 33.50, rating: 4.3, stock: true,  badge: "New",        image: "images/products/fire-truck.jpg",        description: "Detailed diecast car model." },
  { id: 19, name: "Red Bull F1 Racing Car",      category: "diecast",   price: 54.00, rating: 4.9, stock: true,  badge: "",          image: "images/products/redbull.jpg.avif",      description: "Premium F1 racing car replica." },
  { id: 20, name: "Vehicles Figure",        category: "figurines", price: 29.99, rating: 4.8, stock: true,  badge: "Bestseller", image: "images/products/batman.jpg",            description: "Detailed 1:12 scale Batman action figure." }
];

const CATEGORY_LABELS = {
  figurines: "Collectible Figurines",
  toys: "Toys",
  boardgames: "Board Games",
  diecast: "Diecast Model Cars"
};

const DELIVERY_FEE = 4.99;
const FREE_DELIVERY_THRESHOLD = 75;