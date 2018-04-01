from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^wconviewer', views.wconviewer, name='wconviewer'),
    url(r'^upload', views.upload, name='upload'),
    url(r'^contributors', views.contrib, name='contributors'),
    url(r'^release', views.release, name='release'),
    url(r'^feedback', views.feedback, name='feedback'),
]
