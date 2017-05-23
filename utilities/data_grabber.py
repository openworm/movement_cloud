# -*- coding: utf-8 -*-
"""
An example script showing how to obtain a CSV file's worth of data from 
the remote MySQL server.  This script can be run from your local machine.

Ask @MichaelCurrie or @CheeLee for the real password for this user.

"""
import mysql.connector as sql
import pandas as pd

sql_query_string ="""
    SELECT /*experiments_full.id,*/
           DATE_FORMAT(experiments_full.date, '%c%d%H%i') AS `date`,
           `length`,
           path_range,
           experiments_full.strain,
           experiments_full.allele
    FROM experiments_full
    LEFT OUTER JOIN features_means
        ON features_means.experiment_id = experiments_full.id
    WHERE
        `length`   IS NOT NULL AND
        path_range IS NOT NULL
    ORDER BY DATE_FORMAT(experiments_full.date, '%c%d%H%i')
    """

db_connection = sql.connect(host='movement.openworm.org', database='mrc_db4',
                            user='mysql_remote_user', password='XXX')
db_cursor = db_connection.cursor()
db_cursor.execute(sql_query_string)

table_rows = db_cursor.fetchall()

df = pd.DataFrame(table_rows)
df.columns = db_cursor.column_names

df.to_csv('mock_worm_data.csv', index=False)

db_connection.close()
