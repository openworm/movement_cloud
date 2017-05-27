var XFILTER_PARAMS = {
    "report_title": "Open Worm Movement Database: Crossfilter of Results",

    "data_file": "worm_mock_data.csv",
    "display_fields": [
        {"data_field": "origin", "data_type": "string", "display_name": "Origin"},
        {"data_field": "destination", "data_type": "string", "display_name": "Destination"},
        {"data_field": "delay", "data_type": "numeric", "display_name": "Time of Day", "suffix": "μm", "bucket_width": 10},
        {"data_field": "distance", "data_type": "numeric", "display_name": "Arrival Delay (min.)", "suffix": "μm", "bucket_width": 50}
    ],
    "extra": {"data_field": "datetime", "data_type": "string", "display_name": "Date", "suffix": "", "bucket_width": 1},

    "hour": "d.datetime.getHours() + d.datetime.getMinutes() / 60",

    "charts": ["hour", "delay", "distance", "date"],
    "results_display": ["time", "origin", "destination", "delay", "distance"],
    "max_results": 15,
    "radio_buttons": "dates",

    "worm_petri_dish": {
        "width": 500,
        "height": 400,
        "MAX_WORMS_VISUALIZED": 15,
        "m": 12
    }
}