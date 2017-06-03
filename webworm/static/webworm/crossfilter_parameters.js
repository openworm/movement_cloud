var XFILTER_PARAMS = {
    "report_title": "OpenWorm Movement Database: [EXAMPLE] Crossfilter of Results",
    "data_file": dataFilePath,
    "num_display_fields": 4,
    "data_fields": {
        "timestamp": {
            "data_type": "string",
            "display_name": "Date / Time",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 1
        },
        "hour": {
            "data_type": "numeric",
            "display_name": "Hour in the day",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 10,
            "domain": [0, 24],
            "rangeRound": [0, 240]
        },
        "iso_date": {
            "data_type": "iso_date",
            "display_name": "Experiment Date",
            "suffix": "",
            "scale": "time",
            "bucket_width": 1,
            "rangeRound": [0, 900]
        },
        "pretty_date": {
            "data_type": "string",
            "display_name": "Full Date",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 1
        },
        "pretty_time": {
            "data_type": "string",
            "display_name": "Time of Day",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 1
        },
        "day_of_week": {
            "data_type": "numeric",
            "display_name": "Day of the week",
            "suffix": "",
            "scale": "linear",
            "bucket_width": 1
        },
        "worm_length": {
            "data_type": "numeric",
            "display_name": "Worm Length (μm)",
            "suffix": "μm",
            "scale": "linear",
            "bucket_width": 1,
            "rangeRound": [0, 210],
            "stratify": 10
        },
        "path_range": {
            "data_type": "numeric",
            "display_name": "Path Range (μm)",
            "suffix": "μm",
            "scale": "linear",
            "bucket_width": 5,
            "rangeRound": [0, 400],
            "stratify": 50
        },
        "strain": {
            "data_type": "string",
            "display_name": "Strain"
        },
        "allele": {
            "data_type": "string",
            "display_name": "Allele"
        }
    },
    "charts": [
	"iso_date",
        "hour",
        "worm_length",
        "path_range",
    ],
    "results_display": [
        "pretty_time",
        "strain",
        "allele",
        "worm_length",
        "path_range"
    ],
    "max_results": 15,
    "datasetview_chart_index": 3,
    "radio_button_grouping_field": "day_of_week",
}