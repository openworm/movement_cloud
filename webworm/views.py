from django.shortcuts import render
from django.http import HttpResponse

from django.template.response import TemplateResponse
from django.db.models import Avg
from django.db.models import Min
from django.db.models import Max

from .models import *
from .forms import *

import json

# For performance debugging only
import time

# Global discrete field management information
discreteFields = {
    'strains': ('strain','Strains','Strains','None'),
    'trackers': ('tracker','Trackers','Trackers','Unknown'),
    'dev': ('developmental_stage','Developmental Stage','DevelopmentalStages','None'),
    'ventral': ('ventral_side','Ventral Side','VentralSides','Unknown'),
    'food': ('food','Food','Foods','Unknown'), 
    'arena': ('arena','Arena','Arenas','None'),
    'habituation': ('habituation','Habituation','Habituations','Unknown'),
    'experimenter': ('experimenter','Experimenter','Experimenters','Unknown')
    };

# Default core features for landing page
defaultCoreFeatures = [
    'length',
    'midbody_bend_mean_abs',
    'midbody_speed_abs',
    ];

# In preparation for a cleaner way to handle results columns in Crossfilter
defaultResultsInformation = [
    { 'dbfield':'date', 'xFilterTag':'timestamp', 'label':'Local Date'},
    { 'dbfield':'strain__name', 'xFilterTag':'strain', 'label':'Strain'},
    { 'dbfield':'strain__allele__name', 'xFilterTag':'allele', 'label':'Allele'},
    ];

# Support functions
def getDiscreteFieldCounts(experiments, fieldName, fieldList, nullNameString):
    counts = {};
    param = fieldName + '__name__exact';
    for element in fieldList:
        if element:
            counts[element] = experiments.filter(**{param:element}).count();
        else:
            counts[nullNameString] = experiments.filter(**{param:element}).count();
    return sorted([list(tuple) for tuple in counts.items()]);

def getDiscreteFieldMetadata(experiments, context):
    global discreteFields;
    experiments_count = experiments.count();
    fieldCounts = [];
    for tag,field in discreteFields.items():
        exec('' + tag + '_list = ' + field[2] + 
             '.objects.order_by("name").values_list("name", flat=True).distinct();');
        exec('' + tag + '_counts = getDiscreteFieldCounts(experiments, "' + field[0] +
             '", ' + tag + '_list, "' + field[3] + '");');
        exec('fieldCounts.append(' + tag + '_counts);');
    context['discrete_field_meta'] = [tag for tag,field in discreteFields.items()];
    context['discrete_field_names'] = [field[1] for tag,field in discreteFields.items()];
    context['discrete_field_counts'] = fieldCounts;

def processSearchField(key, db_filter, getRequest, dbRecords):
    # *CWL* This deals with a bizzarre difference in the way exec() behaves between
    #  Python 2 and Python 3 with regard to local variable assignment inside the
    #  call to exec() I do not yet fully understand. Quite by accident, I discovered
    #  that while direct assignment fails, modification to a list construct works.
    #
    #  As a result this code works, but with the caveat that I have misgivings about
    #  this as the intended idiom in Python 3 to execute dynamic code driven by
    #  variables (in our case - "db_filter" which is a variable string but needed to 
    #  be code text when applied to a function parameter.)
    returnDbRecords = [];
    if key in getRequest:
        returnDbRecords = [Experiments.objects.none()];
        searchList = getRequest[key].split(',');
        if searchList:
            # *CWL* Django creates null lists as [''] which translates into python
            #   as a single empty-string entry. Unfortunately this translates into
            #   a huge performance hit if processed naively, because attempting to
            #   filter on an empty search term is expensive, even though it is
            #   essentially a null operation. This conditional checks for it, and
            #   turns it into essentially a null operation.
            if (len(searchList) == 1) and (searchList[0] == ''):
                returnDbRecords[0] = dbRecords;
            else:
                for searchTerm in searchList:
                    # *CWL* This check may not actually be necessary, but is included
                    #   in case a search term in a non-trivial list is actually
                    #   an empty-string. In this case rather than permit a DB filter
                    #   operation which translates to an expensive null operation, 
                    #   we ignore it.
                    if searchTerm != '':
                        exec('returnDbRecords[0] = returnDbRecords[0] | dbRecords.filter(' + 
                             db_filter + '=searchTerm);');
    else:
        returnDbRecords[0] = dbRecords;
    return returnDbRecords[0];

# Produces a list of features data rows given a list of headers
def processFeatures(inHeaders, dbRecords):
    returnList = [];
    # Makes a copy
    headerList = inHeaders[:];
    listOfLists = [];
    for feature in headerList:
        exec('listOfLists.append(' +
             'dbRecords.values_list("featuresmeans__' +
             feature + '",flat="true"));');
    returnList = [list(item) for item in zip(*listOfLists)];
    return (returnList,headerList);

# Produces a list of features data rows given a GET request construct
def processFeaturesFromGet(getRequest, dbRecords):
    headerList = [];
    for key in getRequest.keys():
        name = '';
        if key.endswith('_isFeature'):
            name = key[:-10];
            headerList.append(name);
    return processFeatures(headerList, dbRecords);

