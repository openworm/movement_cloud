from django.shortcuts import render
from django.http import HttpResponse

from django.template.response import TemplateResponse
from django.db.models import Avg
from django.db.models import Min
from django.db.models import Max

from django.core.mail import EmailMessage

from .models import *

import json

from datetime import datetime
from datetime import timedelta
import decimal
import math

# For performance debugging only
import time

# Global discrete field management information
discreteFields = {
#    'trackers': ('tracker','Trackers','Trackers','Unknown'),
# *CWL* Current generalization doesn't work on things outside the Experiments table
#     I think. Will need to find a way to extend this to other tables.
    'genes': ('strain__gene', 'Genes', 'Genes', 'Unknown'),
    'alleles': ('strain__allele', 'Alleles', 'Alleles', 'Unknown'),
    'strains': ('strain','Strains','Strains','None'),
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
    { 'label': 'days_of_adulthood', 'field': 'days_of_adulthood' },
    { 'label': 'youtube_id', 'field': 'youtube_id' },
    { 'label': 'timestamp', 'field': 'date' },
    { 'label': 'zenodo_id', 'field': 'zenodofiles__zenodo_id' },
    { 'label': 'allele', 'field': 'strain__allele__name' },
    { 'label': 'gene', 'field': 'strain__gene__name' },
    { 'label': 'strain', 'field': 'strain__name' },
    { 'label': 'base_name', 'field': 'base_name' },
    ];
timestampIdx = 5; # counted in reverse order
zenodoIdx = 4; # counted in reverse order

# A way to organize the header fields for all data.
zenodoFieldHeaders = [
    { 'label': 'filetype', 'field': 'zenodofiles__file_type' },
    { 'label': 'filename', 'field': 'zenodofiles__filename' },
    { 'label': 'filesize', 'field': 'zenodofiles__filesize' },
    { 'label': 'zenodo_id', 'field': 'zenodofiles__zenodo_id' },
    ];
filetypeIdx = 3; # counted in reverse order

# A way to organize the header fields for all data.
downloadHeaders = [
    { 'label': 'days_of_adulthood', 'field': 'days_of_adulthood' },
    { 'label': 'timestamp', 'field': 'date' },
    { 'label': 'zenodo_id', 'field': 'zenodofiles__zenodo_id' },
    { 'label': 'allele', 'field': 'strain__allele__name' },
    { 'label': 'gene', 'field': 'strain__gene__name' },
    { 'label': 'strain', 'field': 'strain__name' },
    { 'label': 'base_name', 'field': 'base_name' },
    ];
downloadTimestampIdx = 5; # counted in reverse order

# The URL Prefix to Zenodo. In production this would be 'https://zenodo.org/record/'
zenodo_url_prefix = 'https://zenodo.org/record/';

# File Types information - generated from Database.
fileTypes = [];

# Support functions

def getVersion():
    with open('webworm/version.txt', 'r') as versionFile:
        version=versionFile.readline();
        return version;

# *CWL* Not used anymore. Retaining for reference only.
def getZenodoUrl(zenodoId, dataFileName):
    global zenodo_url_prefix;
    zenodo_download_url = zenodo_url_prefix + str(zenodoId) + '/files/' + dataFileName;
    return zenodo_download_url;

def transformTimestamps(inTable, index):
    for row in inTable:
        if row[index] != None:
            row[index] = row[index].strftime("%Y%m%d%H%M");

def prettyTimestamps(inTable, index):
    for row in inTable:
        if row[index] != None:
            row[index] = row[index].strftime("%Y-%m-%d %H:%M");

def fileTypeIdToName(inTable, index):
    for row in inTable:
        if row[index] != None:
            row[index] = fileTypes[row[index]];

def getDiscreteFieldCounts(experimentsDb, fieldName, fieldList, nullNameString):
    counts = {};
    param = fieldName + '__name__exact';
    for element in fieldList:
        if element:
            counts[element] = experimentsDb.filter(**{param:element}).count();
        else:
            counts[nullNameString] = experimentsDb.filter(**{param:element}).count();
    return sorted([list(tuple) for tuple in counts.items()]);

