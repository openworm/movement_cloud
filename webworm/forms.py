from django import forms

class SearchForm(forms.Form):
    search_name = forms.CharField(label='Search Experiment Name', max_length=100, required=False);
    exact_match = forms.BooleanField(label='Exact Match', required=False);
    case_sensitive = forms.BooleanField(label='Case Sensitive', required=False);
    start_date = forms.DateField(label='Start Date', required=False);
    end_date = forms.DateField(label='End Date', required=False);
