from django.shortcuts import render
from django.http import HttpResponse

from django.template.response import TemplateResponse
from django.db.models import Avg
from django.db.models import Min
from django.db.models import Max

from .models import *

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

# A way to organize the header fields for all data.
fieldHeaders = [
    { 'label': 'youtube_id', 'field': 'youtube_id' },
    { 'label': 'filename', 'field': 'zenodofiles__filename' },
    { 'label': 'filesize', 'field': 'zenodofiles__filesize' },
    { 'label': 'timestamp', 'field': 'date' },
    { 'label': 'zenodo_id', 'field': 'zenodofiles__zenodo_id' },
    { 'label': 'allele', 'field': 'strain__allele__name' },
    { 'label': 'gene', 'field': 'strain__gene__name' },
    { 'label': 'strain', 'field': 'strain__name' },
    { 'label': 'base_name', 'field': 'base_name' },
    ];
timestampIdx = 5; # counted in reverse order

# The URL Prefix to Zenodo. In production this would be 'https://zenodo.org/record/'
zenodo_url_prefix = 'https://sandbox.zenodo.org/record/';

# Support functions

# *CWL* Not used anymore. Retaining for reference only.
def getFileTypeFromName(dataFileName):
    # Check for .hdf5 last please.
    fileType = '';
    if dataFileName.endswith('_features.hdf5'):
        fileType = 'Features';
    elif dataFileName.endswith('_skeletons.hdf5'):
        fileType = 'Skeleton';
    elif dataFileName.endswith('.wcon.zip'):
        fileType = 'WCON';
    elif dataFileName.endswith('_subsample.avi'):
        fileType = 'Sample';
    elif dataFileName.endswith('.hdf5'):
        fileType = 'Video';
    else:
        fileType = 'Error';
    return fileType;

# *CWL* Not used anymore. Retaining for reference only.
def getZenodoUrl(zenodoId, dataFileName):
    global zenodo_url_prefix;
    zenodo_download_url = zenodo_url_prefix + str(zenodoId) + '/files/' + dataFileName;
    return zenodo_download_url;

def transformTimestamps(inTable):
    global timestampIdx;
    for row in inTable:
        if row[timestampIdx] != None:
            row[timestampIdx] = row[timestampIdx].strftime("%Y%m%d%H%M");

def getDiscreteFieldCounts(experimentsDb, fieldName, fieldList, nullNameString):
    counts = {};
    param = fieldName + '__name__exact';
    for element in fieldList:
        if element:
            counts[element] = experimentsDb.filter(**{param:element}).count();
        else:
            counts[nullNameString] = experimentsDb.filter(**{param:element}).count();
    return sorted([list(tuple) for tuple in counts.items()]);

def getDiscreteFieldMetadata(experimentsDb, context):
    global discreteFields;
    experiments_count = experimentsDb.count();
    fieldCounts = [];
    for tag,field in discreteFields.items():
        exec('' + tag + '_list = ' + field[2] + 
             '.objects.order_by("name").values_list("name", flat=True).distinct();');
        exec('' + tag + '_counts = getDiscreteFieldCounts(experimentsDb, "' + field[0] +
             '", ' + tag + '_list, "' + field[3] + '");');
        exec('fieldCounts.append(' + tag + '_counts);');
    context['discrete_field_meta'] = [tag for tag,field in discreteFields.items()];
    context['discrete_field_names'] = [field[1] for tag,field in discreteFields.items()];
    context['discrete_field_counts'] = fieldCounts;

def processSearchField(key, db_filter, getRequest, dbRecords, filterState):
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
                        if filterState.get(key) == None:
                            filterState[key] = {searchTerm:'1'};
                        else:
                            filterState[key][searchTerm] = '1';
    else:
        returnDbRecords[0] = dbRecords;
    return returnDbRecords[0];

# Produces a list of data rows (one row per record in database)
#    given a list of features names. 
def getDataWithFeatures(selectedFeatures, dbRecords):
    global fieldHeaders;
    start = time.time();
    headerNames = [];
    resultData = [];
    execList = [];
    for feature in selectedFeatures:
        headerNames.insert(0,feature);
        execList.insert(0,'featuresmeans__' + feature);
    for header in fieldHeaders:
        headerNames.insert(0,header['label']);
        execList.insert(0,header['field']);
    dbQuery = dbRecords.values_list(*execList);
    resultData = [list(item) for item in dbQuery];
    timetaken = time.time() - start;
    return (headerNames,resultData);

# Produces a list of features names given a GET request construct
def getFeaturesNamesFromGet(getRequest):
    selectedFeatures = [];
    for key in getRequest.keys():
        name = '';
        if key.endswith('_isFeature'):
            name = key[:-10];
            selectedFeatures.append(name);
    return selectedFeatures;

