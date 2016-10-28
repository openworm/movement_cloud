from django.shortcuts import render
from django.http import HttpResponse

from .models import *

# Create your views here.

def index(request):
    experiments_list = Experiments.objects.order_by('base_name');
    context = {'experiments_list': experiments_list}
    return render(request,'webworm/index.html',context)
