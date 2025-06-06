const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// LOGIN ADMIN
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if there's already an admin in the database
    const existingAdmin = await Admin.findOne();

    // If no admin exists, register the first user as super admin
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({
        email,
        password: hashedPassword,
        isSuperAdmin: true,  // First registered user becomes super admin
      });
      await newAdmin.save();

      const token = jwt.sign({ email, role: 'admin', isSuperAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, message: "First admin registered successfully" });
    }

    // If an admin exists, allow only the first admin (super admin) to log in
    if (existingAdmin.email !== email) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If admin found, verify password
    const isMatch = await bcrypt.compare(password, existingAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If password matches, send JWT token
    const token = jwt.sign({ email, role: 'admin', isSuperAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: "Login successful" });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE ADMIN (WITH CURRENT PASSWORD CONFIRMATION)
const updateAdmin = async (req, res) => {
  const { currentEmail, currentPassword, newEmail, newPassword } = req.body;

  try {
    // Authenticate with token first (validate JWT)
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Access Denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin' || !decoded.isSuperAdmin) {
      return res.status(403).json({ message: "Forbidden: Not an admin or not super admin" });
    }

    // Current password verification
    const admin = await Admin.findOne({ email: currentEmail });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    if (newEmail) admin.email = newEmail;
    if (newPassword) admin.password = await bcrypt.hash(newPassword, 10);

    await admin.save();
    res.json({ message: "Admin updated successfully" });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { loginAdmin, updateAdmin };
