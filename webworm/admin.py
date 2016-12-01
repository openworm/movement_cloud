from django.contrib import admin
from . import models

# Register your models here.
for cls_name in dir(models):
    if not(cls_name[:1] == '_' or cls_name in ['models', 'unicode_literals']):
        admin.site.register(getattr(models, cls_name))
