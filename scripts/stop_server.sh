cd /home/ec2-user/artoring-server
if [-f ./node_modules/pm2/bin/pm2-runtime]; then
  stop app.js
fi