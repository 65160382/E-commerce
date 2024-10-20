const express = require('express');
const router = express.Router();
const db = require('../config/database');

//แสดงข้อมูลในหน้าแรกของเว็บ
router.get('/',(req,res)=>{
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Server Error');
            return;
        }
        res.render('index', { products: results }  );
    });
});

//ค้นหาข้อมูลสินค้าที่ต้องการ
router.get('/search', (req, res) => {
    const searchQuery = req.query.search;
    db.query('SELECT * FROM products WHERE name LIKE ?', [`%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Server Error');
            return;
        }
        res.render('index', { products: results });
    });
});

// เส้นทางสำหรับแสดงรายละเอียดสินค้า
router.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    db.query('SELECT * FROM products WHERE Product_id = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error fetching product details:', err);
            res.status(500).send('Server Error');
            return;
        }
        res.render('product', { product: result[0] });
    });
});


router.post('/chart', (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User not logged in' });
    }

    const { productId, quantity } = req.body;

    db.query('SELECT * FROM products WHERE Product_id = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error fetching product details:', err);
            res.status(500).send('Server Error');
            return;
        }

        if (result.length > 0) {
            const product = result[0];
            const totalPrice = parseInt(product.price) * quantity;

            const products = [Object.assign({}, product, { quantity: quantity })];

            res.render('chart', { 
                products: products, 
                totalPrice: totalPrice, 
                customer_id: userId, // ส่งค่า customer_id ไป
                product_id: productId
            });
        } else {
            res.status(404).send('Product not found');
        }
    });
});



//แสดงหน้า login
router.get('/login',(req,res)=>{
    res.render('login')
});

// บันทึกผู้ใช้ที่ login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query ฐานข้อมูลเพื่อตรวจสอบผู้ใช้
    db.query('SELECT * FROM register WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).send('Server Error');
            return;
        }
        
        if (results.length > 0) {
            const user = results[0];

            // ตรวจสอบรหัสผ่าน
            if (password === user.password) {
                // บันทึกข้อมูลผู้ใช้ใน session
                req.session.user = {
                    id: user.Customer_id, // เพิ่ม customer_id เข้าไป
                    username: user.username,
                };
                // เปลี่ยนเส้นทางไปยังหน้าแรก
                res.redirect('/');
            } else {
                res.status(401).send('Invalid username or password');
            }
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});


//logout เพื่อล้าง session 
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout Error');
        }
        res.clearCookie('connect.sid'); // ลบ cookie ที่เก็บ session ID
        res.redirect('/');
    });
});

router.get('/register',(req,res)=>{
    res.render('register')
});

//บันทึกข้อมูลการลงทะเบียน
router.post('/register',(req,res)=>{

    const { username, password, firstname, lastname, email, phone } = req.body;

    // Insert into customer table
    const customerSql = 'INSERT INTO customer (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)';
    db.query(customerSql, [firstname, lastname, email, phone], (err, result) => {
        if (err) throw err;

        const customerId = result.insertId;

        // Insert into register table with registration_date
        const registerSql = 'INSERT INTO register (username, password, customer_id, regis_date) VALUES (?, ?, ?, NOW())';
        db.query(registerSql, [username, password, customerId], (err, result) => {
            if (err) throw err;
            res.redirect('/login');
        });
    });
});

router.get('/addproduct',(req,res)=>{
    res.render('addproduct')
});

//เพิ่มสินค้าลงหน้าเว็บ
router.post('/addproduct',(req,res)=>{
    const { name, price, description, image, stock } = req.body;

    const sql = "INSERT INTO products (name, price, description, image, stock) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, price, description, image, stock], (err, result) => {
        if (err) {
        console.error("Error inserting product:", err);
        return res.status(500).json({ error: err.toString() });
        }
        res.status(201).json({
        message: "Product added successfully",
        productId: result.insertId,
        });
    });
});

//บันทึกข้อมูลคำสั่งซื้อลงตาราง order
router.post('/order', (req, res) => {
    const customer_id = req.session.user.id;
    const { product_id, quantity, payment_id, status } = req.body;

    if (!product_id) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const sql = 'INSERT INTO `order` (customer_id, product_id, order_date, quantity, payment_id, status) VALUES (?, ?, NOW(), ?, ?, ?)';
    db.query(sql, [customer_id, product_id, quantity, payment_id, status], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

    // อัพเดต stock ของสินค้าที่ถูกสั่งซื้อ
    const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE product_id = ?';
    db.query(updateStockSql, [quantity, product_id], (err, updateResult) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect(`/success?orderId=${result.insertId}`);      
        });

    });
});

router.get('/success',(req,res)=>{
    const orderId = req.query.orderId;
    res.render('success', { orderNumber: orderId });
})

module.exports = router 