# *CWL*
# Not sure we need this anymore. Basically it is to tell users how many records
#   can be found for each search term.
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
    returnDbRecords = Experiments.objects.none();
    if key in getRequest:
        searchList = getRequest[key].split(',');
        if searchList:
            # *CWL* Django creates null lists as [''] which translates into python
            #   as a single empty-string entry. Unfortunately this translates into
            #   a huge performance hit if processed naively, because attempting to
            #   filter on an empty search term in Django is expensive, even though it is
            #   essentially a null operation. This conditional checks for it, and
            #   turns it into essentially a null operation.
            if (len(searchList) == 1) and (searchList[0] == ''):
                returnDbRecords = dbRecords;
            else:
                for searchTerm in searchList:
                    if searchTerm != '':
                        # https://stackoverflow.com/questions/38778080/pass-kwargs-into-django-filter
                        execDict = {db_filter:searchTerm};
                        returnDbRecords = returnDbRecords | dbRecords.filter(**execDict); 
                        if filterState.get(key) == None:
                            filterState[key] = {searchTerm:'1'};
                        else:
                            filterState[key][searchTerm] = '1';
    else:
        returnDbRecords = dbRecords;
    return returnDbRecords;

# Produces a list of data rows (one row per record in database)
#    given a list of features names. 
def getDataWithFeatures(selectedFeatures, dbRecords, headersSet):
    headerNames = [];
    resultData = [];
    execList = [];

    # Insert features in-order
    for feature in selectedFeatures:
        headerNames.append(feature);
        execList.append('featuresmeans__' + feature);
    # Insert fields in-reverse-order
    for header in headersSet:
        headerNames.insert(0,header['label']);
        execList.insert(0,header['field']);
    # We only want a single zenodo value per record.
    dbRecords = dbRecords.distinct();
    # Note the difference between values_list() kwargs processing and filter()
    dbQuery = dbRecords.values_list(*execList);
    resultData = [list(item) for item in dbQuery];

    return { 'header': headerNames, 'data': resultData, };

def applyXfRangeToDownload(inData, xfFeatures, xfRanges):
    returnData = [];
    fullHeader = inData['header'];
    data = inData['data'];
    numXfFeatures = len(xfFeatures);
    for row in data:
        rowDict = dict(zip(fullHeader,row));
        retain = True;
        for xf_feature, range in xfRanges.items():
            if 'min' in range:
                if float(rowDict[xf_feature]) < float(range['min']):
                    retain = False;
            if 'max' in range:
                if float(rowDict[xf_feature]) > float(range['max']):
                    retain = False;
        if retain:
            # Cut out the columns with crossfilter values before attaching
            newRow = row[:-numXfFeatures];
            returnData.append(newRow);
    newHeader = fullHeader[:-numXfFeatures];
    return { 'header': newHeader, 'data': returnData };

def getZenodoData(selectedFeatures, dbRecords):
    zenodoHeaderNames = [];
    zenodoData = [];
    zenodoExecList = [];
    # We only want a single zenodo value per record.
    dbRecords = dbRecords.distinct();

    for header in zenodoFieldHeaders:
        zenodoHeaderNames.insert(0,header['label']);
        zenodoExecList.insert(0,header['field']);

    zenodoQuery = dbRecords.values_list(*zenodoExecList);
    zenodoData = [list(item) for item in zenodoQuery if item[0] != None];
    return { 'zenodo_header': zenodoHeaderNames, 'zenodo_data': zenodoData, };


# Produces a list of features names given a GET request construct
def getFeaturesNamesFromGet(getRequest, tag):
    selectedFeatures = [];
    for key in getRequest.keys():
        name = '';
        if key.endswith(tag):
            name = key[:0-len(tag)];
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

def processMainGetRequest(getRequest, dbRecords, filterState):
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

