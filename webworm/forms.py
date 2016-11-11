from django import forms

class SearchForm(forms.Form):
    search_name = forms.CharField(label='Search Experiment Name', max_length=100, required=False);
    exact_match = forms.BooleanField(label='Exact Match', required=False);
    case_sensitive = forms.BooleanField(label='Case Sensitive', required=False);
    start_date = forms.DateField(label='Start Date', required=False);
    end_date = forms.DateField(label='End Date', required=False);
    strain = forms.CharField(label='Worm Strain', max_length=100, required=False);
    trackers = forms.CharField(label='Trackers', max_length=100, required=False);
    sex = forms.CharField(label='Sex', max_length=50, required=False);
    stage = forms.CharField(label='Stage', max_length=50, required=False);
    ventral = forms.CharField(label='Ventral Side', max_length=50, required=False);
    food = forms.CharField(label='Food', max_length=100, required=False);
    arena = forms.CharField(label='Arena', max_length=100, required=False);
    hab = forms.CharField(label='Habituation Time', max_length=50, required=False);
    staff = forms.CharField(label='Experimenter', max_length=100, required=False);
