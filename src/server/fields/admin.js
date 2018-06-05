import {
  GraphQLString as str,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
} from 'graphql';
import shortid from 'shortid';
import {
  AdminModle
} from '../../core/schemas';
let count = 0;
class Admin {
  async register(root, params, context) {

    if (params.password != params.validPassword) {
      return new Error('password not valid');
    }

    let res = {};
    const registerPromise = new Promise((resolve, reject) => {
      AdminModle.findOne({ username: params.username }, (err, admin) => {
        if (err) reject(err);
        if (admin) reject(new Error('username is already registered'));

        const _id = shortid.generate();
        admin = new AdminModle({ _id, username: params.username, password: params.password, role: params.role });
        admin.save()
          .then(data => {
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
    await registerPromise
      .then(user => {
        res.username = user.username;
        res.message = 'registered successfully';
      })
      .catch(err => {
        if (err) {
          res = err;
        }
      });
    return res;
  }
  async login(root, params, ctx, ast) {

    if (ctx.session.admin) {
      res = new Error('Already logged in');
      return res;
    }

    let res = {}
    const authPromise = new Promise((resolve, reject) => {
      AdminModle.findOne({ username: params.username }, (err, admin) => {
        if (!admin) reject(new Error('user not exist'));
        admin.comparePassword(params.password, admin.password)
          .then(isMath => {
            if (!isMath) reject(new Error('username or password not match'));
            ctx.session.admin = {
              username: admin.username,
              role: admin.role,
            }
            ctx.body = {
              admin: {
                username: admin.username,
                role: admin.role,
              }
            }
            resolve(admin);
          })
          .catch(err => {
            reject(err);
          });
      })

    });
    await authPromise
      .then(data => {
        res.username = data.username;
        res.message = 'logined successfully';
      })
      .catch(err => {
        if (err) res = err;
      });

    return res;
  }
  async logout(root, params, ctx, ast) {
    if (!ctx.session.admin) return new Error('Not logged in');
    let res = { result: true };
    ctx.session = null;
    return res;
  }
}

const admin = new Admin();

export const adminRegister = {
  type: new GraphQLObjectType({
    name: 'adminRegister',
    fields: {
      _id: { type: str },
      username: { type: str },
      password: { type: str },
      role: { type: GraphQLInt },
      message: { type: str },
    }
  }),
  args: {
    username: { type: str },
    password: { type: str },
    validPassword: { type: str },
    role: { type: GraphQLInt },
  },
  resolve(root, params, options, ast) {
    const res = admin.register(...arguments);
    return res;
  }
}

export const adminLogin = {
  type: new GraphQLObjectType({
    name: 'adminLogin',
    fields: {
      username: { type: str },
      password: { type: str },
      message: { type: str }
    }
  }),
  args: {
    username: { type: str },
    password: { type: str },
  },
  resolve(root, params, ctx, ast) {
    const res = admin.login(...arguments);
    return res;
  }
}

export const adminLogout = {
  type: new GraphQLObjectType({
    name: 'loginout',
    fields: {
      result: { type: GraphQLBoolean }
    }
  }),
  resolve(root, params, ctx, ast) {
    const res = admin.logout(...arguments);
    return res;
  }
}