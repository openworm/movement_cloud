from django.shortcuts import render
from django.http import HttpResponse

from django.template.response import TemplateResponse
from django.db.models import Avg
from django.db.models import Min
from django.db.models import Max

from .models import *
from .forms import *

import json

coreFeatures = {};

# Support functions

def loadCoreFeatures(featureFields, context):
    global coreFeatures;
    coreFeatures = json.loads(open('webworm/defaultCoreFeatures.json').read());
    # Check that the features are in the database
    allFeaturesList = [f.name for f in featureFields];
    coreList = coreFeatures['features'];
    presentList = [];
    missingList = [];
    for feature in coreList:
        if feature['name'] in allFeaturesList:
            presentList.append(feature);
        else:
            missingList.append(feature);
    context['presentFeatures'] = presentList;
    context['missingFeatures'] = missingList;

def getFieldCounts(experiments, fieldName, fieldList, nullNameString):
    counts = {};
    param = fieldName + '__name__exact';
    for element in fieldList:
        if element:
            counts[element] = experiments.filter(**{param:element}).count();
        else:
            counts[nullNameString] = experiments.filter(**{param:element}).count();
    return sorted(counts.items());

def processSearchField(key, db_filter, getRequest, experimentsList):
    # *CWL* This deals with a bizzarre difference in the way exec() behaves between
    #  Python 2 and Python 3 with regard to local variable assignment inside the
    #  call to exec() I do not yet fully understand. Quite by accident, I discovered
    #  that while direct assignment fails, modification to a list construct works.
    #
    #  As a result this code works, but with the caveat that I have misgivings about
    #  this as the intended idiom in Python 3 to execute dynamic code driven by
    #  variables (in our case - "db_filter" which is a variable string but needed to 
    #  be code text when applied to a function parameter.)
    returnList = [Experiments.objects.none()];
    if key in getRequest:
        searchList = getRequest[key].split(',');
        if searchList:
            # *CWL* Django creates null lists as [''] which translates into python
            #   as a single empty-string entry. Unfortunately this translates into
            #   a huge performance hit if processed naively, because attempting to
            #   filter on an empty search term is expensive, even though it is
            #   essentially a null operation. This conditional checks for it, and
            #   turns it into essentially a null operation.
            if (len(searchList) == 1) and (searchList[0] == ''):
                returnList[0] = experimentsList;
            else:
                for searchTerm in searchList:
                    # *CWL* This check may not actually be necessary, but is included
                    #   in case a search term in a non-trivial list is actually
                    #   an empty-string. In this case rather than permit a DB filter
                    #   operation which translates to an expensive null operation, 
                    #   we ignore it.
                    if searchTerm != '':
                        exec('returnList[0] = returnList[0] | experimentsList.filter(' + db_filter + '=searchTerm);');
    return returnList[0];

def processSearchParameters(getRequest, featuresObjects, experimentsList):
    returnList = experimentsList;
    # This is pretty painful, and requires us to traverse the request list for keys
    #   instead of a forward search. Still looks more efficient than traversing
    #   all 700+ parameters.
    for key in getRequest.keys():
        name = '';
        if key.endswith('_minParam'):
            name = key[:-9];
            minVal = getRequest[key];
            exec('eliminatedFeatures = featuresObjects.filter('+ name +'__lt=minVal);');
            returnList.exclude(id__in = [x.experiment_id for x in eliminatedFeatures_set()]);
#            exec('returnList =  returnList.select_related("'+name+'").filter(' + name + '__gte=minVal);');
        elif key.endswith('_maxParam'):
            name = key[:-9];
            maxVal = getRequest[key];
#            exec('returnList =  returnList.select_related("'+name+'").filter(' + name + '__lte=maxVal);');
    return returnList;

def processSearchConfiguration(getRequest, experimentsList, featuresObjects):
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
            returnList = returnList.filter(date__gte=start);
    if 'end_date' in getRequest:
        end = getRequest['end_date'];
        if end:
            returnList = returnList.filter(date__lte=end);
    returnList = processSearchField('strains', 'strain__name__icontains', 
                                    getRequest, returnList);
    returnList  = processSearchField('trackers', 'tracker__name__icontains', 
                                     getRequest, returnList);
    returnlist = processSearchField('sex', 'sex__name__icontains', 
                                    getRequest, returnList);
    returnList = processSearchField('dev', 'developmental_stage__name__icontains', 
                                    getRequest, returnList);
    returnList = processSearchField('ventral', 'ventral_side__name__icontains', 
                                    getRequest, returnList);
    returnList = processSearchField('food', 'food__name__icontains', 
                                    getRequest, returnList);
    returnList = processSearchField('arena', 'arena__name__icontains', 
                                    getRequest, returnList);
    returnList = processSearchField('habituation', 'habituation__name__icontains', 
                                    getRequest, returnList);
    returnList = processSearchField('experimenter', 'experimenter__name__icontains', 
                                    getRequest, returnList);
    returnList = processSearchParameters(getRequest, featuresObjects, returnList);

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

    # Get Core Parameters from JSON file
    loadCoreFeatures(featuresFields, context);

    if request.method == "GET":
        if (len(request.GET.keys()) > 0):
            results_list = processSearchConfiguration(request.GET, 
                                                      Experiments.objects.order_by('base_name'),
                                                      featuresObjects);
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
