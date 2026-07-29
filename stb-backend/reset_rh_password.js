const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  matricule: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['EMPLOYEE', 'RH', 'ADMIN'], default: 'EMPLOYEE' }
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://127.0.0.1:27017/stb_mobile')
  .then(async () => {
    console.log('Connected to DB');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    let rhUser = await User.findOne({ role: 'RH' });
    if (!rhUser) {
      rhUser = new User({
        matricule: 'RH001',
        nom: 'Admin',
        prenom: 'RH',
        role: 'RH',
        password: hashedPassword
      });
      await rhUser.save();
      console.log('Created new RH user RH001');
    } else {
      rhUser.password = hashedPassword;
      await rhUser.save();
      console.log('Reset password for existing RH user:', rhUser.matricule);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
