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

def summary(request):
    experiments_list = Experiments.objects.all();
    db_experiment_count = experiments_list.count();

    # Experiment does not make sense
    # Experiment date does not make sense ... though it might be nice to specify 
    #   the range of dates.

    # Strains
    strain_list = Strains.objects.order_by('name').values_list('name', flat=True).distinct();
    strain_counts = {};
    for element in strain_list:
        if element:
            strain_counts[element] = experiments_list.filter(strain__name__exact=element).count();
        else:
            strain_counts['None'] = experiments_list.filter(strain__name__exact=element).count();
    strain_counts = sorted(strain_counts.items());

    # Trackers
    trackers_list = Trackers.objects.order_by('name').values_list('name', flat=True).distinct();
    trackers_counts = {};
    for element in trackers_list:
        if element:
            trackers_counts[element] = experiments_list.filter(tracker__name__exact=element).count();
        else:
            trackers_counts['Unknown'] = experiments_list.filter(tracker__name__exact=element).count();
    trackers_counts = sorted(trackers_counts.items());

    # Sex - should we even need to have this field discoverable?
    sex_list = Sexes.objects.order_by('name').values_list('name', flat=True).distinct();
    sex_counts = {};
    for element in sex_list:
        if element:
            sex_counts[element] = experiments_list.filter(sex__name__exact=element).count();
        else:
            sex_counts['Unknown'] = experiments_list.filter(sex__name__exact=element).count();
    sex_counts = sorted(sex_counts.items());

    # Development Stages
    dev_stage_list = DevelopmentalStages.objects.order_by('name').values_list('name', flat=True).distinct();
    dev_stage_counts = {};
    for element in dev_stage_list:
        if element:
            dev_stage_counts[element] = experiments_list.filter(developmental_stage__name__exact=element).count();
        else:
            dev_stage_counts['None'] = experiments_list.filter(developmental_stage__name__exact=element).count();
    dev_stage_counts = sorted(dev_stage_counts.items());

    # Ventral Side - again, should we even need this?
    ventral_list = VentralSides.objects.order_by('name').values_list('name', flat=True).distinct();
    ventral_counts = {};
    for element in ventral_list:
        if element:
            ventral_counts[element] = experiments_list.filter(ventral_side__name__exact=element).count();
        else:
            ventral_counts['Unknown'] = experiments_list.filter(ventral_side__name__exact=element).count();
    ventral_counts = sorted(ventral_counts.items());

    # Food
    food_list = Foods.objects.order_by('name').values_list('name', flat=True).distinct();
    food_counts = {};
    for element in food_list:
        if element:
            food_counts[element] = experiments_list.filter(food__name__exact=element).count();
        else:
            food_counts['Unknown'] = experiments_list.filter(food__name__exact=element).count();
    food_counts = sorted(food_counts.items());

    # Arena - I'm assuming this has valid categories instead of being a free-form descriptor
    arena_list = Arenas.objects.order_by('name').values_list('name', flat=True).distinct();
    arena_counts = {};
    for element in arena_list:
        if element:
            arena_counts[element] = experiments_list.filter(arena__name__exact=element).count();
        else:
            arena_counts['None'] = experiments_list.filter(arena__name__exact=element).count();
    arena_counts = sorted(arena_counts.items());
    
    # Habituation really ought to be a time-based field
    habit_list = Habituations.objects.order_by('name').values_list('name', flat=True).distinct();
    habit_counts = {};
    for element in habit_list:
        if element:
            habit_counts[element] = experiments_list.filter(habituation__name__exact=element).count();
        else:
            habit_counts['Unknown'] = experiments_list.filter(habituation__name__exact=element).count();
    habit_counts = sorted(habit_counts.items());

    # Experimenter
    experimenter_list = Experimenters.objects.order_by('name').values_list('name', flat=True).distinct();
    experimenter_counts = {};
    for element in experimenter_list:
        if element:
            experimenter_counts[element] = experiments_list.filter(experimenter__name__exact=element).count();
        else:
            experimenter_counts['Unknown'] = experiments_list.filter(experimenter__name__exact=element).count();
    experimenter_counts = sorted(experimenter_counts.items());
    

    context = {'strain_counts': strain_counts,
               'trackers_counts': trackers_counts,
               'sex_counts': sex_counts,
               'dev_stage_counts': dev_stage_counts,
               'ventral_counts': ventral_counts,
               'food_counts': food_counts,
               'arena_counts': arena_counts,
               'habit_counts': habit_counts,
               'experimenter_counts': experimenter_counts,
               'db_experiment_count': db_experiment_count}
    return render(request, 'webworm/summary.html', context);

