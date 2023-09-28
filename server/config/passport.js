const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

const callback =
  process.env.NODE_ENV === 'production'
    ? 'https://research-gpt-client.onrender.com/api/auth/google/callback'
    : '/api/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callback,
    },
    findOrCreate
  )
);

async function findOrCreate(accessToken, refreshToken, profile, done) {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.findOneAndUpdate(
        { email: profile.emails[0].value },
        { googleId: profile.id }
      );
    }

    if (user) {
      done(null, user);
    } else {
      const newUser = await new User({
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        googleId: profile.id,
      });
      await newUser.save();
      done(null, newUser);
    }
  } catch (err) {
    done(err, null);
  }
}

module.exports = passport;

/**
 * Majority of code written by team. Some copied from passport documentation.
 * Helped with understanding:
 * - https://www.passportjs.org/packages/passport-google-oauth20/
 * - https://www.youtube.com/playlist?list=PL4cUxeGkcC9jdm7QX143aMLAqyM-jTZ2x
 * - Mongoose docs
 * - ChatGPT
 */
