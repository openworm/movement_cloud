from django.urls import re_path

from . import views

urlpatterns = [
    re_path(r'^$', views.index, name='index'),
    re_path(r'^wconviewer', views.wconviewer, name='wconviewer'),
    re_path(r'^upload', views.upload, name='upload'),
    re_path(r'^contributors', views.contrib, name='contributors'),
    re_path(r'^release', views.release, name='release'),
    re_path(r'^feedback', views.feedback, name='feedback'),
]
