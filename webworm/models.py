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
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'alleles'


class Arenas(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'arenas'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=80)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Chromosomes(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'chromosomes'


class DevelopmentalStages(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'developmental_stages'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class ExitFlags(models.Model):
    name = models.CharField(unique=True, max_length=30)
    description = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'exit_flags'


class Experimenters(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'experimenters'


class Experiments(models.Model):
    base_name = models.CharField(unique=True, max_length=200)
    date = models.DateTimeField(blank=True, null=True)
    strain = models.ForeignKey('Strains', models.DO_NOTHING, blank=True, null=True)
    tracker = models.ForeignKey('Trackers', models.DO_NOTHING, blank=True, null=True)
    sex = models.ForeignKey('Sexes', models.DO_NOTHING, blank=True, null=True)
    developmental_stage = models.ForeignKey(DevelopmentalStages, models.DO_NOTHING, blank=True, null=True)
    ventral_side = models.ForeignKey('VentralSides', models.DO_NOTHING, blank=True, null=True)
    food = models.ForeignKey('Foods', models.DO_NOTHING, blank=True, null=True)
    arena = models.ForeignKey(Arenas, models.DO_NOTHING, blank=True, null=True)
    habituation = models.ForeignKey('Habituations', models.DO_NOTHING, blank=True, null=True)
    experimenter = models.ForeignKey(Experimenters, models.DO_NOTHING, blank=True, null=True)
    # *CWL* Manual change made from 700 to 255 here because of complaints from MySQL
    original_video = models.CharField(unique=True, max_length=255)
    original_video_sizemb = models.FloatField(db_column='original_video_sizeMB', blank=True, null=True)  # Field name made lowercase.
    exit_flag = models.ForeignKey(ExitFlags, models.DO_NOTHING)
    results_dir = models.CharField(max_length=200, blank=True, null=True)
    youtube_id = models.CharField(max_length=40, blank=True, null=True)
    zenodo_id = models.CharField(max_length=40, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'experiments'


class Features(models.Model):
    name = models.CharField(unique=True, max_length=50, blank=True, null=True)
    description = models.CharField(max_length=200, blank=True, null=True)
    is_core_feature = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'features'


class FeaturesMeans(models.Model):
    experiment = models.OneToOneField(Experiments, models.DO_NOTHING, unique=True, blank=True, null=True)
    worm_index = models.FloatField(blank=True, null=True)
    n_frames = models.FloatField(blank=True, null=True)
    n_valid_skel = models.FloatField(blank=True, null=True)
    first_frame = models.FloatField(blank=True, null=True)
    worm_dwelling = models.FloatField(blank=True, null=True)
    head_dwelling = models.FloatField(blank=True, null=True)
    midbody_dwelling = models.FloatField(blank=True, null=True)
    tail_dwelling = models.FloatField(blank=True, null=True)
    length = models.FloatField(blank=True, null=True)
    length_forward = models.FloatField(blank=True, null=True)
    length_paused = models.FloatField(blank=True, null=True)
    length_backward = models.FloatField(blank=True, null=True)
    head_width = models.FloatField(blank=True, null=True)
    head_width_forward = models.FloatField(blank=True, null=True)
    head_width_paused = models.FloatField(blank=True, null=True)
    head_width_backward = models.FloatField(blank=True, null=True)
    midbody_width = models.FloatField(blank=True, null=True)
    midbody_width_forward = models.FloatField(blank=True, null=True)
    midbody_width_paused = models.FloatField(blank=True, null=True)
    midbody_width_backward = models.FloatField(blank=True, null=True)
    tail_width = models.FloatField(blank=True, null=True)
    tail_width_forward = models.FloatField(blank=True, null=True)
    tail_width_paused = models.FloatField(blank=True, null=True)
    tail_width_backward = models.FloatField(blank=True, null=True)
    area = models.FloatField(blank=True, null=True)
    area_forward = models.FloatField(blank=True, null=True)
    area_paused = models.FloatField(blank=True, null=True)
    area_backward = models.FloatField(blank=True, null=True)
    area_length_ratio = models.FloatField(blank=True, null=True)
    area_length_ratio_forward = models.FloatField(blank=True, null=True)
    area_length_ratio_paused = models.FloatField(blank=True, null=True)
    area_length_ratio_backward = models.FloatField(blank=True, null=True)
    width_length_ratio = models.FloatField(blank=True, null=True)
    width_length_ratio_forward = models.FloatField(blank=True, null=True)
    width_length_ratio_paused = models.FloatField(blank=True, null=True)
    width_length_ratio_backward = models.FloatField(blank=True, null=True)
    head_bend_mean = models.FloatField(blank=True, null=True)
    head_bend_mean_abs = models.FloatField(blank=True, null=True)
    head_bend_mean_neg = models.FloatField(blank=True, null=True)
    head_bend_mean_pos = models.FloatField(blank=True, null=True)
    head_bend_mean_forward = models.FloatField(blank=True, null=True)
    head_bend_mean_forward_abs = models.FloatField(blank=True, null=True)
    head_bend_mean_forward_neg = models.FloatField(blank=True, null=True)
    head_bend_mean_forward_pos = models.FloatField(blank=True, null=True)
    head_bend_mean_paused = models.FloatField(blank=True, null=True)
    head_bend_mean_paused_abs = models.FloatField(blank=True, null=True)
    head_bend_mean_paused_neg = models.FloatField(blank=True, null=True)
    head_bend_mean_paused_pos = models.FloatField(blank=True, null=True)
    head_bend_mean_backward = models.FloatField(blank=True, null=True)
    head_bend_mean_backward_abs = models.FloatField(blank=True, null=True)
    head_bend_mean_backward_neg = models.FloatField(blank=True, null=True)
    head_bend_mean_backward_pos = models.FloatField(blank=True, null=True)
    neck_bend_mean = models.FloatField(blank=True, null=True)
    neck_bend_mean_abs = models.FloatField(blank=True, null=True)
    neck_bend_mean_neg = models.FloatField(blank=True, null=True)
    neck_bend_mean_pos = models.FloatField(blank=True, null=True)
    neck_bend_mean_forward = models.FloatField(blank=True, null=True)
    neck_bend_mean_forward_abs = models.FloatField(blank=True, null=True)
    neck_bend_mean_forward_neg = models.FloatField(blank=True, null=True)
    neck_bend_mean_forward_pos = models.FloatField(blank=True, null=True)
    neck_bend_mean_paused = models.FloatField(blank=True, null=True)
    neck_bend_mean_paused_abs = models.FloatField(blank=True, null=True)
    neck_bend_mean_paused_neg = models.FloatField(blank=True, null=True)
    neck_bend_mean_paused_pos = models.FloatField(blank=True, null=True)
    neck_bend_mean_backward = models.FloatField(blank=True, null=True)
    neck_bend_mean_backward_abs = models.FloatField(blank=True, null=True)
    neck_bend_mean_backward_neg = models.FloatField(blank=True, null=True)
    neck_bend_mean_backward_pos = models.FloatField(blank=True, null=True)
    midbody_bend_mean = models.FloatField(blank=True, null=True)
    midbody_bend_mean_abs = models.FloatField(blank=True, null=True)
    midbody_bend_mean_neg = models.FloatField(blank=True, null=True)
    midbody_bend_mean_pos = models.FloatField(blank=True, null=True)
    midbody_bend_mean_forward = models.FloatField(blank=True, null=True)
    midbody_bend_mean_forward_abs = models.FloatField(blank=True, null=True)
    midbody_bend_mean_forward_neg = models.FloatField(blank=True, null=True)
    midbody_bend_mean_forward_pos = models.FloatField(blank=True, null=True)
    midbody_bend_mean_paused = models.FloatField(blank=True, null=True)
    midbody_bend_mean_paused_abs = models.FloatField(blank=True, null=True)
    midbody_bend_mean_paused_neg = models.FloatField(blank=True, null=True)
    midbody_bend_mean_paused_pos = models.FloatField(blank=True, null=True)
    midbody_bend_mean_backward = models.FloatField(blank=True, null=True)
    midbody_bend_mean_backward_abs = models.FloatField(blank=True, null=True)
    midbody_bend_mean_backward_neg = models.FloatField(blank=True, null=True)
    midbody_bend_mean_backward_pos = models.FloatField(blank=True, null=True)
    hips_bend_mean = models.FloatField(blank=True, null=True)
    hips_bend_mean_abs = models.FloatField(blank=True, null=True)
    hips_bend_mean_neg = models.FloatField(blank=True, null=True)
    hips_bend_mean_pos = models.FloatField(blank=True, null=True)
    hips_bend_mean_forward = models.FloatField(blank=True, null=True)
    hips_bend_mean_forward_abs = models.FloatField(blank=True, null=True)
    hips_bend_mean_forward_neg = models.FloatField(blank=True, null=True)
    hips_bend_mean_forward_pos = models.FloatField(blank=True, null=True)
    hips_bend_mean_paused = models.FloatField(blank=True, null=True)
    hips_bend_mean_paused_abs = models.FloatField(blank=True, null=True)
    hips_bend_mean_paused_neg = models.FloatField(blank=True, null=True)
    hips_bend_mean_paused_pos = models.FloatField(blank=True, null=True)
    hips_bend_mean_backward = models.FloatField(blank=True, null=True)
    hips_bend_mean_backward_abs = models.FloatField(blank=True, null=True)
    hips_bend_mean_backward_neg = models.FloatField(blank=True, null=True)
    hips_bend_mean_backward_pos = models.FloatField(blank=True, null=True)
    tail_bend_mean = models.FloatField(blank=True, null=True)
    tail_bend_mean_abs = models.FloatField(blank=True, null=True)
    tail_bend_mean_neg = models.FloatField(blank=True, null=True)
    tail_bend_mean_pos = models.FloatField(blank=True, null=True)
    tail_bend_mean_forward = models.FloatField(blank=True, null=True)
    tail_bend_mean_forward_abs = models.FloatField(blank=True, null=True)
    tail_bend_mean_forward_neg = models.FloatField(blank=True, null=True)
    tail_bend_mean_forward_pos = models.FloatField(blank=True, null=True)
    tail_bend_mean_paused = models.FloatField(blank=True, null=True)
    tail_bend_mean_paused_abs = models.FloatField(blank=True, null=True)
    tail_bend_mean_paused_neg = models.FloatField(blank=True, null=True)
    tail_bend_mean_paused_pos = models.FloatField(blank=True, null=True)
    tail_bend_mean_backward = models.FloatField(blank=True, null=True)
    tail_bend_mean_backward_abs = models.FloatField(blank=True, null=True)
    tail_bend_mean_backward_neg = models.FloatField(blank=True, null=True)
    tail_bend_mean_backward_pos = models.FloatField(blank=True, null=True)
    head_bend_sd = models.FloatField(blank=True, null=True)
    head_bend_sd_abs = models.FloatField(blank=True, null=True)
    head_bend_sd_neg = models.FloatField(blank=True, null=True)
    head_bend_sd_pos = models.FloatField(blank=True, null=True)
    head_bend_sd_forward = models.FloatField(blank=True, null=True)
    head_bend_sd_forward_abs = models.FloatField(blank=True, null=True)
    head_bend_sd_forward_neg = models.FloatField(blank=True, null=True)
    head_bend_sd_forward_pos = models.FloatField(blank=True, null=True)
    head_bend_sd_paused = models.FloatField(blank=True, null=True)
    head_bend_sd_paused_abs = models.FloatField(blank=True, null=True)
    head_bend_sd_paused_neg = models.FloatField(blank=True, null=True)
    head_bend_sd_paused_pos = models.FloatField(blank=True, null=True)
    head_bend_sd_backward = models.FloatField(blank=True, null=True)
    head_bend_sd_backward_abs = models.FloatField(blank=True, null=True)
    head_bend_sd_backward_neg = models.FloatField(blank=True, null=True)
    head_bend_sd_backward_pos = models.FloatField(blank=True, null=True)
    neck_bend_sd = models.FloatField(blank=True, null=True)
    neck_bend_sd_abs = models.FloatField(blank=True, null=True)
    neck_bend_sd_neg = models.FloatField(blank=True, null=True)
    neck_bend_sd_pos = models.FloatField(blank=True, null=True)
    neck_bend_sd_forward = models.FloatField(blank=True, null=True)
    neck_bend_sd_forward_abs = models.FloatField(blank=True, null=True)
    neck_bend_sd_forward_neg = models.FloatField(blank=True, null=True)
    neck_bend_sd_forward_pos = models.FloatField(blank=True, null=True)
    neck_bend_sd_paused = models.FloatField(blank=True, null=True)
    neck_bend_sd_paused_abs = models.FloatField(blank=True, null=True)
    neck_bend_sd_paused_neg = models.FloatField(blank=True, null=True)
    neck_bend_sd_paused_pos = models.FloatField(blank=True, null=True)
    neck_bend_sd_backward = models.FloatField(blank=True, null=True)
    neck_bend_sd_backward_abs = models.FloatField(blank=True, null=True)
    neck_bend_sd_backward_neg = models.FloatField(blank=True, null=True)
    neck_bend_sd_backward_pos = models.FloatField(blank=True, null=True)
    midbody_bend_sd = models.FloatField(blank=True, null=True)
    midbody_bend_sd_abs = models.FloatField(blank=True, null=True)
    midbody_bend_sd_neg = models.FloatField(blank=True, null=True)
    midbody_bend_sd_pos = models.FloatField(blank=True, null=True)
    midbody_bend_sd_forward = models.FloatField(blank=True, null=True)
    midbody_bend_sd_forward_abs = models.FloatField(blank=True, null=True)
    midbody_bend_sd_forward_neg = models.FloatField(blank=True, null=True)
    midbody_bend_sd_forward_pos = models.FloatField(blank=True, null=True)
    midbody_bend_sd_paused = models.FloatField(blank=True, null=True)
    midbody_bend_sd_paused_abs = models.FloatField(blank=True, null=True)
    midbody_bend_sd_paused_neg = models.FloatField(blank=True, null=True)
    midbody_bend_sd_paused_pos = models.FloatField(blank=True, null=True)
    midbody_bend_sd_backward = models.FloatField(blank=True, null=True)
    midbody_bend_sd_backward_abs = models.FloatField(blank=True, null=True)
    midbody_bend_sd_backward_neg = models.FloatField(blank=True, null=True)
    midbody_bend_sd_backward_pos = models.FloatField(blank=True, null=True)
    hips_bend_sd = models.FloatField(blank=True, null=True)
    hips_bend_sd_abs = models.FloatField(blank=True, null=True)
    hips_bend_sd_neg = models.FloatField(blank=True, null=True)
    hips_bend_sd_pos = models.FloatField(blank=True, null=True)
    hips_bend_sd_forward = models.FloatField(blank=True, null=True)
    hips_bend_sd_forward_abs = models.FloatField(blank=True, null=True)
    hips_bend_sd_forward_neg = models.FloatField(blank=True, null=True)
    hips_bend_sd_forward_pos = models.FloatField(blank=True, null=True)
    hips_bend_sd_paused = models.FloatField(blank=True, null=True)
    hips_bend_sd_paused_abs = models.FloatField(blank=True, null=True)
    hips_bend_sd_paused_neg = models.FloatField(blank=True, null=True)
    hips_bend_sd_paused_pos = models.FloatField(blank=True, null=True)
    hips_bend_sd_backward = models.FloatField(blank=True, null=True)
    hips_bend_sd_backward_abs = models.FloatField(blank=True, null=True)
    hips_bend_sd_backward_neg = models.FloatField(blank=True, null=True)
    hips_bend_sd_backward_pos = models.FloatField(blank=True, null=True)
    tail_bend_sd = models.FloatField(blank=True, null=True)
    tail_bend_sd_abs = models.FloatField(blank=True, null=True)
    tail_bend_sd_neg = models.FloatField(blank=True, null=True)
    tail_bend_sd_pos = models.FloatField(blank=True, null=True)
    tail_bend_sd_forward = models.FloatField(blank=True, null=True)
    tail_bend_sd_forward_abs = models.FloatField(blank=True, null=True)
    tail_bend_sd_forward_neg = models.FloatField(blank=True, null=True)
    tail_bend_sd_forward_pos = models.FloatField(blank=True, null=True)
    tail_bend_sd_paused = models.FloatField(blank=True, null=True)
    tail_bend_sd_paused_abs = models.FloatField(blank=True, null=True)
    tail_bend_sd_paused_neg = models.FloatField(blank=True, null=True)
    tail_bend_sd_paused_pos = models.FloatField(blank=True, null=True)
    tail_bend_sd_backward = models.FloatField(blank=True, null=True)
    tail_bend_sd_backward_abs = models.FloatField(blank=True, null=True)
    tail_bend_sd_backward_neg = models.FloatField(blank=True, null=True)
    tail_bend_sd_backward_pos = models.FloatField(blank=True, null=True)
    max_amplitude = models.FloatField(blank=True, null=True)
    max_amplitude_forward = models.FloatField(blank=True, null=True)
    max_amplitude_paused = models.FloatField(blank=True, null=True)
    max_amplitude_backward = models.FloatField(blank=True, null=True)
    amplitude_ratio = models.FloatField(blank=True, null=True)
    amplitude_ratio_forward = models.FloatField(blank=True, null=True)
    amplitude_ratio_paused = models.FloatField(blank=True, null=True)
    amplitude_ratio_backward = models.FloatField(blank=True, null=True)
    primary_wavelength = models.FloatField(blank=True, null=True)
    primary_wavelength_forward = models.FloatField(blank=True, null=True)
    primary_wavelength_paused = models.FloatField(blank=True, null=True)
    primary_wavelength_backward = models.FloatField(blank=True, null=True)
    secondary_wavelength = models.FloatField(blank=True, null=True)
    secondary_wavelength_forward = models.FloatField(blank=True, null=True)
    secondary_wavelength_paused = models.FloatField(blank=True, null=True)
    secondary_wavelength_backward = models.FloatField(blank=True, null=True)
    track_length = models.FloatField(blank=True, null=True)
    track_length_forward = models.FloatField(blank=True, null=True)
    track_length_paused = models.FloatField(blank=True, null=True)
    track_length_backward = models.FloatField(blank=True, null=True)
    eccentricity = models.FloatField(blank=True, null=True)
    eccentricity_forward = models.FloatField(blank=True, null=True)
    eccentricity_paused = models.FloatField(blank=True, null=True)
    eccentricity_backward = models.FloatField(blank=True, null=True)
    bend_count = models.FloatField(blank=True, null=True)
    bend_count_forward = models.FloatField(blank=True, null=True)
    bend_count_paused = models.FloatField(blank=True, null=True)
    bend_count_backward = models.FloatField(blank=True, null=True)
    tail_to_head_orientation = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_abs = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_neg = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_pos = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_forward = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_forward_abs = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_forward_neg = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_forward_pos = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_paused = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_paused_abs = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_paused_neg = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_paused_pos = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_backward = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_backward_abs = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_backward_neg = models.FloatField(blank=True, null=True)
    tail_to_head_orientation_backward_pos = models.FloatField(blank=True, null=True)
    head_orientation = models.FloatField(blank=True, null=True)
    head_orientation_abs = models.FloatField(blank=True, null=True)
    head_orientation_neg = models.FloatField(blank=True, null=True)
    head_orientation_pos = models.FloatField(blank=True, null=True)
    head_orientation_forward = models.FloatField(blank=True, null=True)
    head_orientation_forward_abs = models.FloatField(blank=True, null=True)
    head_orientation_forward_neg = models.FloatField(blank=True, null=True)
    head_orientation_forward_pos = models.FloatField(blank=True, null=True)
    head_orientation_paused = models.FloatField(blank=True, null=True)
    head_orientation_paused_abs = models.FloatField(blank=True, null=True)
    head_orientation_paused_neg = models.FloatField(blank=True, null=True)
    head_orientation_paused_pos = models.FloatField(blank=True, null=True)
    head_orientation_backward = models.FloatField(blank=True, null=True)
    head_orientation_backward_abs = models.FloatField(blank=True, null=True)
    head_orientation_backward_neg = models.FloatField(blank=True, null=True)
    head_orientation_backward_pos = models.FloatField(blank=True, null=True)
    tail_orientation = models.FloatField(blank=True, null=True)
    tail_orientation_abs = models.FloatField(blank=True, null=True)
    tail_orientation_neg = models.FloatField(blank=True, null=True)
    tail_orientation_pos = models.FloatField(blank=True, null=True)
    tail_orientation_forward = models.FloatField(blank=True, null=True)
    tail_orientation_forward_abs = models.FloatField(blank=True, null=True)
    tail_orientation_forward_neg = models.FloatField(blank=True, null=True)
    tail_orientation_forward_pos = models.FloatField(blank=True, null=True)
    tail_orientation_paused = models.FloatField(blank=True, null=True)
    tail_orientation_paused_abs = models.FloatField(blank=True, null=True)
    tail_orientation_paused_neg = models.FloatField(blank=True, null=True)
    tail_orientation_paused_pos = models.FloatField(blank=True, null=True)
    tail_orientation_backward = models.FloatField(blank=True, null=True)
    tail_orientation_backward_abs = models.FloatField(blank=True, null=True)
    tail_orientation_backward_neg = models.FloatField(blank=True, null=True)
    tail_orientation_backward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_1 = models.FloatField(blank=True, null=True)
    eigen_projection_1_abs = models.FloatField(blank=True, null=True)
    eigen_projection_1_neg = models.FloatField(blank=True, null=True)
    eigen_projection_1_pos = models.FloatField(blank=True, null=True)
    eigen_projection_1_forward = models.FloatField(blank=True, null=True)
    eigen_projection_1_forward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_1_forward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_1_forward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_1_paused = models.FloatField(blank=True, null=True)
    eigen_projection_1_paused_abs = models.FloatField(blank=True, null=True)
    eigen_projection_1_paused_neg = models.FloatField(blank=True, null=True)
    eigen_projection_1_paused_pos = models.FloatField(blank=True, null=True)
    eigen_projection_1_backward = models.FloatField(blank=True, null=True)
    eigen_projection_1_backward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_1_backward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_1_backward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_2 = models.FloatField(blank=True, null=True)
    eigen_projection_2_abs = models.FloatField(blank=True, null=True)
    eigen_projection_2_neg = models.FloatField(blank=True, null=True)
    eigen_projection_2_pos = models.FloatField(blank=True, null=True)
    eigen_projection_2_forward = models.FloatField(blank=True, null=True)
    eigen_projection_2_forward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_2_forward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_2_forward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_2_paused = models.FloatField(blank=True, null=True)
    eigen_projection_2_paused_abs = models.FloatField(blank=True, null=True)
    eigen_projection_2_paused_neg = models.FloatField(blank=True, null=True)
    eigen_projection_2_paused_pos = models.FloatField(blank=True, null=True)
    eigen_projection_2_backward = models.FloatField(blank=True, null=True)
    eigen_projection_2_backward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_2_backward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_2_backward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_3 = models.FloatField(blank=True, null=True)
    eigen_projection_3_abs = models.FloatField(blank=True, null=True)
    eigen_projection_3_neg = models.FloatField(blank=True, null=True)
    eigen_projection_3_pos = models.FloatField(blank=True, null=True)
    eigen_projection_3_forward = models.FloatField(blank=True, null=True)
    eigen_projection_3_forward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_3_forward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_3_forward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_3_paused = models.FloatField(blank=True, null=True)
    eigen_projection_3_paused_abs = models.FloatField(blank=True, null=True)
    eigen_projection_3_paused_neg = models.FloatField(blank=True, null=True)
    eigen_projection_3_paused_pos = models.FloatField(blank=True, null=True)
    eigen_projection_3_backward = models.FloatField(blank=True, null=True)
    eigen_projection_3_backward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_3_backward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_3_backward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_4 = models.FloatField(blank=True, null=True)
    eigen_projection_4_abs = models.FloatField(blank=True, null=True)
    eigen_projection_4_neg = models.FloatField(blank=True, null=True)
    eigen_projection_4_pos = models.FloatField(blank=True, null=True)
    eigen_projection_4_forward = models.FloatField(blank=True, null=True)
    eigen_projection_4_forward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_4_forward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_4_forward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_4_paused = models.FloatField(blank=True, null=True)
    eigen_projection_4_paused_abs = models.FloatField(blank=True, null=True)
    eigen_projection_4_paused_neg = models.FloatField(blank=True, null=True)
    eigen_projection_4_paused_pos = models.FloatField(blank=True, null=True)
    eigen_projection_4_backward = models.FloatField(blank=True, null=True)
    eigen_projection_4_backward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_4_backward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_4_backward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_5 = models.FloatField(blank=True, null=True)
    eigen_projection_5_abs = models.FloatField(blank=True, null=True)
    eigen_projection_5_neg = models.FloatField(blank=True, null=True)
    eigen_projection_5_pos = models.FloatField(blank=True, null=True)
    eigen_projection_5_forward = models.FloatField(blank=True, null=True)
    eigen_projection_5_forward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_5_forward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_5_forward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_5_paused = models.FloatField(blank=True, null=True)
    eigen_projection_5_paused_abs = models.FloatField(blank=True, null=True)
    eigen_projection_5_paused_neg = models.FloatField(blank=True, null=True)
    eigen_projection_5_paused_pos = models.FloatField(blank=True, null=True)
    eigen_projection_5_backward = models.FloatField(blank=True, null=True)
    eigen_projection_5_backward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_5_backward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_5_backward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_6 = models.FloatField(blank=True, null=True)
    eigen_projection_6_abs = models.FloatField(blank=True, null=True)
    eigen_projection_6_neg = models.FloatField(blank=True, null=True)
    eigen_projection_6_pos = models.FloatField(blank=True, null=True)
    eigen_projection_6_forward = models.FloatField(blank=True, null=True)
    eigen_projection_6_forward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_6_forward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_6_forward_pos = models.FloatField(blank=True, null=True)
    eigen_projection_6_paused = models.FloatField(blank=True, null=True)
    eigen_projection_6_paused_abs = models.FloatField(blank=True, null=True)
    eigen_projection_6_paused_neg = models.FloatField(blank=True, null=True)
    eigen_projection_6_paused_pos = models.FloatField(blank=True, null=True)
    eigen_projection_6_backward = models.FloatField(blank=True, null=True)
    eigen_projection_6_backward_abs = models.FloatField(blank=True, null=True)
    eigen_projection_6_backward_neg = models.FloatField(blank=True, null=True)
    eigen_projection_6_backward_pos = models.FloatField(blank=True, null=True)
    head_tip_speed = models.FloatField(blank=True, null=True)
    head_tip_speed_abs = models.FloatField(blank=True, null=True)
    head_tip_speed_neg = models.FloatField(blank=True, null=True)
    head_tip_speed_pos = models.FloatField(blank=True, null=True)
    head_tip_speed_forward = models.FloatField(blank=True, null=True)
    head_tip_speed_forward_abs = models.FloatField(blank=True, null=True)
    head_tip_speed_forward_neg = models.FloatField(blank=True, null=True)
    head_tip_speed_forward_pos = models.FloatField(blank=True, null=True)
    head_tip_speed_paused = models.FloatField(blank=True, null=True)
    head_tip_speed_paused_abs = models.FloatField(blank=True, null=True)
    head_tip_speed_paused_neg = models.FloatField(blank=True, null=True)
    head_tip_speed_paused_pos = models.FloatField(blank=True, null=True)
    head_tip_speed_backward = models.FloatField(blank=True, null=True)
    head_tip_speed_backward_abs = models.FloatField(blank=True, null=True)
    head_tip_speed_backward_neg = models.FloatField(blank=True, null=True)
    head_tip_speed_backward_pos = models.FloatField(blank=True, null=True)
    head_speed = models.FloatField(blank=True, null=True)
    head_speed_abs = models.FloatField(blank=True, null=True)
    head_speed_neg = models.FloatField(blank=True, null=True)
    head_speed_pos = models.FloatField(blank=True, null=True)
    head_speed_forward = models.FloatField(blank=True, null=True)
    head_speed_forward_abs = models.FloatField(blank=True, null=True)
    head_speed_forward_neg = models.FloatField(blank=True, null=True)
    head_speed_forward_pos = models.FloatField(blank=True, null=True)
    head_speed_paused = models.FloatField(blank=True, null=True)
    head_speed_paused_abs = models.FloatField(blank=True, null=True)
    head_speed_paused_neg = models.FloatField(blank=True, null=True)
    head_speed_paused_pos = models.FloatField(blank=True, null=True)
    head_speed_backward = models.FloatField(blank=True, null=True)
    head_speed_backward_abs = models.FloatField(blank=True, null=True)
    head_speed_backward_neg = models.FloatField(blank=True, null=True)
    head_speed_backward_pos = models.FloatField(blank=True, null=True)
    midbody_speed = models.FloatField(blank=True, null=True)
    midbody_speed_abs = models.FloatField(blank=True, null=True)
    midbody_speed_neg = models.FloatField(blank=True, null=True)
    midbody_speed_pos = models.FloatField(blank=True, null=True)
    midbody_speed_forward = models.FloatField(blank=True, null=True)
    midbody_speed_forward_abs = models.FloatField(blank=True, null=True)
    midbody_speed_forward_neg = models.FloatField(blank=True, null=True)
    midbody_speed_forward_pos = models.FloatField(blank=True, null=True)
    midbody_speed_paused = models.FloatField(blank=True, null=True)
    midbody_speed_paused_abs = models.FloatField(blank=True, null=True)
    midbody_speed_paused_neg = models.FloatField(blank=True, null=True)
    midbody_speed_paused_pos = models.FloatField(blank=True, null=True)
    midbody_speed_backward = models.FloatField(blank=True, null=True)
    midbody_speed_backward_abs = models.FloatField(blank=True, null=True)
    midbody_speed_backward_neg = models.FloatField(blank=True, null=True)
    midbody_speed_backward_pos = models.FloatField(blank=True, null=True)
    tail_speed = models.FloatField(blank=True, null=True)
    tail_speed_abs = models.FloatField(blank=True, null=True)
    tail_speed_neg = models.FloatField(blank=True, null=True)
    tail_speed_pos = models.FloatField(blank=True, null=True)
    tail_speed_forward = models.FloatField(blank=True, null=True)
    tail_speed_forward_abs = models.FloatField(blank=True, null=True)
    tail_speed_forward_neg = models.FloatField(blank=True, null=True)
    tail_speed_forward_pos = models.FloatField(blank=True, null=True)
    tail_speed_paused = models.FloatField(blank=True, null=True)
    tail_speed_paused_abs = models.FloatField(blank=True, null=True)
    tail_speed_paused_neg = models.FloatField(blank=True, null=True)
    tail_speed_paused_pos = models.FloatField(blank=True, null=True)
    tail_speed_backward = models.FloatField(blank=True, null=True)
    tail_speed_backward_abs = models.FloatField(blank=True, null=True)
    tail_speed_backward_neg = models.FloatField(blank=True, null=True)
    tail_speed_backward_pos = models.FloatField(blank=True, null=True)
    tail_tip_speed = models.FloatField(blank=True, null=True)
    tail_tip_speed_abs = models.FloatField(blank=True, null=True)
    tail_tip_speed_neg = models.FloatField(blank=True, null=True)
    tail_tip_speed_pos = models.FloatField(blank=True, null=True)
    tail_tip_speed_forward = models.FloatField(blank=True, null=True)
    tail_tip_speed_forward_abs = models.FloatField(blank=True, null=True)
    tail_tip_speed_forward_neg = models.FloatField(blank=True, null=True)
    tail_tip_speed_forward_pos = models.FloatField(blank=True, null=True)
    tail_tip_speed_paused = models.FloatField(blank=True, null=True)
    tail_tip_speed_paused_abs = models.FloatField(blank=True, null=True)
    tail_tip_speed_paused_neg = models.FloatField(blank=True, null=True)
    tail_tip_speed_paused_pos = models.FloatField(blank=True, null=True)
    tail_tip_speed_backward = models.FloatField(blank=True, null=True)
    tail_tip_speed_backward_abs = models.FloatField(blank=True, null=True)
    tail_tip_speed_backward_neg = models.FloatField(blank=True, null=True)
    tail_tip_speed_backward_pos = models.FloatField(blank=True, null=True)
    head_tip_motion_direction = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_abs = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_neg = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_pos = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_forward = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_forward_abs = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_forward_neg = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_forward_pos = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_paused = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_paused_abs = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_paused_neg = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_paused_pos = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_backward = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_backward_abs = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_backward_neg = models.FloatField(blank=True, null=True)
    head_tip_motion_direction_backward_pos = models.FloatField(blank=True, null=True)
    head_motion_direction = models.FloatField(blank=True, null=True)
    head_motion_direction_abs = models.FloatField(blank=True, null=True)
    head_motion_direction_neg = models.FloatField(blank=True, null=True)
    head_motion_direction_pos = models.FloatField(blank=True, null=True)
    head_motion_direction_forward = models.FloatField(blank=True, null=True)
    head_motion_direction_forward_abs = models.FloatField(blank=True, null=True)
    head_motion_direction_forward_neg = models.FloatField(blank=True, null=True)
    head_motion_direction_forward_pos = models.FloatField(blank=True, null=True)
    head_motion_direction_paused = models.FloatField(blank=True, null=True)
    head_motion_direction_paused_abs = models.FloatField(blank=True, null=True)
    head_motion_direction_paused_neg = models.FloatField(blank=True, null=True)
    head_motion_direction_paused_pos = models.FloatField(blank=True, null=True)
    head_motion_direction_backward = models.FloatField(blank=True, null=True)
    head_motion_direction_backward_abs = models.FloatField(blank=True, null=True)
    head_motion_direction_backward_neg = models.FloatField(blank=True, null=True)
    head_motion_direction_backward_pos = models.FloatField(blank=True, null=True)
    midbody_motion_direction = models.FloatField(blank=True, null=True)
    midbody_motion_direction_abs = models.FloatField(blank=True, null=True)
    midbody_motion_direction_neg = models.FloatField(blank=True, null=True)
    midbody_motion_direction_pos = models.FloatField(blank=True, null=True)
    midbody_motion_direction_forward = models.FloatField(blank=True, null=True)
    midbody_motion_direction_forward_abs = models.FloatField(blank=True, null=True)
    midbody_motion_direction_forward_neg = models.FloatField(blank=True, null=True)
    midbody_motion_direction_forward_pos = models.FloatField(blank=True, null=True)
    midbody_motion_direction_paused = models.FloatField(blank=True, null=True)
    midbody_motion_direction_paused_abs = models.FloatField(blank=True, null=True)
    midbody_motion_direction_paused_neg = models.FloatField(blank=True, null=True)
    midbody_motion_direction_paused_pos = models.FloatField(blank=True, null=True)
    midbody_motion_direction_backward = models.FloatField(blank=True, null=True)
    midbody_motion_direction_backward_abs = models.FloatField(blank=True, null=True)
    midbody_motion_direction_backward_neg = models.FloatField(blank=True, null=True)
    midbody_motion_direction_backward_pos = models.FloatField(blank=True, null=True)
    tail_motion_direction = models.FloatField(blank=True, null=True)
    tail_motion_direction_abs = models.FloatField(blank=True, null=True)
    tail_motion_direction_neg = models.FloatField(blank=True, null=True)
    tail_motion_direction_pos = models.FloatField(blank=True, null=True)
    tail_motion_direction_forward = models.FloatField(blank=True, null=True)
    tail_motion_direction_forward_abs = models.FloatField(blank=True, null=True)
    tail_motion_direction_forward_neg = models.FloatField(blank=True, null=True)
    tail_motion_direction_forward_pos = models.FloatField(blank=True, null=True)
    tail_motion_direction_paused = models.FloatField(blank=True, null=True)
    tail_motion_direction_paused_abs = models.FloatField(blank=True, null=True)
    tail_motion_direction_paused_neg = models.FloatField(blank=True, null=True)
    tail_motion_direction_paused_pos = models.FloatField(blank=True, null=True)
    tail_motion_direction_backward = models.FloatField(blank=True, null=True)
    tail_motion_direction_backward_abs = models.FloatField(blank=True, null=True)
    tail_motion_direction_backward_neg = models.FloatField(blank=True, null=True)
    tail_motion_direction_backward_pos = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_abs = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_neg = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_pos = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_forward = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_forward_abs = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_forward_neg = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_forward_pos = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_paused = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_paused_abs = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_paused_neg = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_paused_pos = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_backward = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_backward_abs = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_backward_neg = models.FloatField(blank=True, null=True)
    tail_tip_motion_direction_backward_pos = models.FloatField(blank=True, null=True)
    foraging_amplitude = models.FloatField(blank=True, null=True)
    foraging_amplitude_abs = models.FloatField(blank=True, null=True)
    foraging_amplitude_neg = models.FloatField(blank=True, null=True)
    foraging_amplitude_pos = models.FloatField(blank=True, null=True)
    foraging_amplitude_forward = models.FloatField(blank=True, null=True)
    foraging_amplitude_forward_abs = models.FloatField(blank=True, null=True)
    foraging_amplitude_forward_neg = models.FloatField(blank=True, null=True)
    foraging_amplitude_forward_pos = models.FloatField(blank=True, null=True)
    foraging_amplitude_paused = models.FloatField(blank=True, null=True)
    foraging_amplitude_paused_abs = models.FloatField(blank=True, null=True)
    foraging_amplitude_paused_neg = models.FloatField(blank=True, null=True)
    foraging_amplitude_paused_pos = models.FloatField(blank=True, null=True)
    foraging_amplitude_backward = models.FloatField(blank=True, null=True)
    foraging_amplitude_backward_abs = models.FloatField(blank=True, null=True)
    foraging_amplitude_backward_neg = models.FloatField(blank=True, null=True)
    foraging_amplitude_backward_pos = models.FloatField(blank=True, null=True)
    foraging_speed = models.FloatField(blank=True, null=True)
    foraging_speed_abs = models.FloatField(blank=True, null=True)
    foraging_speed_neg = models.FloatField(blank=True, null=True)
    foraging_speed_pos = models.FloatField(blank=True, null=True)
    foraging_speed_forward = models.FloatField(blank=True, null=True)
    foraging_speed_forward_abs = models.FloatField(blank=True, null=True)
    foraging_speed_forward_neg = models.FloatField(blank=True, null=True)
    foraging_speed_forward_pos = models.FloatField(blank=True, null=True)
    foraging_speed_paused = models.FloatField(blank=True, null=True)
    foraging_speed_paused_abs = models.FloatField(blank=True, null=True)
    foraging_speed_paused_neg = models.FloatField(blank=True, null=True)
    foraging_speed_paused_pos = models.FloatField(blank=True, null=True)
    foraging_speed_backward = models.FloatField(blank=True, null=True)
    foraging_speed_backward_abs = models.FloatField(blank=True, null=True)
    foraging_speed_backward_neg = models.FloatField(blank=True, null=True)
    foraging_speed_backward_pos = models.FloatField(blank=True, null=True)
    head_crawling_amplitude = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_abs = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_neg = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_pos = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_forward = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_forward_abs = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_forward_neg = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_forward_pos = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_paused = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_paused_abs = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_paused_neg = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_paused_pos = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_backward = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_backward_abs = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_backward_neg = models.FloatField(blank=True, null=True)
    head_crawling_amplitude_backward_pos = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_abs = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_neg = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_pos = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_forward = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_forward_abs = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_forward_neg = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_forward_pos = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_paused = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_paused_abs = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_paused_neg = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_paused_pos = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_backward = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_backward_abs = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_backward_neg = models.FloatField(blank=True, null=True)
    midbody_crawling_amplitude_backward_pos = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_abs = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_neg = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_pos = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_forward = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_forward_abs = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_forward_neg = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_forward_pos = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_paused = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_paused_abs = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_paused_neg = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_paused_pos = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_backward = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_backward_abs = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_backward_neg = models.FloatField(blank=True, null=True)
    tail_crawling_amplitude_backward_pos = models.FloatField(blank=True, null=True)
    head_crawling_frequency = models.FloatField(blank=True, null=True)
    head_crawling_frequency_abs = models.FloatField(blank=True, null=True)
    head_crawling_frequency_neg = models.FloatField(blank=True, null=True)
    head_crawling_frequency_pos = models.FloatField(blank=True, null=True)
    head_crawling_frequency_forward = models.FloatField(blank=True, null=True)
    head_crawling_frequency_forward_abs = models.FloatField(blank=True, null=True)
    head_crawling_frequency_forward_neg = models.FloatField(blank=True, null=True)
    head_crawling_frequency_forward_pos = models.FloatField(blank=True, null=True)
    head_crawling_frequency_paused = models.FloatField(blank=True, null=True)
    head_crawling_frequency_paused_abs = models.FloatField(blank=True, null=True)
    head_crawling_frequency_paused_neg = models.FloatField(blank=True, null=True)
    head_crawling_frequency_paused_pos = models.FloatField(blank=True, null=True)
    head_crawling_frequency_backward = models.FloatField(blank=True, null=True)
    head_crawling_frequency_backward_abs = models.FloatField(blank=True, null=True)
    head_crawling_frequency_backward_neg = models.FloatField(blank=True, null=True)
    head_crawling_frequency_backward_pos = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_abs = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_neg = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_pos = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_forward = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_forward_abs = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_forward_neg = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_forward_pos = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_paused = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_paused_abs = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_paused_neg = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_paused_pos = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_backward = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_backward_abs = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_backward_neg = models.FloatField(blank=True, null=True)
    midbody_crawling_frequency_backward_pos = models.FloatField(blank=True, null=True)
    tail_crawling_frequency = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_abs = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_neg = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_pos = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_forward = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_forward_abs = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_forward_neg = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_forward_pos = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_paused = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_paused_abs = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_paused_neg = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_paused_pos = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_backward = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_backward_abs = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_backward_neg = models.FloatField(blank=True, null=True)
    tail_crawling_frequency_backward_pos = models.FloatField(blank=True, null=True)
    path_range = models.FloatField(blank=True, null=True)
    path_range_forward = models.FloatField(blank=True, null=True)
    path_range_paused = models.FloatField(blank=True, null=True)
    path_range_backward = models.FloatField(blank=True, null=True)
    path_curvature = models.FloatField(blank=True, null=True)
    path_curvature_abs = models.FloatField(blank=True, null=True)
    path_curvature_neg = models.FloatField(blank=True, null=True)
    path_curvature_pos = models.FloatField(blank=True, null=True)
    path_curvature_forward = models.FloatField(blank=True, null=True)
    path_curvature_forward_abs = models.FloatField(blank=True, null=True)
    path_curvature_forward_neg = models.FloatField(blank=True, null=True)
    path_curvature_forward_pos = models.FloatField(blank=True, null=True)
    path_curvature_paused = models.FloatField(blank=True, null=True)
    path_curvature_paused_abs = models.FloatField(blank=True, null=True)
    path_curvature_paused_neg = models.FloatField(blank=True, null=True)
    path_curvature_paused_pos = models.FloatField(blank=True, null=True)
    path_curvature_backward = models.FloatField(blank=True, null=True)
    path_curvature_backward_abs = models.FloatField(blank=True, null=True)
    path_curvature_backward_neg = models.FloatField(blank=True, null=True)
    path_curvature_backward_pos = models.FloatField(blank=True, null=True)
    coil_time = models.FloatField(blank=True, null=True)
    inter_coil_time = models.FloatField(blank=True, null=True)
    inter_coil_distance = models.FloatField(blank=True, null=True)
    coils_frequency = models.FloatField(blank=True, null=True)
    coils_time_ratio = models.FloatField(blank=True, null=True)
    omega_turn_time = models.FloatField(blank=True, null=True)
    omega_turn_time_abs = models.FloatField(blank=True, null=True)
    omega_turn_time_neg = models.FloatField(blank=True, null=True)
    omega_turn_time_pos = models.FloatField(blank=True, null=True)
    inter_omega_time = models.FloatField(blank=True, null=True)
    inter_omega_time_abs = models.FloatField(blank=True, null=True)
    inter_omega_time_neg = models.FloatField(blank=True, null=True)
    inter_omega_time_pos = models.FloatField(blank=True, null=True)
    inter_omega_distance = models.FloatField(blank=True, null=True)
    inter_omega_distance_abs = models.FloatField(blank=True, null=True)
    inter_omega_distance_neg = models.FloatField(blank=True, null=True)
    inter_omega_distance_pos = models.FloatField(blank=True, null=True)
    omega_turns_frequency = models.FloatField(blank=True, null=True)
    omega_turns_time_ratio = models.FloatField(blank=True, null=True)
    upsilon_turn_time = models.FloatField(blank=True, null=True)
    upsilon_turn_time_abs = models.FloatField(blank=True, null=True)
    upsilon_turn_time_neg = models.FloatField(blank=True, null=True)
    upsilon_turn_time_pos = models.FloatField(blank=True, null=True)
    inter_upsilon_time = models.FloatField(blank=True, null=True)
    inter_upsilon_time_abs = models.FloatField(blank=True, null=True)
    inter_upsilon_time_neg = models.FloatField(blank=True, null=True)
    inter_upsilon_time_pos = models.FloatField(blank=True, null=True)
    inter_upsilon_distance = models.FloatField(blank=True, null=True)
    inter_upsilon_distance_abs = models.FloatField(blank=True, null=True)
    inter_upsilon_distance_neg = models.FloatField(blank=True, null=True)
    inter_upsilon_distance_pos = models.FloatField(blank=True, null=True)
    upsilon_turns_frequency = models.FloatField(blank=True, null=True)
    upsilon_turns_time_ratio = models.FloatField(blank=True, null=True)
    forward_time = models.FloatField(blank=True, null=True)
    forward_distance = models.FloatField(blank=True, null=True)
    inter_forward_time = models.FloatField(blank=True, null=True)
    inter_forward_distance = models.FloatField(blank=True, null=True)
    forward_motion_frequency = models.FloatField(blank=True, null=True)
    forward_motion_time_ratio = models.FloatField(blank=True, null=True)
    forward_motion_distance_ratio = models.FloatField(blank=True, null=True)
    paused_time = models.FloatField(blank=True, null=True)
    paused_distance = models.FloatField(blank=True, null=True)
    inter_paused_time = models.FloatField(blank=True, null=True)
    inter_paused_distance = models.FloatField(blank=True, null=True)
    paused_motion_frequency = models.FloatField(blank=True, null=True)
    paused_motion_time_ratio = models.FloatField(blank=True, null=True)
    paused_motion_distance_ratio = models.FloatField(blank=True, null=True)
    backward_time = models.FloatField(blank=True, null=True)
    backward_distance = models.FloatField(blank=True, null=True)
    inter_backward_time = models.FloatField(blank=True, null=True)
    inter_backward_distance = models.FloatField(blank=True, null=True)
    backward_motion_frequency = models.FloatField(blank=True, null=True)
    backward_motion_time_ratio = models.FloatField(blank=True, null=True)
    backward_motion_distance_ratio = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'features_means'


class Foods(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'foods'


class Genes(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'genes'


class Habituations(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'habituations'


class ResultsSummary(models.Model):
    experiment = models.OneToOneField(Experiments, models.DO_NOTHING, primary_key=True)
    n_valid_frames = models.IntegerField(blank=True, null=True)
    n_missing_frames = models.IntegerField(blank=True, null=True)
    n_segmented_skeletons = models.IntegerField(blank=True, null=True)
    n_filtered_skeletons = models.IntegerField(blank=True, null=True)
    n_valid_skeletons = models.IntegerField(blank=True, null=True)
    n_timestamps = models.IntegerField(blank=True, null=True)
    first_skel_frame = models.IntegerField(blank=True, null=True)
    last_skel_frame = models.IntegerField(blank=True, null=True)
    fps = models.FloatField(blank=True, null=True)
    total_time = models.FloatField(blank=True, null=True)
    mask_file_sizemb = models.FloatField(db_column='mask_file_sizeMB', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'results_summary'


class SegwormComparisons(models.Model):
    experiment = models.ForeignKey(Experiments, models.DO_NOTHING)
    segworm_feature = models.ForeignKey('SegwormInfo', models.DO_NOTHING)
    n_mutual_skeletons = models.IntegerField(blank=True, null=True)
    error_05th = models.FloatField(blank=True, null=True)
    error_50th = models.FloatField(blank=True, null=True)
    error_95th = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'segworm_comparisons'


class SegwormInfo(models.Model):
    segworm_file = models.CharField(max_length=700, blank=True, null=True)
    experiment = models.ForeignKey(Experiments, models.DO_NOTHING, blank=True, null=True)
    fps = models.FloatField(blank=True, null=True)
    total_time = models.FloatField(blank=True, null=True)
    n_segworm_skeletons = models.IntegerField(blank=True, null=True)
    n_timestamps = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'segworm_info'


class Sexes(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'sexes'


class Strains(models.Model):
    name = models.CharField(unique=True, max_length=100)
    description = models.CharField(max_length=200, blank=True, null=True)
    gene = models.ForeignKey(Genes, models.DO_NOTHING)
    allele = models.ForeignKey(Alleles, models.DO_NOTHING)
    chromosome_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'strains'


class Trackers(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'trackers'


class VentralSides(models.Model):
    name = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'ventral_sides'