def tables(request):
    form = SearchForm();
    db_experiment_count = Experiments.objects.all().count();
    experiments_list = Experiments.objects.order_by('base_name');
    search_string = '';
    if request.method == "GET":
        # Sane defaults
        exact = 'off';
        case_sen = 'off';
        if 'exact_match' in request.GET:
            exact = request.GET['exact_match'];
        if 'case_sensitive' in request.GET:
            case_sen = request.GET['case_sensitive'];
        if 'search_name' in request.GET:
            search = request.GET['search_name'];
            if search:
                search_string = search_string + ' String:' + search;
                if exact == 'on' and case_sen == 'on':
                    experiments_list = experiments_list.filter(base_name__exact=search);
                elif exact == 'on' and case_sen == 'off':
                    experiments_list = experiments_list.filter(base_name__iexact=search);
                elif exact == 'off' and case_sen == 'on':
                    experiments_list = experiments_list.filter(base_name__contains=search);
                else: # default 'off' and 'off'
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
        if 'strain' in request.GET:
            strain = request.GET['strain'];
            if strain:
                search_string = search_string + ' Strain:' + strain;
                experiments_list = experiments_list.filter(strain__name__icontains=strain);
        if 'trackers' in request.GET:
            trackers = request.GET['trackers'];
            if trackers:
                search_string = search_string + ' Trackers:' + trackers;
                experiments_list = experiments_list.filter(tracker__name__icontains=trackers);
        if 'sex' in request.GET:
            sex = request.GET['sex'];
            if sex:
                search_string = search_string + ' Sex:' + sex;
                experiments_list = experiments_list.filter(sex__name__icontains=sex);
        if 'stage' in request.GET:
            stage = request.GET['stage'];
            if stage:
                search_string = search_string + ' Stage:' + stage;
                experiments_list = experiments_list.filter(developmental_stage__name__icontains=stage);
        if 'ventral' in request.GET:
            ventral = request.GET['ventral'];
            if ventral:
                search_string = search_string + ' Ventral:' + ventral;
                experiments_list = experiments_list.filter(ventral_side__name__iexact=ventral);
        if 'food' in request.GET:
            food = request.GET['food'];
            if food:
                search_string = search_string + ' Food:' + food;
                experiments_list = experiments_list.filter(food__name__icontains=food);
        if 'arena' in request.GET:
            arena = request.GET['arena'];
            if arena:
                search_string = search_string + ' Arena:' + arena;
                experiments_list = experiments_list.filter(arena__name__icontains=arena);
        if 'hab' in request.GET:
            hab = request.GET['hab'];
            if hab:
                search_string = search_string + ' HabTime:' + hab;
                experiments_list = experiments_list.filter(habituation__name__icontains=hab);
        if 'staff' in request.GET:
            staff = request.GET['staff'];
            if staff:
                search_string = search_string + ' Experimenter:' + staff;
                experiments_list = experiments_list.filter(experimenter__name__icontains=staff);
                
    experiment_count = experiments_list.count();
    context = {'experiments_list': experiments_list, 
               'experiment_count': experiment_count,
               'db_experiment_count': db_experiment_count, 
               'search_string': search_string,
               'form':form }
    return render(request, 'webworm/tables.html', context);