def getFeaturesNames(featuresFields, context):
    # This is clunky, there has to be a better way to do this (filter out
    #   features table's metadata columns.)
    parameter_field_list = tuple(x for x in featuresFields
                                 if (x.name != "id") and 
                                 (x.name != "experiment_id") and
                                 (x.name != "worm_index") and
                                 (x.name != "n_frames") and
                                 (x.name != "n_valid_skel") and
                                 (x.name != "first_frame")
                                 );
    param_name_list = [x.name for x in parameter_field_list];
    context['parameter_name_list'] = param_name_list;
    
def featuresNotNone(headers, row):
    for feature in headers:
        if row[feature] == None:
            return False;
    return True;

def eliminateNonFeatureRows(featuresHeader, inList):
    # If there are no features, just return the original list.
    outList = [];
    if len(featuresHeader) == 0:
        outList = inList;
    else:
        outList = [x for x in inList if featuresNotNone(featuresHeader, x)];
    return outList;

def noneToText(inList):
    for rowIdx, row in enumerate(inList):
        for idx, item in enumerate(row):
            if item == None:
                row[idx] = "None";
    return inList;

def noneToZero(inList):
    for rowIdx, row in enumerate(inList):
        for idx, item in enumerate(row):
            if item == None:
                row[idx] = 0;
    return inList;

def processSearchConfiguration(getRequest, dbRecords):
    global discreteFields;
    if 'start_date' in getRequest:
        start = getRequest['start_date'];
        if start:
            dbRecords = dbRecords.filter(date__gte=start);
    if 'end_date' in getRequest:
        end = getRequest['end_date'];
        if end:
            dbRecords = dbRecords.filter(date__lte=end);
    for tag,field in discreteFields.items():
        dbRecords = processSearchField(tag, field[0]+'__name__exact', 
                                       getRequest, dbRecords);
    return dbRecords;

def constructSearchContext(featuresInfo, dbRecords, context):
    featuresList = featuresInfo[0];
    headerList = featuresInfo[1];
    # Clone the list for only the features
    featuresHeaderList = headerList[:];
    # *CWL* Find a way to eliminate this horrid hardcode (and reverse order)
    headerList.insert(0,'datasize');
    headerList.insert(0,'url');
    headerList.insert(0,'fullname');
    headerList.insert(0,'allele');
    headerList.insert(0,'strain');
    headerList.insert(0,'timestamp');
    dataList = [list(item) for item in 
                dbRecords.values_list('date','strain__name','strain__allele__name',
                                      'base_name','zenodo_id','original_video_sizemb')];
    slicedList = noneToText([item[1:5] for item in dataList]);
    sizeList = noneToZero([item[5:6] for item in dataList]);
    dateList = [[item] for item in 
                [entry[0].strftime("%Y%m%d%H%M") for entry in dataList]];
    # If there are no features, we do not attempt to zip the empty list in
    tempList = [];
    if len(featuresHeaderList) == 0:
        tempList = [list(item) for item in zip(dateList,slicedList,sizeList)];
    else:
        tempList = [list(item) for item in zip(dateList,slicedList,sizeList,featuresList)];
    returnList = [dict(zip(headerList,listLine)) for listLine in 
                  [[item for sublist in l for item in sublist] for l in tempList]];
    returnList = eliminateNonFeatureRows(featuresHeaderList, returnList);
    results_count = len(returnList);
    context['features_headers'] = featuresHeaderList;
    context['results_list'] = returnList;
    context['results_count'] = results_count;

# Create your views here.

def index(request):
    form = SearchForm();
    context = {};

    # Compute static global database metadata
    experiments_list = Experiments.objects.all();
    db_experiment_count = experiments_list.count();

    getDiscreteFieldMetadata(experiments_list, context);
    getFeaturesNames(FeaturesMeans._meta.get_fields(), context);

    experiment_date_min = experiments_list.aggregate(Min('date')).get('date__min');
    experiment_date_max = experiments_list.aggregate(Max('date')).get('date__max');

    # Parameters for Search
    results_count = 0;
    results_list = None;

    # Produce list of core features
    coreFeaturesObjects = Features.objects.all();
    isCore = coreFeaturesObjects.filter(is_core_feature__exact="1");
    coreFeaturesList = [];
    for coreFeature in isCore:
        coreFeaturesList.append({'name':coreFeature.name,'desc':coreFeature.description});
    context['core_features'] = coreFeaturesList;

    returnList = [];
    # If anything else loads, loadDefault is set to False
    loadDefault = True;
    if request.method == "GET":
        # Look for crossfilter requests first.
        if (request.GET.__contains__("crossfilter")):
            loadDefault = False;
            results_list = processSearchConfiguration(request.GET, 
                                                      Experiments.objects.order_by('base_name'));
            featuresInfo = processFeaturesFromGet(request.GET, results_list);
            constructSearchContext(featuresInfo, results_list, context);        

    # If the previous phase did not result in any loads from the database, load default
    if loadDefault:
        # All experiments are chosen by default
        results_list = Experiments.objects.order_by('base_name');
        featuresInfo = processFeatures(defaultCoreFeatures, results_list);
        constructSearchContext(featuresInfo, results_list, context);        

    # Produce static database context information
    context['db_experiment_count'] = db_experiment_count;
    context['min_date'] = experiment_date_min;
    context['max_date'] = experiment_date_max;
    context['form'] = form;
    return render(request, 'webworm/index.html', context);
