FROM php:8.4-fpm

# Argumentos para o usuário
ARG user=Rian
ARG uid=1000

# Instala dependências do sistema/
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Instala extensões PHP necessárias para o Laravel + PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip

# Instala o Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Cria usuário do sistema para rodar comandos do Composer e Artisan
RUN useradd -G www-data,root -u $uid -d /home/$user $user \
    && mkdir -p /home/$user/.composer \
    && chown -R $user:$user /home/$user

# Define diretório de trabalho
WORKDIR /var/www

# Copia os arquivos do projeto
COPY . /var/www

# Ajusta permissões
RUN chown -R $user:$user /var/www

USER $user

# Instala dependências do Composer
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

EXPOSE 9000

CMD ["php-fpm"]
