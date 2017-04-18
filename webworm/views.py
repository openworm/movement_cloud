from django.shortcuts import render
from django.http import HttpResponse

from django.template.response import TemplateResponse
from django.db.models import Avg
from django.db.models import Min
from django.db.models import Max

from .models import *
from .forms import *

# Support functions

def getFieldCounts(experiments, fieldName, fieldList, nullNameString):
    counts = {};
    param = fieldName + '__name__exact';
    for element in fieldList:
        if element:
            counts[element] = experiments.filter(**{param:element}).count();
        else:
            counts[nullNameString] = experiments.filter(**{param:element}).count();
    return sorted(counts.items());

def processSearchConfiguration(getRequest, experimentsList):
    # Sane defaults
    exact = 'off';
    case_sen = 'off';
    returnList = experimentsList;
    if 'exact_match' in getRequest:
        exact = getRequest['exact_match'];
    if 'case_sensitive' in getRequest:
        case_sen = getRequest['case_sensitive'];
# *CWL* It has been agreed that searching by experiment "name" is not productive.
#    if 'search_name' in getRequest:
#        search = getRequest['search_name'];
#        if search:
#            search_string = search_string + ' String:' + search;
#            if exact == 'on' and case_sen == 'on':
#                experimentsList = experimentsList.filter(base_name__exact=search);
#            elif exact == 'on' and case_sen == 'off':
#                experimentsList = experimentsList.filter(base_name__iexact=search);
#            elif exact == 'off' and case_sen == 'on':
#                experimentsList = experimentsList.filter(base_name__contains=search);
#            else: # default 'off' and 'off'
#                experimentsList = experimentsList.filter(base_name__icontains=search);
    if 'start_date' in getRequest:
        start = getRequest['start_date'];
        if start:
#            search_string = search_string + ' Start:' + start;
            returnList = returnList.filter(date__gte=start);
    if 'end_date' in getRequest:
        end = getRequest['end_date'];
        if end:
#            search_string = search_string + ' End:' + end;
            returnList = returnList.filter(date__lte=end);
    if 'strain' in getRequest:
        strain = getRequest['strain'];
        if strain:
#            search_string = search_string + ' Strain:' + strain;
            returnList = returnList.filter(strain__name__icontains=strain);
    if 'trackers' in getRequest:
        trackers = getRequest['trackers'];
        if trackers:
#            search_string = search_string + ' Trackers:' + trackers;
            returnList = returnList.filter(tracker__name__icontains=trackers);
    if 'sex' in getRequest:
        sex = getRequest['sex'];
        if sex:
#            search_string = search_string + ' Sex:' + sex;
            returnList = returnList.filter(sex__name__icontains=sex);
    if 'stage' in getRequest:
        stage = getRequest['stage'];
        if stage:
#            search_string = search_string + ' Stage:' + stage;
            returnList = returnList.filter(developmental_stage__name__icontains=stage);
    if 'ventral' in getRequest:
        ventral = getRequest['ventral'];
        if ventral:
#            search_string = search_string + ' Ventral:' + ventral;
            returnList = returnList.filter(ventral_side__name__iexact=ventral);
    if 'food' in getRequest:
        food = getRequest['food'];
        if food:
#            search_string = search_string + ' Food:' + food;
            returnList = returnList.filter(food__name__icontains=food);
    if 'arena' in getRequest:
        arena = getRequest['arena'];
        if arena:
#            search_string = search_string + ' Arena:' + arena;
            returnList = returnList.filter(arena__name__icontains=arena);
    if 'hab' in getRequest:
        hab = getRequest['hab'];
        if hab:
#            search_string = search_string + ' HabTime:' + hab;
            returnList = returnList.filter(habituation__name__icontains=hab);
    if 'staff' in getRequest:
        staff = getRequest['staff'];
        if staff:
#            search_string = search_string + ' Experimenter:' + staff;
            returnList = returnList.filter(experimenter__name__icontains=staff);
    return returnList;
    

def createParametersMetadata(featuresFields, featuresObjects, context):
    # This is clunky, there has to be a better way to do this.
    parameter_field_list = tuple(x for x in featuresFields
                                 if (x.name != "id") and 
                                 (x.name != "experiment_id") and
                                 (x.name != "worm_index") and
                                 (x.name != "n_frames") and
                                 (x.name != "n_valid_skel") and
                                 (x.name != "first_frame")
                                 );
    param_name_list = [x.name for x in parameter_field_list];
#    param_jsgrid_name_list = [{"Parameter Name":x.name} for x in parameter_field_list];

    param_min_list = [];
#    param_jsgrid_min_list = [];
    # *CWL* Hardcoding the name of the dictionary returned has to be the ugliest hack!
    for field_min in parameter_field_list:
        minval = featuresObjects.aggregate(Min(field_min.name)).get(field_min.name+'__min');
        if (minval == None):
            param_min_list.append("None");
        else:
            param_min_list.append(minval);

    param_max_list = [];
    for field_max in parameter_field_list:
        maxval = featuresObjects.aggregate(Max(field_max.name)).get(field_max.name+'__max');
        if (maxval == None):
            param_max_list.append("None");
        else:
            param_max_list.append(maxval);

    param_tuple_list = zip(param_name_list, param_min_list, param_max_list);
    context['param_list'] = param_tuple_list;
    context['parameter_name_list'] = param_name_list;

def createDiscreteFieldMetadata(experiments, context):
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
    context = {};

    # Compute static global database metadata
    experiments_list = Experiments.objects.all();
    db_experiment_count = experiments_list.count();

    createDiscreteFieldMetadata(experiments_list, context);

    featuresFields = FeaturesMeans._meta.get_fields();
    featuresObjects = FeaturesMeans.objects.all();
    createParametersMetadata(featuresFields, featuresObjects, context);

    experiment_date_min = experiments_list.aggregate(Min('date')).get('date__min');
    experiment_date_max = experiments_list.aggregate(Max('date')).get('date__max');

    # Parameters for Search
    results_count = 0;
    results_list = None;
#    search_string = '';
    if request.method == "GET":
        if (len(request.GET.keys()) > 0):
            results_list = processSearchConfiguration(request.GET, 
                                                      Experiments.objects.order_by('base_name'));
            results_count = results_list.count();

    context['db_experiment_count'] = db_experiment_count;
    context['results_list'] = results_list;
    context['results_count'] = results_count;
    context['min_date'] = experiment_date_min;
    context['max_date'] = experiment_date_max;
#    context['search_string'] = search_string;
    context['form'] = form;
    return render(request, 'webworm/index.html', context);

# *CWL* - Consolidated into a single page.
#def filter(request):
#    form = SearchForm();
#    experiments_list = Experiments.objects.order_by('base_name');
#    db_experiment_count = experiments_list.count();
#    search_string = '';
#    if request.method == "GET":
#        experiments_list = processSearchConfiguration(request.GET, experiments_list);
#    if search_string == '':
#        search_string = 'All';
#    experiment_count = experiments_list.count();
#    context = {'experiments_list': experiments_list, 
#               'experiment_count': experiment_count,
#               'db_experiment_count': db_experiment_count, 
#               'search_string': search_string,
#               'form':form }
#    createDiscreteFieldMetadata(experiments_list, context);
#    return render(request, 'webworm/results.html', context);
