from django.shortcuts import render
from django.http import HttpResponse

from django.template.response import TemplateResponse
from django.db.models import Avg
from django.db.models import Min
from django.db.models import Max

from .models import *
from .forms import *

# Support functions

# Only required for jsGrid because of all the dictionaries nonsense.
def createJsGridRow(tripleOfDictionaries):
    result = tripleOfDictionaries[0].copy();
    result.update(tripleOfDictionaries[1]);
    result.update(tripleOfDictionaries[2]);
    return result;

def getFieldCounts(experiments, fieldName, fieldList, nullNameString):
    counts = {};
    param = fieldName + '__name__exact';
    for element in fieldList:
        if element:
            counts[element] = experiments.filter(**{param:element}).count();
        else:
            counts[nullNameString] = experiments.filter(**{param:element}).count();
    return sorted(counts.items());

def createSummary(experiments, context):
    experiments_count = experiments.count();

    # Strains
    strain_list = Strains.objects.order_by('name').values_list('name', flat=True).distinct();
    strain_counts = getFieldCounts(experiments, 'strain', strain_list, 'None');
    context['strain_counts'] = strain_counts;

    # Trackers
    trackers_list = Trackers.objects.order_by('name').values_list('name', flat=True).distinct();
    trackers_counts = getFieldCounts(experiments, 'tracker', trackers_list, 'Unknown');
    context['trackers_counts'] = trackers_counts;

    # Sex - should we even need to have this field discoverable?
    sex_list = Sexes.objects.order_by('name').values_list('name', flat=True).distinct();
    sex_counts = getFieldCounts(experiments, 'sex', sex_list, 'Unknown');
    context['sex_counts'] = sex_counts;

    # Development Stages
    dev_stage_list = DevelopmentalStages.objects.order_by('name').values_list('name', flat=True).distinct();
    dev_stage_counts = getFieldCounts(experiments, 'developmental_stage', dev_stage_list, 'None');
    context['dev_stage_counts'] = dev_stage_counts;

    # Ventral Side - again, should we even need this?
    ventral_list = VentralSides.objects.order_by('name').values_list('name', flat=True).distinct();
    ventral_counts = getFieldCounts(experiments, 'ventral_side', ventral_list, 'Unknown');
    context['ventral_counts'] = ventral_counts;

    # Food
    food_list = Foods.objects.order_by('name').values_list('name', flat=True).distinct();
    food_counts = getFieldCounts(experiments, 'food', food_list, 'Unknown');
    context['food_counts'] = food_counts;

    # Arena - I'm assuming this has valid categories instead of being a free-form descriptor
    arena_list = Arenas.objects.order_by('name').values_list('name', flat=True).distinct();
    arena_counts = getFieldCounts(experiments, 'arena', arena_list, 'None');
    context['arena_counts'] = arena_counts;
    
    # Habituation really ought to be a time-based field
    habit_list = Habituations.objects.order_by('name').values_list('name', flat=True).distinct();
    habit_counts = getFieldCounts(experiments, 'habituation', habit_list, 'Unknown');
    context['habit_counts'] = habit_counts;

    # Experimenter
    experimenter_list = Experimenters.objects.order_by('name').values_list('name', flat=True).distinct();
    experimenter_counts = getFieldCounts(experiments, 'experimenter', experimenter_list, 'Unknown');
    context['experimenter_counts'] = experimenter_counts;
            
# Create your views here.

def index(request):
    form = SearchForm();
    f = FeaturesMeans._meta.get_fields();
    # This is clunky, there has to be a better way to do this.
    parameter_field_list = tuple(x for x in f 
                                 if (x.name != "id") and 
                                 (x.name != "experiment_id") and
                                 (x.name != "worm_index") and
                                 (x.name != "n_frames") and
                                 (x.name != "n_valid_skel") and
                                 (x.name != "first_frame")
                                 );
    param_name_list = [x.name for x in parameter_field_list];
    param_jsgrid_name_list = [{"Parameter Name":x.name} for x in parameter_field_list];

    param_min_list = [];
    param_jsgrid_min_list = [];
    # *CWL* Hardcoding the name of the dictionary returned has to be the ugliest hack!
    for field_min in parameter_field_list:
        minval = FeaturesMeans.objects.all().aggregate(Min(field_min.name)).get(field_min.name+'__min');
        if (minval == None):
            param_min_list.append("None");
            param_jsgrid_min_list.append({"Minimum":"None"});
        else:
            param_min_list.append(minval);
            param_jsgrid_min_list.append({"Minimum":minval});        

    param_max_list = [];
    param_jsgrid_max_list = [];
    for field_max in parameter_field_list:
        maxval = FeaturesMeans.objects.all().aggregate(Max(field_max.name)).get(field_max.name+'__max');
        if (maxval == None):
            param_max_list.append("None");
            param_jsgrid_max_list.append({"Maximum":"None"});
        else:
            param_max_list.append(maxval);
            param_jsgrid_max_list.append({"Maximum":maxval});

    param_tuple_list = zip(param_name_list, param_min_list, param_max_list);
    param_jsgrid_tuple_list = zip(param_jsgrid_name_list, param_jsgrid_min_list, param_jsgrid_max_list);
    param_jsgrid_list = map(createJsGridRow, param_jsgrid_tuple_list);
                          
    experiments_list = Experiments.objects.all();
    db_experiment_count = experiments_list.count();

    experiment_date_min = experiments_list.aggregate(Min('date')).get('date__min');
    experiment_date_max = experiments_list.aggregate(Max('date')).get('date__max');

    experiment_count = 0;
    search_string = 'None';
    context = {'db_experiment_count': db_experiment_count,
               'experiment_count': experiment_count,
               'min_date': experiment_date_min,
               'max_date': experiment_date_max,
               'search_string': search_string,
               'param_list': param_tuple_list,
               'parameter_name_list': param_name_list,
               'form': form
               };
    createSummary(experiments_list, context);
    return render(request, 'webworm/index.html', context);

def filter(request):
    form = SearchForm();
    experiments_list = Experiments.objects.order_by('base_name');
    db_experiment_count = experiments_list.count();
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
    
    if search_string == '':
        search_string = 'All';
    experiment_count = experiments_list.count();
    context = {'experiments_list': experiments_list, 
               'experiment_count': experiment_count,
               'db_experiment_count': db_experiment_count, 
               'search_string': search_string,
               'form':form }
    createSummary(experiments_list, context);
    return render(request, 'webworm/results.html', context);
