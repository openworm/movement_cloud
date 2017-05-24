# Restarting the server

First use `htop` to identify the server process (say `1234`), `sudo kill 1234` to kill it, then run:

    nohup sudo python3 manage.py runserver 0.0.0.0:80 & (as ubuntu)
