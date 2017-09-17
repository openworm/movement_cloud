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

# Experiment Data file types
#   This is probably best implemented as part of the database, so the server and
#   client codes won't have to be kept consistent in the face of changes.
zenodo_url_prefix = 'https://sandbox.zenodo.org/record/';
fileTypes = {
    'full': ('.hdf5','Full Video Data'),
    'wcon': ('.wcon.zip','WCON Movement Data'),
    'features': ('_features.hdf5','Features Data'),
    'skeletons': ('_skeletons.hdf5','Skeleton Data'),
    'sample': ('_subsample.avi','Video Sample')
    };

# Support functions

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

# Produces a list of data rows (one row per record in database)
#    given a list of features names. If any feature has 'None' as
#    its data value, the row is dropped.
def getDataWithFeatures(selectedFeatures, dbRecords):
    dbQuery = [];
    dbQuery.insert(0,[]);
    resultData = [];
    featureExecString = '';
    for feature in selectedFeatures:
        featureExecString += '"featuresmeans__' + feature + '",';
    exec('dbQuery[0] = dbRecords.values_list(' + featureExecString + '"date","strain__name",' +
         '"strain__gene__name","strain__allele__name","zenodo_id");');
    resultData = [list(item) for item in dbQuery[0]];
    return resultData;

# Produces a list of features names given a GET request construct
def getFeaturesNamesFromGet(getRequest):
    selectedFeatures = [];
    for key in getRequest.keys():
        name = '';
        if key.endswith('_isFeature'):
            name = key[:-10];
            selectedFeatures.append(name);
    return selectedFeatures;

def getFeaturesNames(featuresFields, context):
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
    context['all_features_names'] = features_name_list;
    
# *CWL* This code originally checked for None, but it turned out to be
#   cleaner for the entire table to have all None values changed to
#   'None' before passing through this step.
def featuresNotNone(feature_list, row):
    for feature in feature_list:
        if row[feature] == 'None':
            return False;
    return True;

def eliminateNonFeatureRows(featuresNames, inTable):
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

def constructSearchContext(resultData, featuresNames, context):
    # Clone the list of names for header processing
    header = featuresNames[:];

    # Forced by Database structure in order to allow for related elements to be found
    # *CWL* Warning - this will NOT scale as we get more rows in this database.
    #       The best way out of this is to have ZenodoFiles have Experiments as its
    #       many-to-one foreign key. Each "values_list" call is a probe into the
    #       database.
    zenodoDb = ZenodoFiles.objects.all();

    # *CWL* Find a way to eliminate this horrid hardcode (and reverse order)
    header.insert(0,'url');
    header.insert(0,'filetype');
    header.insert(0,'filesize');
    header.insert(0,'zenodo_id');
    header.insert(0,'allele');
    header.insert(0,'gene');
    header.insert(0,'strain');
    header.insert(0,'timestamp');

    augmentedDataTable = [];
    post_feature_idx = len(featuresNames);
    zenodo_idx = post_feature_idx + 4;
    for row in resultData:
        zenodoId = row[zenodo_idx];
        if zenodoId != None:
            zenodoElements = zenodoDb.filter(zenodo=zenodoId).values_list('filename','filesize');
            for element in zenodoElements:
                # Replicate the original row for each zenodo file record found
                augmentedRow = [];
                # insert original features data
                idx = post_feature_idx-1;
                while (idx >= 0):
                    augmentedRow.insert(0,row[idx]);
                    idx = idx - 1;
                # construct file URL
                zenodo_filename = element[0];
                zenodo_download_url = zenodo_url_prefix + str(zenodoId) + '/files/' + zenodo_filename;
                augmentedRow.insert(0,zenodo_download_url);
                # file type
                zenodo_filetype = getFileTypeFromName(zenodo_filename);
                augmentedRow.insert(0,zenodo_filetype);
                # file size
                zenodo_filesize = element[1];
                augmentedRow.insert(0,zenodo_filesize);
                # Copy other fields
                idx = zenodo_idx;
                while (idx > post_feature_idx):
                    augmentedRow.insert(0,row[idx]);
                    idx = idx - 1;
                # transform timestamp
                augmentedRow.insert(0, row[post_feature_idx].strftime("%Y%m%d%H%M"));
                augmentedDataTable.insert(0,augmentedRow[:]);
        else:
            # Replicate the original row with empty zenodo entries
            augmentedRow = [];
            # insert original features data
            idx = post_feature_idx-1;
            while (idx >= 0):
                augmentedRow.insert(0,row[idx]);
                idx = idx - 1;
            # file URL
            augmentedRow.insert(0,'None');
            # file type
            augmentedRow.insert(0,'None');
            # file size
            augmentedRow.insert(0, 0);
            # Zenodo Id is 'None' and not None
            augmentedRow.insert(0,'None');
            # copy other fields
            idx = zenodo_idx-1;
            while (idx > post_feature_idx):
                augmentedRow.insert(0,row[idx]);
                idx = idx - 1;
            # transform timestamp
            augmentedRow.insert(0, row[post_feature_idx].strftime("%Y%m%d%H%M"));
            augmentedDataTable.insert(0,augmentedRow[:]);
    
    returnTable = [dict(zip(header,row)) for row in noneToText(augmentedDataTable)];
    returnTable = eliminateNonFeatureRows(featuresNames, returnTable);
    results_count = len(returnTable);

    context['selected_features_names'] = featuresNames;
    context['results_list'] = returnTable;
    context['results_count'] = results_count;

# Create your views here.

def index(request):
    # Context variables to be passed to client for rendering and client-side processing
    context = {};

    # Compute static global database metadata
    experimentsDb = Experiments.objects.all();
    db_experiment_count = experimentsDb.count();

    getDiscreteFieldMetadata(experimentsDb, context);
    getFeaturesNames(FeaturesMeans._meta.get_fields(), context);

    experiment_date_min = experimentsDb.aggregate(Min('date')).get('date__min');
    experiment_date_max = experimentsDb.aggregate(Max('date')).get('date__max');

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
            featuresNames = getFeaturesNamesFromGet(request.GET);
            experimentsData = getDataWithFeatures(featuresNames, results_list);
            constructSearchContext(experimentsData, featuresNames, context);        

    # If the previous phase did not result in any loads from the database, load default
    if loadDefault:
        # All experiments are chosen by default
        results_list = Experiments.objects.order_by('base_name');
        experimentsData = getDataWithFeatures(defaultCoreFeatures, results_list);
        constructSearchContext(experimentsData, defaultCoreFeatures, context);

    # Produce static database context information
    context['db_experiment_count'] = db_experiment_count;
    context['min_date'] = experiment_date_min;
    context['max_date'] = experiment_date_max;
    return render(request, 'webworm/index.html', context);