def processDownloadGetRequest(getRequest, dbRecords):
    featuresRange = {};
    # Filter based on crossfilter chart date & time min/max
    if 'iso_date_dl_min' in getRequest:
        dbRecords = dbRecords.filter(date__gte=getRequest['iso_date_dl_min']);
    if 'iso_date_dl_max' in getRequest:
        # The following code is required because the date values coming back
        #   from the interface has no hours information.
        end_date_record = getRequest['iso_date_dl_max'];
        end_date = datetime.strptime(end_date_record, "%Y-%m-%d");
        modified_end_date = end_date + timedelta(days=1);
        modified_end_date_record = datetime.strftime(modified_end_date, "%Y-%m-%d")
        dbRecords = dbRecords.filter(date__lt=modified_end_date_record);
    # Filter based on crossfilter chart the days of adulthood
    if 'days_of_adulthood_dl_min' in getRequest:
        dbRecords = dbRecords.filter(days_of_adulthood__gte=getRequest['days_of_adulthood_dl_min']);
    if 'days_of_adulthood_dl_max' in getRequest:
        dbRecords = dbRecords.filter(days_of_adulthood__lte=getRequest['days_of_adulthood_dl_max']);

    # No easy way to support Time at this point, so stick to only Date.
    # Now filter based on each crossfilter chart feature min and max
    for key in getRequest:
        if key.endswith('_f_min'):
            feature = key[:0-len('_f_min')];
            # This adjustment dance is required because of inexact database
            #   matches.
            min_value = getRequest[key];
            d = decimal.Decimal(min_value);
            delta = 10**d.as_tuple().exponent;
            modified_min_value = str(d - decimal.Decimal(delta));
            execList = { 'featuresmeans__' + feature + '__gt':modified_min_value };
            # dbRecords = dbRecords.filter(**execList);
            if feature not in featuresRange:
                featuresRange[feature] = {};
            featuresRange[feature]['min'] = min_value;
        if key.endswith('_f_max'):
            feature = key[:0-len('_f_max')];
            # This adjustment dance is required because of inexact database
            #   matches.
            max_value = getRequest[key];
            d = decimal.Decimal(max_value);
            delta = 10**d.as_tuple().exponent;
            modified_max_value = str(d + decimal.Decimal(delta));
            execList = { 'featuresmeans__' + feature + '__lt':modified_max_value };
            # dbRecords = dbRecords.filter(**execList);
            if feature not in featuresRange:
                featuresRange[feature] = {};
            featuresRange[feature]['max'] = max_value;
    return {'db': dbRecords, 'ranges': featuresRange };

def constructSearchContext(filterIn, zenodoIn, selectedFeatures, context):
    # Input is a dictionary with keys 'header', 'data', 'zenodo_header', and
    #   'zenodo_data'
    global timestampIdx;
    global zenodoIdx;
    # Clone the list of names for header processing
    header = filterIn['header'][:];
    resultData = filterIn['data'];
    zenodoHeader = zenodoIn['zenodo_header'];
    zenodoData = zenodoIn['zenodo_data'];

    # We're gonna offload the construction of URL and File Type information to
    #   the client in this version.
    transformTimestamps(resultData, timestampIdx);
    fileTypeIdToName(zenodoData, filetypeIdx);

    # Cross-reference zenodo ids to get max file size
    zenodoDict = {};
    for fileRecord in zenodoData:
        if fileRecord[0] not in zenodoDict and fileRecord[0] != None:
            zenodoDict[fileRecord[0]] = [];
        if fileRecord[0] != None:
            zenodoDict[fileRecord[0]].append(fileRecord[-3:]);
    header.append('filesize');
    header.append('numfiles');
    for experiment in resultData:
        numFiles = 0;
        totalFileSize = 0;
        if experiment[zenodoIdx] != None:
            numFiles = len(zenodoDict[experiment[zenodoIdx]]);
            for file in zenodoDict[experiment[zenodoIdx]]:
                totalFileSize += file[0];
        experiment.append(totalFileSize);
        experiment.append(numFiles);

    returnTable = [dict(zip(header,row)) for row in noneToText(resultData)];
    returnTable = eliminateEmptySelectedFeatureRows(selectedFeatures, returnTable);
    results_count = len(returnTable);

    context['selected_features_names'] = selectedFeatures;
    context['data_header'] = header;
    context['results_list'] = returnTable;
    context['zenodo_header'] = zenodoHeader;
    context['zenodo_data'] = zenodoData;
    context['results_count'] = results_count;

def constructDownloadContext(inData, context):
    # Input is a dictionary with keys 'header', 'data', 'zenodo_header', and
    #   'zenodo_data'
    global downloadTimestampIdx;
    # Clone the list of names for header processing
    header = inData['header'][:];
    resultData = inData['data'];

    # Since this operation is expected to be data-intensive, we should attempt
    #   to send processed data to the client in a form that requires no
    #   post-processing of derived data to generate a CSV for download.
    prettyTimestamps(resultData, downloadTimestampIdx);
    returnTable = noneToText(resultData);

    # *CWL* TODOS **************************
    # The data should initially include the crossfilter features with ranges.
    # Records should be eliminated if outside the crossfilter feature ranges.
    # Columns with crossfilter features data should be eliminated.

    context['download_header'] = header;
    context['download_data'] = returnTable;

# Create your views here.
def wconviewer(request):
    context = {};
    # Get tool version
    context['version'] = getVersion();
    return render(request, 'webworm/wcon-viewer.html', context);

