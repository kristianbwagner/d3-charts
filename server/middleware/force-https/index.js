module.exports = (req, res, next) => {
   if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS !== 'false') {
      const secureUrl = 'https://' + req.headers['host'] + req.url;
      res.redirect(secureUrl);
   } else {
      next();
   }
};
