var XFILTER_PARAMS = {

    "user_fields": [
        {"field": "delay", "display_name": "Time of Day", "format": ""},
        {"field": "distance", "display_name": "Arrival Delay (min.)", "format": ""}
    ],
    "display_fields": [
        {"data_field": "origin", "data_type": "string", "display_name": "Origin"},
        {"data_field": "destination", "data_type": "string", "display_name": "Destination"},
        {"data_field": "delay", "data_type": "numeric", "display_name": "Time of Day", "suffix": "μm", "bucket_width": 10},
        {"data_field": "distance", "data_type": "numeric", "display_name": "Arrival Delay (min.)", "suffix": "μm", "bucket_width": 50}
    ],

    "data_file": "worm_mock_data.csv",
    "report_title": "Worm Crossfilter Demonstration",

    "format1": "",
    "format2": "",


    "footer_text": "A demonstration of animated bubble charts in JavaScript and D3.js",
    "width": 940,
    "height": 700,
    "force_strength": 0.03,
    "force_type": "charge",
    "radius_field": "Population",
    "numeric_fields": ["Area", "Population", "Density"],
    "fill_color": {
        "data_field": "Density Level",
        "color_groups": {
            "low": "#d84b2a",
            "medium": "#beccae",
            "high": "#7aa25c"
        }
    }
}