if [-f /home/ec2-user/artoring-server/app.js]; then
  cd /home/ec2-user/artoring-server
  npx pm2 stop app.js

  rm -rf node_modules
fi