import { AdminModel } from '../core/schemas';

export default (username, password, validPassword, role = 2) => {
  if (password != validPassword) {
    console.log('两次输入密码不一致')
    process.exit()
    return
  }

  AdminModel.findOne({ username })
    .then(adminUser => {
      if (adminUser) {
        console.log('用户已存在');
        process.exit()
        return
      }
      let admin = new AdminModel({username, password, role })
      admin.save()
      .then(newAdmin => {
        process.exit()
      })
      .catch(err => {
        process.exit()
      })
    });
}