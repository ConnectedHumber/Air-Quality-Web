# Getting Started
To get started, there are 3 main steps:

1. Cloning & building the application
2. Configuring the application
3. Configuration a web server

The process is outlined in detail below.


## System Requirements
 - Git
 - Bash (if on Windows, try [Git Bash](https://gitforwindows.org/)) - the build script is written in Bash
 - PHP 7+ enabled web server
     - _Nginx_ + _PHP-FPM_ is recommended
     - Apache works too
 - MariaDB database with the appropriate table structure pre-loaded
 - Node.JS (preferably 10+) + [npm](https://npmjs.org/) 6+ (for installing & building the client-side app code)
 - [Node.JS](https://nodejs.org/)
 - [Composer](https://getcomposer.org/) (for installing server-side dependencies)
 - PHP modules:
     - `pdo-mysql` (for the database connection)
 - A [MariaDB](https://mariadb.com/) server with a database already setup with the schema data in it. Please get in contact with [ConnectedHumber](https://connectedhumber.org/) for information about the database schema and structure.


## Installation
1. Start by cloning this repository:

```bash
git clone https://github.com/ConnectedHumber/Air-Quality-Web.git
```


2. `cd` into the root of the cloned repository. Then install the dependencies (these are installed locally):

```bash
./build setup setup-dev
```


3. Build the client-side application:

```bash
# For development, run this:
./build client
# For production, run this:
NODE_ENV=production ./build client
# If you're actively working on the codebase and need to auto-recompile on every change, run this:
./build client-watch
```

4. Change the ownership to allow your web server user to access the created directory. Usually, the web server will be running under the `www-data` user:

```bash
sudo chown -R www-data:www-data path/to/Air-Quality-Web
```


5. Edit `data/settings.toml` to enter your database credentials.

You can edit other settings here too. See `settings.default.toml` for the settings you can change, but do **not** edit `settings.default.toml`! Edit `data/settings.toml` instead. You'll probably want to give the entire default settings file a careful read.


6. Configure your web server to serve the root of the repository you've cloned if you haven't already. Skip this step if you cloned the repository into a directory that your web server already serves.


7. Disallow public access to the private `data`  directory.

In Nginx:

```nginx
# Put this inside the "server {  }" website definition block:
# The "server {  }" block can usually be found somewhere in /etc/nginx on Linux machines, and may have a "server_name" directive specifying the domain name it's serving if multiple websites are configured.
location ^~ /path/to/data/directory {
    deny all;
}
```

In Apache:

```htaccess
# Create a file called ".htaccess" with this content inside the data/ directory
Require all denied
```


8. Test the application with an API call. If this returns valid JSON, then you've set it up correctly

```
http://example.com/path/to/Air-Quality-Web/api.php?action=list-devices
```


9. (Optional) Setup HTTPS:

```bash
sudo apt install certbot
# On Nginx:
sudo certbot --nginx --domain example.com
# On Apache:
sudo certbot --apache --domain example.com
```
