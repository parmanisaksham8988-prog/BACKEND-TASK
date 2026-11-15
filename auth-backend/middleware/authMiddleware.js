const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
try {
const authHeader = req.headers.authorization;

```
if (!authHeader) {
  return res.status(401).json({
    success: false,
    message: "Authorization token is required"
  });
}

if (!authHeader.startsWith("Bearer ")) {
  return res.status(401).json({
    success: false,
    message: "Invalid authorization format"
  });
}

const token = authHeader.split(" ")[1];

if (!token) {
  return res.status(401).json({
    success: false,
    message: "Invalid authorization format"
  });
}

const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET
);

// Find the user in MongoDB.
const user = await User.findById(decoded.id);

if (!user) {
  return res.status(401).json({
    success: false,
    message: "User not found. Please log in again."
  });
}

// Reject tokens created before the latest login.
if (
  typeof decoded.tokenVersion !== "number" ||
  decoded.tokenVersion !== user.tokenVersion
) {
  return res.status(401).json({
    success: false,
    message: "Session expired. Please log in again."
  });
}

req.user = {
  id: user._id,
  name: user.name,
  email: user.email
};

next();
```

} catch (error) {
console.error("Authentication error:", error.message);

```
return res.status(401).json({
  success: false,
  message: "Invalid or expired token"
});
```

}
};

module.exports = authMiddleware;
