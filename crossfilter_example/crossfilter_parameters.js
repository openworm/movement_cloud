var XFILTER_PARAMS = {
    "display_fields": [
        {"data_field": "origin", "data_type": "string", "display_name": "Origin"},
        {"data_field": "destination", "data_type": "string", "display_name": "Destination"},
        {"data_field": "delay", "data_type": "numeric", "display_name": "Time of Day", "suffix": "μm", "bucket_width": 10},
        {"data_field": "distance", "data_type": "numeric", "display_name": "Arrival Delay (min.)", "suffix": "μm", "bucket_width": 50}
    ],

    "data_file": "worm_mock_data.csv",
    "report_title": "Worm Crossfilter Demonstration",

    "max_results": 15,
}