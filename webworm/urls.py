from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^tables$', views.tables, name='tables'),
    url(r'^summary$', views.summary, name='summary'),
]
