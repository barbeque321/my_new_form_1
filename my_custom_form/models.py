from django.db import models
from django.core.validators import ProhibitNullCharactersValidator
from osm_field.fields import LatitudeField, LongitudeField, OSMField

# class User(models.Model):
#     city_name = models.CharField(max_length=40)
#     street_name = models.CharField(max_length=40)
#     adress = models.CharField(max_length=40, blank=True)

class MyModel(models.Model):
    location = OSMField()
    location_lat = LatitudeField()
    location_lon = LongitudeField()