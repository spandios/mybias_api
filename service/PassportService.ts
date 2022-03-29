import passport from 'passport';
import * as passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy;
import UserService from './UserService';
import { User } from '../entity/user/User';
class PassportService {
  constructor() {
    passport.use(
      new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
        },
        function (
          email: string,
          password: string,
          done: (error: any, user?: User, options?: any) => void,
        ) {
          //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
          return UserService.findByEmail(email)
            .then((user) => {
              if (!user) {
                return done('NotFoundUser', null, { message: 'Incorrect email or password.' });
              }

              if (user.validPassword(password)) {
                return done(null, user);
              } else {
                return done('Incorrect password.', null);
              }
            })
            .catch((err: any) => done(err));
        },
      ),
    );
  }
}

export default PassportService;
