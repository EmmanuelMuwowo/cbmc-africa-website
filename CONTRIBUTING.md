# Contributing to CBMC Africa Website

## Getting set up locally

1. **Install XAMPP** (or any PHP 8+ / MySQL setup) — https://www.apachefriends.org/
2. **Clone the repo:** 
git clone https://github.com/EmmanuelMuwowo/cbmc-africa-website.git


3. **Create the database** in phpMyAdmin (`http://localhost/phpmyadmin`):
- New database named `cbmc_africa`
- Import `database.sql` (Import tab)
4. **Set up your local config:**

cd cbmc-africa-website/public_html/api/includes
copy config.example.php config.php

Edit `config.php` with your local MySQL credentials (default XAMPP: user `root`, password empty).
5. **Run the server** from inside `public_html`:
cd ../..
C:\xampp\php\php.exe -S localhost:8080

6. **Create your admin account** by visiting `http://localhost:8080/setup/create-admin.php` once, then delete that `setup` folder locally (don't commit its removal unless it's actually being removed from the live site too).
Visit `http://localhost:8080/index.html` for the public site, `http://localhost:8080/admin/login.html` for the CMS.


## Making changes


- Create a branch for your work: `git checkout -b your-name/short-description`
- Commit your changes, push the branch, and open a Pull Request into `main` — don't push directly to `main`.
- `config.php` and anything in `public_html/uploads/` (other than `.gitkeep` files) are gitignored — never commit real credentials or uploaded files.

