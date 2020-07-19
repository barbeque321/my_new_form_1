from django.shortcuts import render
from django.views.generic import CreateView
# from .models import User
from .forms import MyModelForm
from .models import MyModel

# class UserCreateView(CreateView):
#     model = User
#     template_name =  'login.html'
#     fields = ('city_name', 'street_name', 'adress')



class MyCreateView(CreateView):
    form_class = MyModelForm
    model = MyModel