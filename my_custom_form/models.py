from django.db import models
from django.core.validators import ProhibitNullCharactersValidator

class User(models.Model):
    city_name = models.CharField(max_length=40)
    street_name = models.CharField(max_length=40)
    adress = models.CharField(max_length=40, blank=True)