def getAllFeaturesNames(featuresFields):
    # This is clunky, there has to be a better way to do this (filter out
    #   features table's metadata columns.)
    features_field_list = tuple(x for x in featuresFields
                                if (x.name != "id") and 
                                (x.name != "experiment_id") and
                                (x.name != "worm_index") and
                                (x.name != "n_frames") and
                                (x.name != "n_valid_skel") and
                                (x.name != "first_frame")
                                );
    features_name_list = [x.name for x in features_field_list];
    return features_name_list;
    
# *CWL* This code originally checked for None, but it turned out to be
#   cleaner for the entire table to have all None values changed to
#   'None' before passing through this step.
def featuresNotNone(feature_list, row):
    for feature in feature_list:
        if row[feature] == 'None':
            return False;
    return True;

def eliminateEmptySelectedFeatureRows(featuresNames, inTable):
    # If there are no features, just return the original list.
    outTable = [];
    if len(featuresNames) == 0:
        outTable = inTable;
    else:
        outTable = [row for row in inTable if featuresNotNone(featuresNames, row)];
    return outTable;

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

def processSearchConfiguration(getRequest, dbRecords, filterState):
    global discreteFields;
    if 'start_date' in getRequest:
        start = getRequest['start_date'];
        if start:
            filterState['start_date'] = start;
            dbRecords = dbRecords.filter(date__gte=start);
    if 'end_date' in getRequest:
        end = getRequest['end_date'];
        if end:
            filterState['end_date'] = end;
            dbRecords = dbRecords.filter(date__lte=end);
    for tag,field in discreteFields.items():
        dbRecords = processSearchField(tag, field[0]+'__name__exact', 
                                       getRequest, dbRecords, filterState);
    return dbRecords;

def constructSearchContext(inData, featuresNames, selectedFeatures, context):
    # Clone the list of names for header processing
    header = inData[0][:];
    resultData = inData[1];

    # We're gonna offload the construction of URL and File Type information to
    #   the client in this version.
    transformTimestamps(resultData);
    returnTable = [dict(zip(header,row)) for row in noneToText(resultData)];
    returnTable = eliminateEmptySelectedFeatureRows(selectedFeatures, returnTable);
    results_count = len(returnTable);

    context['selected_features_names'] = selectedFeatures;
    context['data_header'] = header;
    context['results_list'] = returnTable;
    context['results_count'] = results_count;

# Create your views here.

def index(request):
    global defaultCoreFeatures;
    # Context variables to be passed to client for rendering and client-side processing
    context = {};

    # Compute static global database metadata
    experimentsDb = Experiments.objects.all();
    db_experiment_count = experimentsDb.count();

    getDiscreteFieldMetadata(experimentsDb, context);
    all_features_names = getAllFeaturesNames(FeaturesMeans._meta.get_fields());
    context['all_features_names'] = all_features_names;

    experiment_date_min = experimentsDb.aggregate(Min('date')).get('date__min');
    experiment_date_max = experimentsDb.aggregate(Max('date')).get('date__max');

    # Parameters for Search
    filteredDb = None;

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
    featuresToCrossfilter = defaultCoreFeatures;
    filterState = {};
    filterState['filteredFeatures'] = {};
    if request.method == "GET":
        # Look for crossfilter requests first.
        if (request.GET.__contains__("crossfilter")):
            loadDefault = False;
            filteredDb = processSearchConfiguration(request.GET, 
                                                    Experiments.objects.order_by('base_name'),
                                                    filterState);
            selectedFeatures = getFeaturesNamesFromGet(request.GET);
            for feature in selectedFeatures:
                filterState['filteredFeatures'][feature] = '1';
            #            filteredData = getDataWithFeatures(all_features_names, filteredDb);
            filteredData = getDataWithFeatures(selectedFeatures, filteredDb);
            constructSearchContext(filteredData, all_features_names, selectedFeatures, context);
            # This is going to have to be a re-package of the desired advanced filter parameters
            context['prev_advanced_filter_state'] = filterState;

    # If the previous phase did not result in any loads from the database, load default
    if loadDefault:
        # All experiments are chosen by default
        filteredDb = Experiments.objects.order_by('base_name');
        #       experimentsData = getDataWithFeatures(all_features_names, filteredDb);
        experimentsData = getDataWithFeatures(defaultCoreFeatures, filteredDb);
        construct_start = time.time();
        constructSearchContext(experimentsData, all_features_names, defaultCoreFeatures, context);
        context['prev_advanced_filter_state'] = filterState;

    # Produce static database context information
    context['db_experiment_count'] = db_experiment_count;
    context['min_date'] = experiment_date_min;
    context['max_date'] = experiment_date_max;
    return render(request, 'webworm/index.html', context);
