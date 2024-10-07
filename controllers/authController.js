const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'e_commerce'
});

// Render login page
exports.getLogin = (req, res) => {
    res.render('login');
};

// Render signup page
exports.getSignup = (req, res) => {
    res.render('signup');
};

// Handle signup
exports.postSignup = async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error during signup.');
        }
        res.redirect('/login');
    });
};

// Handle login
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error during login.');
        }
        if (results.length > 0) {
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                req.session.user = results[0];
                return res.redirect('/home');
            }
        }
        res.send('Invalid credentials.');
    });
};

// Render home page
exports.getHome = (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching products.');
        }
        results = results.map(product => ({
            ...product,
            price: parseFloat(product.price)
        }));
        res.render('home', { products: results });
    });
};

// Render About Us page
exports.getAbout = (req, res) => {
    res.render('about');
};

// Render Contact Us page
exports.getContact = (req, res) => {
    res.render('contact');
};

// Handle contact form submission
exports.postContact = (req, res) => {
    const { name, email, message } = req.body;
    db.query('INSERT INTO contact_us (name, email, message) VALUES (?, ?, ?)', [name, email, message], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error submitting contact form.');
        }
        return res.redirect('/contact');
    });
};

// Render cart page
exports.getCart = (req, res) => {
    const cartItems = req.session.cart || [];
    console.log(cartItems); // Debugging line
    res.render('cart', { cartItems });
};

// Handle adding a product to the cart
exports.postAddToCart = (req, res) => {
    const { productId, quantity } = req.body;

    // Fetch the product details from the database
    db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching product.');
        }

        if (results.length > 0) {
            const product = results[0];

            // Initialize the cart if it doesn't exist
            if (!req.session.cart) {
                req.session.cart = [];
            }

            // Add the product details to the cart, ensuring price is a float
            req.session.cart.push({
                id: product.id,
                name: product.name,
                image: product.image,
                price: parseFloat(product.price), // Ensure price is a float
                quantity: parseInt(quantity) // Store quantity as an integer
            });
        }

        // Redirect to the cart view
        res.redirect('/cart/view');
    });
};

// Handle removing a product from the cart
exports.postRemoveFromCart = (req, res) => {
    const { productId } = req.body;

    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.id !== productId);
    }

    res.redirect('/cart/view');
};

// Render Products page
exports.getProduct = (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching products.');
        }
        results = results.map(product => ({
            ...product,
            price: parseFloat(product.price)
        }));
        res.render('products', { products: results });
    });
};

// Handle adding a product
exports.postAddProduct = (req, res) => {
    const { name, price, image } = req.body;
    db.query('INSERT INTO products (name, price, image) VALUES (?, ?, ?)', [name, price, image], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding product.');
        }
        res.redirect('/products');
    });
};

// Handle updating a product
exports.postUpdateProduct = (req, res) => {
    const { id, name, price, image } = req.body;
    db.query('UPDATE products SET name = ?, price = ?, image = ? WHERE id = ?', [name, price, image, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating product.');
        }
        res.redirect('/products');
    });
};

// Handle deleting a product
exports.postDeleteProduct = (req, res) => {
    const { id } = req.body;
    db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting product.');
        }
        res.redirect('/products');
    });
};

// Handle logout
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};
