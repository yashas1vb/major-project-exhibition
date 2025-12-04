import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if user exists with same email
                const email = profile.emails?.[0]?.value;
                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        // Link google account
                        user.googleId = profile.id;
                        if (!user.avatarUrl) user.avatarUrl = profile.photos?.[0]?.value;
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user
                // Generate a username from name or email
                let username = profile.displayName.replace(/\s+/g, '').toLowerCase();
                // Ensure username is unique (simple retry logic or append random)
                // For simplicity, appending random string
                const randomSuffix = Math.floor(Math.random() * 10000);
                username = `${username}${randomSuffix}`;

                user = await User.create({
                    googleId: profile.id,
                    username: username,
                    email: email,
                    avatarUrl: profile.photos?.[0]?.value,
                });

                done(null, user);
            } catch (error) {
                done(error, undefined);
            }
        }
    )
);

// Serialize/Deserialize (not strictly needed for JWT but good for session if used)
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
