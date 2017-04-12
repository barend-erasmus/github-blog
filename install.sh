# -- BUILD AND INSTALL github-blog --

# Declare varibles
domain=$1

# Update machine package indexes
sudo apt-get update

# Download and run script to install node 7
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -

# Install node 7
apt-get install -y nodejs

# Install 'typescript' node package
npm install -g typescript

# Install 'gulp' node package
npm install -g gulp

# Clone 'github-blog' repository
git clone https://github.com/developersworkspace/github-blog.git

# Change directory to 'web'
cd ./github-blog

# Install node packages for 'web'
npm install

# Build 'web'
npm run build

# Build docker image
docker build --no-cache -t github_blog ./

# Run docker as deamon
docker run -d -p 3000:3000 -t github_blog

# -- INSTALL SSL CERT --

# Update machine package indexes
sudo apt-get update

# Open 443 port
sudo ufw allow 443/tcp

# Install Let's Encrypt cli
sudo apt-get install -y letsencrypt

# Obtain SSL CERT
sudo letsencrypt certonly --agree-tos --standalone --email developersworkspace@gmail.com -d "$1"

# -- INSTALL NGINX --

# Update machine package indexes
sudo apt-get update

# Install NGINX
sudo apt-get install -y nginx

# Add rule to firewall
sudo ufw allow 'Nginx HTTP'

# Download nginx.conf to NGINX directory
curl -o /etc/nginx/nginx.conf https://raw.githubusercontent.com/developersworkspace/github-blog/master/nginx.conf

# Replace domain
sed -i -- "s/yourdomain.com/$domain/g" /etc/nginx/nginx.conf

# Restart NGINX
systemctl restart nginx
