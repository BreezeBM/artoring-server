if test -f /home/ec2-user/artoring-server/app.js;then
  cd /home/ec2-user/artoring-server

  if test -f /home/ec2-user/artoring-server/node_modules
    npm install
  fi
  npm run stop
fi