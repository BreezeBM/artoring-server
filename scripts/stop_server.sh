if test -f /home/ec2-user/artoring-server/app.js;then
  cd /home/ec2-user/artoring-server

  rm -rf node_modules

  npx pm2 delete app.js
fi