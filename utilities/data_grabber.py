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
    DATE_FORMAT(experiments_full.date, '%Y%m%d%H%i') AS `timestamp`,  -- e.g. "200101301359"  (30 Jan 2001, 13:59)
    CONVERT(DATE_FORMAT(experiments_full.date, '%H'), DECIMAL(10,6)) + CONVERT(DATE_FORMAT(experiments_full.date, '%i'), DECIMAL(10,6)) / 60.0 AS `hour`,  -- e.g. 13.5  (1:30pm)
    DATE_FORMAT(experiments_full.date, '%Y-%m-%d') AS `iso_date`, -- e.g. "2001-01-30"
    DATE_FORMAT(experiments_full.date, '%M %D, %Y') AS `pretty_date`, -- e.g. "January 30, 2001"
    DATE_FORMAT(experiments_full.date, '%H:%m') AS `pretty_time`, -- e.g. "13:58"
    DATE_FORMAT(experiments_full.date, '%w') AS `day_of_week`,  -- 0 = Sunday, 6 = Saturday
    `length` AS `worm_length`,
    path_range,
    experiments_full.strain AS `strain`,
    experiments_full.allele AS `allele`
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
