if [-f /home/ec2-user/artoring-server/app.js]; then
  cd /home/ec2-user/artoring-server

  rm -rf node_modules

  pm2 delete app.js
fi