# -*- coding: utf-8 -*-
import mysql.connector as sql
import pandas as pd

sql_query_string ="""
SELECT /*experiments_full.id,*/
       DATE_FORMAT(experiments_full.date, '%m%d%H%i') AS `date`,
       `length` AS `delay`,
       path_range AS `distance`,
       experiments_full.strain AS `origin`,
       experiments_full.allele AS `destination`
FROM experiments_full
LEFT OUTER JOIN features_means ON features_means.experiment_id = experiments_full.id
WHERE
    `length`   IS NOT NULL AND
    path_range IS NOT NULL
ORDER BY
    MONTH(experiments_full.date),
    DAY(experiments_full.date),
    HOUR(experiments_full.date),
    MINUTE(experiments_full.date);
"""

db_connection = sql.connect(host='movement.openworm.org', database='mrc_db4',
                            user='mysql_remote_user', password='XXX')
db_cursor = db_connection.cursor()
db_cursor.execute(sql_query_string)

table_rows = db_cursor.fetchall()

df = pd.DataFrame(table_rows)
df.columns = db_cursor.column_names

df.to_csv('worm_mock_data.csv', index=False)

db_connection.close()