var CROSSFILTER_PARAMETERS = {
    "field1": "Time of Day",
    "field2": "Arrival Delay (min.)",
    "data_file": "worm_mock_data.csv",
    "report_title": "Worm Crossfilter Demonstration",


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