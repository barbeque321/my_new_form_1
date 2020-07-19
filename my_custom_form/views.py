from django.shortcuts import render
from django.views.generic import CreateView
from .models import User

class UserCreateView(CreateView):
    model = User
    template_name =  'login.html'
    fields = ('city_name', 'street_name', 'adress')