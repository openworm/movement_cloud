from django.shortcuts import render
from django.http import HttpResponse

from django.template.response import TemplateResponse

from .models import *
from .forms import *

# Create your views here.

def index(request):
    form = SearchForm();
    db_experiment_count = Experiments.objects.all().count();
    context = {'db_experiment_count': db_experiment_count, 'form':form }
    return render(request, 'webworm/index.html', context);

def tables(request):
    form = SearchForm();
    db_experiment_count = Experiments.objects.all().count();
    experiments_list = Experiments.objects.order_by('base_name');
    search_string = '';
    if request.method == "GET":
        # Sane defaults
        exact = False;
        case_sen = False;
        if 'exact_match' in request.GET:
            exact = request.GET['exact_match'];
        if 'case_sensitive' in request.GET:
            case_sen = request.GET['case_sensitive'];
        if 'search_name' in request.GET:
            search = request.GET['search_name'];
            if search:
                search_string = search_string + ' String:' + search;
                if exact == True and case_sen == True:
                    experiments_list = experiments_list.filter(base_name__exact=search);
                elif exact == True and case_sen == False:
                    experiments_list = experiments_list.filter(base_name__iexact=search);
                elif exact == False and case_sen == True:
                    experiments_list = experiments_list.filter(base_name__contains=search);
                else:
                    experiments_list = experiments_list.filter(base_name__icontains=search);
        if 'start_date' in request.GET:
            start = request.GET['start_date'];
            if start:
                search_string = search_string + ' Start:' + start;
                experiments_list = experiments_list.filter(date__gte=start);
        if 'end_date' in request.GET:
            end = request.GET['end_date'];
            if end:
                search_string = search_string + ' End:' + end;
                experiments_list = experiments_list.filter(date__lte=end);
                
    experiment_count = experiments_list.count();
    context = {'experiments_list': experiments_list, 
               'experiment_count': experiment_count,
               'db_experiment_count': db_experiment_count, 
               'search_string': search_string,
               'form':form }
    return render(request, 'webworm/tables.html', context);
