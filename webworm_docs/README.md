### Restarting the server

First use `htop` to identify the server process (say `1234`), `sudo kill 1234` to kill it, then run (as `ubuntu`):

    nohup sudo python3 manage.py runserver 0.0.0.0:80 &

### Running migrations

    python3 manage.py migrate --fake webworm
    # We use “fake” to deal with “Alleles” migration nonsense

### Troubleshooting migrations

See this issue: https://github.com/openworm/movement_cloud/issues/21

### How to change the DB schema if tracker commons is changed:

On dev server:
- tracker commons change metadata
- on aws server add column
- export schema with mysqldump
- run migrations on movement_cloud django
- commit migrations and schema
- promote to production

On prod server:
- copy database?
- pull from master

### Master branch vs. Dev branch

@cheelee: My thoughts on the master branch is that merges into it ought to be a per-release thing. So every time the development branch is good and stable enough for a release, we should do it. And where the development branch is concerned, it should get merged with branches with complete and coherent features. Debugging can happen on the development branch, but not actual work on features methinks.
