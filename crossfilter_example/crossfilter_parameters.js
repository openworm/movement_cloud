var XFILTER_PARAMS = {
    "report_title": "Open Worm Movement Database: Crossfilter of Results",
    "data_file": "worm_mock_data.csv",
    "display_fields": {
        "timestamp": {
            "data_field": "timestamp",
            "data_type": "string",
            "display_name": "Date / Time",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 1
        },
        "hour": {
            "data_field": "hour",
            "data_type": "numeric",
            "display_name": "Hour in the day",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 10,
            "domain": [0, 24],
            "rangeRound": [0, 240]
        },
        "iso_date": {
            "data_field": "iso_date",
            "data_type": "iso_date",
            "display_name": "Experiment Date",
            "suffix": "",
            "scale": "time",
            "bucket_width": 1,
            "rangeRound": [0, 900]
        },
        "pretty_date": {
            "data_field": "pretty_date",
            "data_type": "string",
            "display_name": "Full Date",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 1
        },
        "pretty_time": {
            "data_field": "pretty_time",
            "data_type": "string",
            "display_name": "Time of Day",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 1
        },
        "day_of_week": {
            "data_field": "day_of_week",
            "data_type": "numeric",
            "display_name": "Day of the week",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 1
        },
        "worm_length": {
            "data_field": "worm_length",
            "data_type": "numeric",
            "display_name": "Worm Length (μm)",
            "suffix": "μm",
            "scale": "linear",
            "bucket_width": 10,
            "rangeRound": [0, 210]
        },
        "path_range": {
            "data_field": "path_range",
            "data_type": "numeric",
            "display_name": "Path Range (μm)",
            "suffix": "μm",
            "scale": "linear",
            "bucket_width": 50,
            "rangeRound": [0, 400]
        },
        "strain": {
            "data_field": "strain",
            "data_type": "string",
            "display_name": "Strain"
        },
        "allele": {
            "data_field": "allele",
            "data_type": "string",
            "display_name": "Allele"
        }
    },
    "charts": [
        "hour",
        "worm_length",
        "path_range",
        "iso_date"
    ],
    "results_display": [
        "pretty_time",
        "strain",
        "allele",
        "worm_length",
        "path_range"
    ],
    "results_grouping_field": "iso_date",
    "results_grouping_display_field": "pretty_date",
    "max_results": 15,
    "radio_button_grouping_field": "day_of_week",
}