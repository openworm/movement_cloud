var XFILTER_PARAMS = {
    "report_title": "Open Worm Movement Database: Crossfilter of Results",
    "data_file": "worm_mock_data.csv",
    "display_fields": {
        "datetime": {
            "data_field": "datetime",
            "data_type": "string",
            "display_name": "Date / Time",
            "suffix": "",
            "bucket_width": 1
        },
        "origin": {
            "data_field": "origin",
            "data_type": "string",
            "display_name": "Strain"
        },
        "destination": {
            "data_field": "destination",
            "data_type": "string",
            "display_name": "Allele"
        },
        "delay": {
            "data_field": "delay",
            "data_type": "numeric",
            "display_name": "Worm Length (μm)",
            "suffix": "μm",
            "bucket_width": 10
        },
        "distance": {
            "data_field": "distance",
            "data_type": "numeric",
            "display_name": "Distance (μm)",
            "suffix": "μm",
            "bucket_width": 50
        }
    },
    "hour": "d.datetime.getHours() + d.datetime.getMinutes() / 60",
    "charts": [
        "datetime",
        "delay",
        "distance",
        "datetime"
    ],
    "results_display": [
        "datetime",
        "origin",
        "destination",
        "delay",
        "distance"
    ],
    "max_results": 15,
    "radio_buttons": "dates"
}