def upload(request):
    context = {};
    # Get tool version
    context['version'] = getVersion();
#    if request.method == "POST":
#        emailBody = '';
#        emailBody += 'Requester Email Contact: ' + request.POST['upload_email'] + '\n';
#        emailBody += 'Requester Data URL: ' + request.POST['upload_url'] + '\n';
#        emailBody += 'Comments:\n' + request.POST['upload_notes'];
#        email = EmailMessage('Worm Database: Upload request received', emailBody, 
#                             to=['cheelee@openworm.org'])
# Disable for now
#        email.send()
#        context['upload_received'] = 'true';
    return render(request, 'webworm/upload.html', context);

def feedback(request):
    context = {};
    # Get tool version
    context['version'] = getVersion();
    return render(request, 'webworm/feedback.html', context);

def contrib(request):
    context = {};
    # Get tool version
    context['version'] = getVersion();
    return render(request, 'webworm/contributors.html', context);

def release(request):
    context = {};
    # Get tool version
    context['version'] = getVersion();
    # Get release notes text
    with open('webworm/ReleaseNotes.md', 'r') as releaseNotes:
        context['content'] = releaseNotes.read();
    return render(request, 'webworm/release-notes.html', context);

def index(request):
    global defaultCoreFeatures;
    global fileTypes;
    # Context variables to be passed to client for rendering and client-side processing
    context = {};

    # Get tool version
    context['version'] = getVersion();

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

    # Produce information about file types
    filetypesDb = FileTypes.objects.all();
    fileTypes = dict((id,name) for id,name in filetypesDb.values_list('id','name'));
    context['file_types'] = [fileTypes[id] for id in fileTypes];

    returnList = [];
    # If anything else loads, loadDefault is set to False
    loadDefault = True;
    featuresToCrossfilter = defaultCoreFeatures;
    filterState = {};
    filterState['filteredFeatures'] = {};
    if request.method == "GET":
        if (request.GET.__contains__("search")):
            loadDefault = False;
            filteredDb = processMainGetRequest(request.GET, 
                                               Experiments.objects.order_by('strain__name'),
                                               filterState);
            selectedFeatures = getFeaturesNamesFromGet(request.GET, '_isFeature');
            for feature in selectedFeatures:
                filterState['filteredFeatures'][feature] = '1';
            filteredData = getDataWithFeatures(selectedFeatures, filteredDb, fieldHeaders);
            zenodoData = getZenodoData(selectedFeatures, filteredDb);
            constructSearchContext(filteredData, zenodoData, selectedFeatures, context);
            # This is going to have to be a re-package of the desired advanced filter parameters
            context['prev_advanced_filter_state'] = filterState;
            # Process download requests
            if (request.GET.__contains__("download")):
                downloadResults = processDownloadGetRequest(request.GET, filteredDb);
                filteredDb = downloadResults['db'];
                xfRanges = downloadResults['ranges'];
                downloadFeatures = getFeaturesNamesFromGet(request.GET, '_isDownload');
                xfList = [];
                # The reason we have to get the appropriate crossfilter data extracted
                #   is so we can perform exact-range matches outside of the database.
                # We hack this by tacking on the features attributed to crossfilters
                #   to the end of the list of download features.
                # After the range elimination operations are done, we strip away
                #   the columns containing crossfilter features.
                for xf_feature, range in xfRanges.items():
                    xfList.append(xf_feature);
                    downloadFeatures.append(xf_feature);
                downloadData = getDataWithFeatures(downloadFeatures, filteredDb, downloadHeaders);
                downloadData = applyXfRangeToDownload(downloadData, xfList, xfRanges);
                constructDownloadContext(downloadData, context);

    # If the previous phase did not result in any loads from the database, load default
    if loadDefault:
        # All experiments are chosen by default
        filteredDb = Experiments.objects.order_by('base_name');
        experimentsData = getDataWithFeatures(defaultCoreFeatures, filteredDb, fieldHeaders);
        zenodoData = getZenodoData(defaultCoreFeatures, filteredDb);
        constructSearchContext(experimentsData, zenodoData, defaultCoreFeatures, context);
        for feature in defaultCoreFeatures:
            filterState['filteredFeatures'][feature] = '1';
        context['prev_advanced_filter_state'] = filterState;

    # Produce static database context information
    context['db_experiment_count'] = db_experiment_count;
    context['min_date'] = experiment_date_min;
    context['max_date'] = experiment_date_max;
    return render(request, 'webworm/index.html', context);
