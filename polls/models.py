# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models


class Alleles(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name
    class Meta:
        db_table = 'alleles'
        verbose_name_plural = 'Alleles'


class Arenas(models.Model):
    name = models.CharField(unique=True, max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name
    class Meta:
        db_table = 'arenas'
        verbose_name_plural = 'Arenas'


class DevelopmentalStages(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name
    class Meta:
        db_table = 'developmental_stages'
        verbose_name_plural = 'Developmental Stages'


class ExitFlags(models.Model):
    name = models.CharField(max_length=100)
    track_checkpoint = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name
    class Meta:
        db_table = 'exit_flags'
        verbose_name_plural = 'Exit Flags'


class Experimenters(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name
    class Meta:
        db_table = 'experimenters'
        verbose_name_plural = 'Experimenters'


class Experiments(models.Model):
    base_name = models.CharField(unique=True, max_length=200)
    date = models.DateTimeField(blank=True, null=True)
    strain = models.ForeignKey('Strains', models.DO_NOTHING)
    tracker = models.ForeignKey('Trackers', models.DO_NOTHING)
    sex = models.ForeignKey('Sexes', models.DO_NOTHING)
    developmental_stage = models.ForeignKey(DevelopmentalStages, models.DO_NOTHING)
    ventral_side = models.ForeignKey('VentralSides', models.DO_NOTHING)
    food = models.ForeignKey('Foods', models.DO_NOTHING)
    arena = models.ForeignKey(Arenas, models.DO_NOTHING)
    habituation = models.ForeignKey('Habituations', models.DO_NOTHING)
    experimenter = models.ForeignKey(Experimenters, models.DO_NOTHING)

    def __str__(self):
        return self.base_name
    class Meta:
        db_table = 'experiments'
        verbose_name_plural = 'Experiments'

class Foods(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)
    
    def __str__(self):
        return self.name

    class Meta:
        db_table = 'foods'
        verbose_name_plural = 'Foods'


class Genes(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'genes'
        verbose_name_plural = 'Genes'

class Habituations(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'habituations'
        verbose_name_plural = 'Habituations'


class OriginalVideos(models.Model):
    experiment = models.ForeignKey(Experiments, models.DO_NOTHING, primary_key=True)
    name = models.CharField(unique=True, max_length=200)
    directory = models.CharField(max_length=500)
    sizemb = models.FloatField(db_column='sizeMB', blank=True, null=True)  # Field name made lowercase.

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'original_videos'
        verbose_name_plural = 'Original Videos'


class ProgressMasks(models.Model):
    experiment = models.ForeignKey(Experiments, models.DO_NOTHING, primary_key=True)
    exit_flag = models.ForeignKey(ExitFlags, models.DO_NOTHING, blank=True, null=True)
    mask_file = models.CharField(max_length=500, blank=True, null=True)
    n_valid_frames = models.IntegerField(blank=True, null=True)
    n_missing_frames = models.IntegerField(blank=True, null=True)
    fps = models.FloatField(blank=True, null=True)
    total_time = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = 'progress_masks'
        verbose_name_plural = 'Progress Masks'


class ProgressTracks(models.Model):
    experiment = models.ForeignKey(Experiments, models.DO_NOTHING, primary_key=True)
    exit_flag = models.ForeignKey(ExitFlags, models.DO_NOTHING, blank=True, null=True)
    skeletons_file = models.CharField(max_length=500, blank=True, null=True)
    features_file = models.CharField(max_length=500, blank=True, null=True)
    n_segmented_skeletons = models.IntegerField(blank=True, null=True)
    n_filtered_skeletons = models.IntegerField(blank=True, null=True)
    n_valid_skeletons = models.IntegerField(blank=True, null=True)
    n_timestamps = models.IntegerField(blank=True, null=True)
    first_frame = models.IntegerField(blank=True, null=True)
    last_frame = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'progress_tracks'
        verbose_name_plural = 'Progress Tracks'


class SegwormComparisons(models.Model):
    experiment = models.ForeignKey(Experiments, models.DO_NOTHING, blank=True, null=True)
    segworm_feature = models.ForeignKey('SegwormFeatures', models.DO_NOTHING, blank=True, null=True)
    n_mutual_skeletons = models.IntegerField(blank=True, null=True)
    error_05th = models.FloatField(blank=True, null=True)
    error_50th = models.FloatField(blank=True, null=True)
    error_95th = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = 'segworm_comparisons'
        verbose_name_plural = 'Segworm Comparisons'


class SegwormFeatures(models.Model):
    file_name = models.CharField(max_length=500)
    experiment = models.ForeignKey(Experiments, models.DO_NOTHING, blank=True, null=True)
    fps = models.FloatField(blank=True, null=True)
    total_time = models.FloatField(blank=True, null=True)
    n_valid_skeletons = models.IntegerField(blank=True, null=True)
    n_timestamps = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.file_name
    
    class Meta:
        db_table = 'segworm_features'
        verbose_name_plural = 'Segworm Features'


class Sexes(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'sexes'
        verbose_name_plural = 'Sexes'


class Strains(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)
    genotype = models.CharField(max_length=200, blank=True, null=True)
    gene = models.ForeignKey(Genes, models.DO_NOTHING)
    allele = models.ForeignKey(Alleles, models.DO_NOTHING)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'strains'
        verbose_name_plural = 'Strains'


class Trackers(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'trackers'
        verbose_name_plural = 'Trackers'


class VentralSides(models.Model):
    name = models.CharField(unique=True, max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'ventral_sides'
        verbose_name_plural = 'Ventral Sides'
