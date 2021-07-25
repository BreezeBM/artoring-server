if [-f /home/ec2-user/artoring-server/app.js]; then
  cd /home/ec2-user/artoring-server
  ./node_modules/pm2/bin/pm2-runtime stop app.js
fi