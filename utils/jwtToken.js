export const generatetoken = (user, message, statusCode, res) => {
    const token = user.getJWTToken();
    
    
    // Ensure COOKIE_EXPIRE is a valid number
    const COOKIE_EXPIRE = Number(process.env.COOKIE_EXPIRE) || 7;

    res.status(statusCode)
      .cookie("token", token, {
        expires: new Date(Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // ✅ Corrected parentheses
       
      })
      .json({ success: true, message, user, token });
};

