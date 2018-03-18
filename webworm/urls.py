from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^wconviewer', views.wconviewer, name='wconviewer'),
    url(r'^upload', views.upload, name='upload'),
]
