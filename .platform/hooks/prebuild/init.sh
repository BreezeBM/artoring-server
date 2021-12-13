#!/bin/bash
# modules
if [[ ! -d "/home/webapp/dl.fedoraproject.org" ]]; then

  sudo wget -r --no-parent -A 'epel-release-*.rpm' http://dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/;
  sudo rpm -Uvh dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/epel-release-*.rpm;
  sudo yum-config-manager --enable epel*;
  sudo yum update -y --skip-broken;
  sudo yum install dpkg -y;
  sudo yum -y install fcgiwrap;
  sudo systemctl start fcgiwrap@nginx.socket;
  sudo systemctl enable fcgiwrap@nginx.socket;
  sudo yum -y install conntrack-tools;

  # letsEncrypt
  sudo yum install -y certbot python2-certbot-nginx;
  sudo yum install -y certbot-dns-route53;
  sudo certbot certonly --dns-route53 --dns-route53-propagation-seconds 30 -d *.${DOMAIN} --email ${EMAIL} -q --agree-tos;
  sudo ln -sf /etc/letsencrypt/live/${DOMAIN} /etc/letsencrypt/ebcert;

  # honeypot 파일
  sudo touch /etc/nginx/includes/honeypot.conf;
  sudo echo $"fastcgi_intercept_errors off;" >> /etc/nginx/includes/honeypot.conf;
  sudo echo $"include /etc/nginx/fastcgi_params;" >> /etc/nginx/includes/honeypot.conf;
  sudo echo $"fastcgi_param SCRIPT_FILENAME /usr/local/libexec/block-ip.cgi;" >> /etc/nginx/includes/honeypot.conf;
  sudo echo $"fastcgi_pass unix:/run/fcgiwrap/fcgiwrap-nginx.sock;" >> /etc/nginx/includes/honeypot.conf;

  # cgi 파일
  sudo touch /usr/local/libexec/block-ip.cgi;
  sudo echo $"#!/bin/bash" >> /usr/local/libexec/block-ip.cgi;
  sudo echo $"" >> /usr/local/libexec/block-ip.cgi;
  sudo echo $"echo \"Status: 410 Gone\"" >> /usr/local/libexec/block-ip.cgi;
  sudo echo $"echo \"Content-type: text/plain\"" >> /usr/local/libexec/block-ip.cgi;
  sudo echo $"echo" >> /usr/local/libexec/block-ip.cgi;
  sudo echo $"" >> /usr/local/libexec/block-ip.cgi;
  sudo echo $"echo \"Bye bye, \$REMOTE_ADDR!\"" >> /usr/local/libexec/block-ip.cgi;
  sudo echo $"sudo /usr/local/bin/block-ip.sh" >> /usr/local/libexec/block-ip.cgi;
  sudo echo $"" >> /usr/local/libexec/block-ip.cgi;
  sudo echo $"exit 0" >> /usr/local/libexec/block-ip.cgi;

  sudo chmod 0755 /usr/local/libexec/block-ip.cgi;

  # sh 파일
  sudo touch /usr/local/bin/block-ip.sh;
  sudo echo $"#!/bin/bash" >> /usr/local/bin/block-ip.sh;
  sudo echo $"" >> /usr/local/bin/block-ip.sh;
  sudo echo $"if [[ -z \${REMOTE_ADDR} ]]; then" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  if [[ -z \"\$1\"  ]]; then" >> /usr/local/bin/block-ip.sh;
  sudo echo $"    echo \"REMOTE_ADDR not set!\"" >> /usr/local/bin/block-ip.sh;
  sudo echo $"    exit 1" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  else" >> /usr/local/bin/block-ip.sh;
  sudo echo $"    REMOTE_ADDR=\$1" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  fi" >> /usr/local/bin/block-ip.sh;
  sudo echo $"fi" >> /usr/local/bin/block-ip.sh;
  sudo echo $"" >> /usr/local/bin/block-ip.sh;
  sudo echo $"# Put space separate list of trusted IP addresses, not to lock yourself out if you like to test the honeypot! \:\)" >> /usr/local/bin/block-ip.sh;
  sudo echo $"TRUSTED_IPS=(127.0.0.1)" >> /usr/local/bin/block-ip.sh;
  sudo echo $"if printf '%s\n' \${TRUSTED_IPS[@]} | grep -q -P \"^\$REMOTE_ADDR\\\$\"; then" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  echo \"Trusted IP\"" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  exit 0" >> /usr/local/bin/block-ip.sh;
  sudo echo $"fi" >> /usr/local/bin/block-ip.sh;
  sudo echo $"" >> /usr/local/bin/block-ip.sh;
  sudo echo $"if [[ \"\$REMOTE_ADDR\" != \"\${1#*[0-9].[0-9]}\" ]]; then" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  /sbin/ipset add honeypot4 \${REMOTE_ADDR}" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  /sbin/conntrack -D -s \${REMOTE_ADDR}" >> /usr/local/bin/block-ip.sh;
  sudo echo #"  echo "deny ${REMOTE_ADDR};" >> /etc/nginx/conf.d/blacklist.conf;" >>/usr/local/bin/block-ip.sh;
  sudo echo #"  nginx -s reload" >>/usr/local/bin/block-ip.sh;
  sudo echo $"elif [[ \"\$REMOTE_ADDR\" != \"\${1#*:[0-9a-fA-F]}\" ]]; then" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  /sbin/ipset add honeypot6 \${REMOTE_ADDR}" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  /sbin/conntrack -D -s \${REMOTE_ADDR}" >> /usr/local/bin/block-ip.sh;
  sudo echo #"  echo "deny ${REMOTE_ADDR};" >> /etc/nginx/conf.d/blacklist.conf;" >>/usr/local/bin/block-ip.sh;
  sudo echo #"  nginx -s reload" >>/usr/local/bin/block-ip.sh;
  sudo echo $"else" >> /usr/local/bin/block-ip.sh;
  sudo echo $"  echo \"Unrecognized Ip format '\$1'\"" >> /usr/local/bin/block-ip.sh;
  sudo echo $"fi" >> /usr/local/bin/block-ip.sh;

  sudo touch /etc/nginx/conf.d/blacklist.conf

  # nginx 권한
  sudo echo $"Defaults!/usr/local/bin/block-ip.sh env_keep=REMOTE_ADDR" >> /etc/sudoers.d/nginx-block-ip;
  sudo echo $"nginx ALL=(ALL) NOPASSWD: /usr/local/bin/block-ip.sh" >> /etc/sudoers.d/nginx-block-ip;

  sudo firewall-cmd --reload;

  sudo echo {\"type\": \"service_account\", \"project_id\": \"cultivated-cove-320001\",  \"private_key_id\": \"$CAPTCHA_KEY_ID\",     \"private_key\": \"$CAPTCHA_PEM\", \"client_email\": \"$CAPTCHA_EMAIL\",  \"client_id\": \"115405318409515778219\",     \"auth_uri\": \"https://accounts.google.com/o/oauth2/auth\",  \"token_uri\": \"https://oauth2.googleapis.com/token\",     \"auth_provider_x509_cert_url\": \"https://www.googleapis.com/oauth2/v1/certs\", \"client_x509_cert_url\":\" $CAPTCHA_X509\" } >> /home/ec2-user/credentials.json

  # elastic
  curl -L -O https://artifacts.elastic.co/downloads/beats/elastic-agent/elastic-agent-7.15.2-amd64.deb;
  sudo dpkg -i elastic-agent-7.15.2-amd64.deb;
  sudo rm elastic-agent-7.15.2-amd64.deb;
  sudo elastic-agent enroll --url=${FLEETURL} --enrollment-token=${FLEETTOKEN} -f && sudo systemctl enable elastic-agent && sudo systemctl start elastic-agent;
fi