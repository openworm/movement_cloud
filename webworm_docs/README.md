### Restarting the server

First use `htop` to identify the server process (say `1234`), `sudo kill 1234` to kill it, then run (as `ubuntu`):

    nohup sudo python3 manage.py runserver 0.0.0.0:80 &

### Running migrations

    python3 manage.py migrate auth --database=mrc_db4_link_for_django
    python3 manage.py migrate --database=mrc_db4_link_for_django
    python3 manage.py migrate --fake webworm --database=mrc_db4_link_for_django
    # We use “fake” to deal with “Alleles” migration nonsense

### Troubleshooting migrations

See this issue: https://github.com/openworm/movement_cloud/issues/21
